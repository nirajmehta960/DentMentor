import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";


// Initialize Stripe Helper
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing in environment variables.");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20" as any,
    });
};

// Initialize Supabase Helper
const getSupabase = () => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase credentials (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    // Structured Logging Helper
    const log = (message: string, data: any = {}, level: 'info' | 'warn' | 'error' = 'info') => {
        console.log(JSON.stringify({
            timestamp,
            level,
            requestId,
            message,
            ...data
        }));
    };

    try {
        log("Handler started", { method: req.method });

        // Set Request ID Header
        res.setHeader("x-request-id", requestId);

        // --- Strict CORS Setup ---
        const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
            .split(",")
            .map(o => o.trim())
            .filter(Boolean);

        const defaultAllowed = ["http://localhost:3000", "http://localhost:8080"];
        const origin = req.headers.origin;
        let isAllowed = false;

        if (origin) {
            if (allowedOrigins.includes(origin) || defaultAllowed.includes(origin)) {
                isAllowed = true;
            } else if (origin.endsWith(".vercel.app")) {
                isAllowed = true;
            }
        }

        if (isAllowed && origin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        }

        if (req.method === "OPTIONS") {
            if (isAllowed) return res.status(200).end();
            return res.status(403).end();
        }

        if (!isAllowed) {
            log(`Blocked CORS request from origin: ${origin}`, { origin }, 'warn');
            return res.status(403).json({ error: "Forbidden: Origin not allowed", requestId });
        }
        // --- End CORS Setup ---

        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed", requestId });
        }

        // 1. Auth Enforcement
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header", requestId });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = getSupabase();

        // Verify the user via Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            log("Auth verification failed", { authError }, 'warn');
            return res.status(401).json({ error: "Invalid or expired token", requestId });
        }

        // 2. Parse Body (Only accepted field: reservationId)
        const { reservationId } = req.body;

        if (!reservationId) {
            return res.status(400).json({ error: "reservationId is required.", requestId });
        }

        log("Processing checkout for reservation", { reservationId, userId: user.id });

        // --- Secure URL Derivation ---
        // --- Secure URL Derivation (Inlined to avoid module config issues) ---
        const getAppBaseUrl = () => {
            if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL.replace(/\/$/, "");
            if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
            if (process.env.VERCEL_URL) {
                const url = process.env.VERCEL_URL;
                return url.startsWith("http") ? url.replace(/\/$/, "") : `https://${url}`.replace(/\/$/, "");
            }
            return "http://localhost:8080";
        };

        const appUrl = getAppBaseUrl();


        // 3. Fetch Reservation & Validate Data Source of Truth
        // We strictly use DB data, ignoring any client inputs likely injected into body
        const { data: reservation, error: dbError } = await supabase
            .from("booking_reservations")
            .select(`
                *,
                mentor_profiles:mentor_id (user_id),
                mentor_services:service_id (service_title)
            `)
            .eq("id", reservationId)
            .single();

        if (dbError || !reservation) {
            log("Reservation fetch error", { dbError }, 'error');
            return res.status(404).json({ error: "Reservation not found.", requestId });
        }

        // 4. Validate User Ownership
        if (reservation.mentee_user_id !== user.id) {
            log("User mismatch", { expected: reservation.mentee_user_id, actual: user.id }, 'warn');
            return res.status(403).json({ error: "You are not authorized to pay for this reservation.", requestId });
        }

        // 5. Validate Status
        const validStatuses = ['pending_payment', 'held'];
        if (!validStatuses.includes(reservation.status)) {
            if (reservation.status === 'confirmed' || reservation.status === 'paid') {
                return res.status(409).json({ error: "This reservation is already paid.", requestId });
            }
            if (reservation.status === 'expired' || reservation.status === 'cancelled') {
                return res.status(410).json({ error: "This reservation has expired or was cancelled.", requestId });
            }
            return res.status(400).json({ error: `Invalid status: ${reservation.status}`, requestId });
        }

        // Check Expiration
        if (reservation.expires_at && new Date(reservation.expires_at) < new Date()) {
            return res.status(410).json({ error: "Reservation hold has expired.", requestId });
        }

        const stripe = getStripe();

        // 6. Reuse Existing Session if Valid
        if (reservation.stripe_checkout_session_id) {
            try {
                const existingSession = await stripe.checkout.sessions.retrieve(reservation.stripe_checkout_session_id);
                if (existingSession && existingSession.status === 'open') {
                    log("Returning existing open session", { sessionId: existingSession.id });
                    return res.status(200).json({ checkoutUrl: existingSession.url, requestId });
                }
            } catch (ignore) {
                // Session might depend on old key or be purged, proceed to create new
            }
        }

        // 7. Create Stripe Session (Strictly from DB Data)
        log("Creating new Stripe session...");

        // Ensure amount is valid
        if (!reservation.price_cents || reservation.price_cents < 50) {
            log("Invalid price amount", { price_cents: reservation.price_cents }, 'error');
            // Try fallback to amount_total if price_cents is missing (legacy compat)
            if (!reservation.amount_total || reservation.amount_total < 50) {
                return res.status(500).json({ error: "Invalid price configuration for this service.", requestId });
            }
        }

        const finalAmount = reservation.amount_total || reservation.price_cents;
        const serviceTitle = reservation.mentor_services?.service_title || "Mentorship Session";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: reservation.currency || "usd",
                        product_data: {
                            name: serviceTitle,
                            description: `Session with Mentor`,
                            metadata: {
                                // STRICT: DB values only
                                service_id: reservation.service_id,
                                mentor_id: reservation.mentor_id,
                            },
                        },
                        unit_amount: finalAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservationId}`,
            cancel_url: `${appUrl}/booking/cancel?reservation_id=${reservationId}`,
            client_reference_id: reservationId,
            metadata: {
                // STRICT: DB values, no client input
                reservation_id: reservation.id,
                mentee_user_id: reservation.mentee_user_id, // Authenticated user ID
                mentor_id: reservation.mentor_id,
                service_id: reservation.service_id,
                type: "session_booking"
            },
            customer_email: user.email, // Use authenticated user email
            customer_creation: "if_required",
        }, {
            idempotencyKey: `checkout_session_${reservationId}`
        });

        log("Stripe session created", { sessionId: session.id });

        // 8. Update Reservation with new Session ID
        await supabase
            .from("booking_reservations")
            .update({ stripe_checkout_session_id: session.id })
            .eq("id", reservationId);

        return res.status(200).json({ checkoutUrl: session.url, requestId });

    } catch (err: any) {
        log("Critical Error", { error: err.message, stack: err.stack }, 'error');
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
            requestId
        });
    }
}
