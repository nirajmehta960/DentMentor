import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Initialize Stripe Helper
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing in environment variables.");
    }
    // Using 'as any' to avoid strict TypeScript errors with specific Stripe library versions (e.g. .clover)
    // Ensure this version matches your Stripe Dashboard webhook version
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

        // Always allow localhost in dev for DX
        const defaultAllowed = ["http://localhost:3000", "http://localhost:8080"];
        const origin = req.headers.origin;

        let isAllowed = false;

        if (origin) {
            if (allowedOrigins.includes(origin) || defaultAllowed.includes(origin)) {
                isAllowed = true;
            } else if (origin.endsWith(".vercel.app")) {
                // Optional: Allow all Vercel preview deployments
                isAllowed = true;
            }
        }

        if (isAllowed && origin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            // res.setHeader("Access-Control-Allow-Credentials", "true"); // Only if needed
        }

        if (req.method === "OPTIONS") {
            if (isAllowed) {
                return res.status(200).end();
            }
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

        const { reservationId, menteeId, serviceId } = req.body;
        log("Request body parsed", { reservationId, menteeId, serviceId });

        if (!reservationId) {
            return res.status(400).json({ error: "Booking reservation ID is required. Please select a slot first.", requestId });
        }

        // --- Secure URL Derivation Start ---
        let appUrl = process.env.VITE_APP_URL || process.env.APP_URL;

        if (!appUrl) {
            const host = req.headers.host;
            if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
                appUrl = `http://${host}`;
            } else if (host && host.endsWith('.vercel.app')) {
                // Trust Vercel preview/production URLs if needed, or strictly require env var
                appUrl = `https://${host}`;
            } else {
                // Fallback or Error? 
                // For security, strictly requiring env var in production is best, but for DX we allow localhost.
                log("VITE_APP_URL not set. Falling back to host header.", { host }, 'warn');
                appUrl = `https://${host}`; // Default to https for unknown hosts
            }
        }

        // Ensure no trailing slash for cleaner concatenation
        appUrl = appUrl?.replace(/\/$/, "");

        if (!appUrl) {
            return res.status(500).json({ error: "Server configuration error: Missing App URL.", requestId });
        }
        // --- Secure URL Derivation End ---

        // Initialize Supabase Client (Lazy)
        const supabase = getSupabase();

        // 1. Fetch Reservation & Validate Protocol
        log("Fetching reservation from DB...");
        const { data: reservation, error: dbError } = await supabase
            .from("booking_reservations")
            .select(`
        *,
        mentor_profiles:mentor_id (
          user_id
        ),
        mentor_services:service_id (
          service_title
        )
      `)
            .eq("id", reservationId)
            .single();

        if (dbError || !reservation) {
            log("Reservation fetch error", { dbError }, 'error');
            return res.status(404).json({ error: "Reservation not found or expired.", details: dbError, requestId });
        }
        log("Reservation fetched successfully", { reservationId: reservation.id });

        // 2. Validate Status
        if (reservation.status !== "pending_payment" && reservation.status !== "held") {
            log("Invalid status", { status: reservation.status }, 'warn');
            if (reservation.status === 'confirmed' || reservation.status === 'paid') {
                return res.status(409).json({ error: "This reservation is already paid.", requestId });
            }
            if (reservation.status === 'expired') {
                return res.status(410).json({ error: "This reservation has expired. Please book again.", requestId });
            }
            return res.status(400).json({ error: `Invalid reservation status: ${reservation.status}`, requestId });
        }

        const stripe = getStripe();

        // 3. (Idempotency) Check for existing session via DB
        if (reservation.stripe_checkout_session_id) {
            try {
                log("Checking existing session", { stripeCheckoutSessionId: reservation.stripe_checkout_session_id });
                const existingSession = await stripe.checkout.sessions.retrieve(reservation.stripe_checkout_session_id);

                if (existingSession && existingSession.status === 'open') {
                    log("Returning existing open session");
                    return res.status(200).json({ checkoutUrl: existingSession.url, requestId });
                }
                log("Existing session not open", { status: existingSession.status });
            } catch (retrieveError: any) {
                log("Failed to retrieve existing session", { error: retrieveError.message }, 'warn');
                // Fallthrough to create new one
            }
        }

        // 4. Create Stripe Checkout Session
        log("Creating Stripe session...");

        // Ensure amount is valid
        if (!reservation.amount_total || reservation.amount_total < 50) { // Stripe minimum is 50 cents usually
            log("Amount invalid", { amount: reservation.amount_total }, 'error');
            // Fallback or error?
            // If amount_total is null, something is wrong.
            if (!reservation.amount_total) {
                return res.status(500).json({ error: "Reservation invalid: missing amount.", requestId });
            }
        }

        // Fetch Mentee Email for pre-fill
        let customerEmail: string | undefined = undefined;
        try {
            const { data: menteeUser, error: userError } = await supabase.auth.admin.getUserById(reservation.mentee_user_id);
            if (!userError && menteeUser?.user?.email) {
                customerEmail = menteeUser.user.email;
            }
        } catch (emailFetchErr) {
            log("Could not fetch mentee email for pre-fill", { emailFetchErr }, 'warn');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: reservation.currency || "usd",
                        product_data: {
                            name: reservation.mentor_services?.service_title || "Mentorship Session",
                            description: `Session with Mentor`,
                            metadata: {
                                service_id: serviceId,
                                mentor_id: reservation.mentor_id,
                            },
                        },
                        unit_amount: reservation.amount_total, // Trusted from DB
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservationId}`,
            cancel_url: `${appUrl}/booking/cancel?reservation_id=${reservationId}`,
            client_reference_id: reservationId, // Critical for Webhook correlation
            metadata: {
                reservation_id: reservationId,
                mentee_user_id: reservation.mentee_user_id,
                mentor_id: reservation.mentor_id,
                service_id: serviceId || reservation.service_id,
                type: "session_booking"
            },
            customer_email: customerEmail,
            customer_creation: "if_required",
        }, {
            idempotencyKey: `checkout_session_${reservationId}`
        });

        log("Stripe session created", { sessionId: session.id, idempotencyKey: `checkout_session_${reservationId}` });

        // 5. Update Reservation
        await supabase
            .from("booking_reservations")
            .update({ stripe_checkout_session_id: session.id })
            .eq("id", reservationId);

        // 6. Return URL
        return res.status(200).json({ checkoutUrl: session.url, requestId });

    } catch (err: any) {
        log("Critical Stripe Checkout Error", { error: err.message, stack: err.stack }, 'error');
        // Ensure we always return JSON, even for runtime crashes
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
            requestId,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        });
    }
}
