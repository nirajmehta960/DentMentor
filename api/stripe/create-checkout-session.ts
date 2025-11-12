import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

/**
 * Standard Application Error
 */
export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isRetryable: boolean;
    public readonly details?: any;

    constructor(
        code: string,
        message: string,
        statusCode: number = 500,
        isRetryable: boolean = false,
        details?: any
    ) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.statusCode = statusCode;
        this.isRetryable = isRetryable;
        this.details = details;
    }
}

/**
 * Generates a consistent error response structure
 */
export const toErrorResponse = (error: any, requestId: string) => {
    // Default to handling unknown errors
    const response = {
        ok: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
            requestId,
            details: undefined as any
        }
    };

    let statusCode = 500;

    if (error instanceof AppError) {
        response.error.code = error.code;
        response.error.message = error.message;
        response.error.details = error.details;
        statusCode = error.statusCode;
    } else if (error instanceof Error) {
        // Handle generic JS errors safely
        response.error.message = error.message;

        // Handle Stripe Errors specifically if reachable
        if ((error as any).type?.startsWith('Stripe')) {
            response.error.code = (error as any).code || 'STRIPE_ERROR';
            statusCode = (error as any).statusCode || 500;
        }
    }

    return { response, statusCode };
};

/**
 * Extract or generate Request ID
 */
export const withRequestId = (req: VercelRequest): string => {
    const existingId = req.headers['x-request-id'];
    if (Array.isArray(existingId)) return existingId[0];
    if (existingId) return existingId;
    return uuidv4();
};

// Initialize Stripe Helper
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new AppError("CONFIG_ERROR", "STRIPE_SECRET_KEY is missing.", 500);
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
        throw new AppError("CONFIG_ERROR", "Missing Supabase credentials.", 500);
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const requestId = withRequestId(req);
    const timestamp = new Date().toISOString();

    // Structured Logging Helper
    const log = (message: string, data: any = {}, level: 'info' | 'warn' | 'error' = 'info') => {
        console.log(JSON.stringify({
            timestamp,
            level,
            requestId,
            route: 'create-checkout-session',
            message,
            ...data
        }));
    };

    try {
        log("Handler started", { method: req.method });
        res.setHeader("x-request-id", requestId);

        // --- Standard CORS ---
        const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
        const origin = req.headers.origin;
        let isAllowed = false;

        // Default local dev origins
        const defaultAllowed = ["http://localhost:3000", "http://localhost:8080"];

        if (origin) {
            if (allowedOrigins.includes(origin) || defaultAllowed.includes(origin) || origin.endsWith(".vercel.app")) {
                isAllowed = true;
            }
        }

        if (isAllowed && origin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        }

        if (req.method === "OPTIONS") {
            return res.status(isAllowed ? 200 : 403).end();
        }

        if (!isAllowed && origin) {
            log(`Blocked CORS request from origin: ${origin}`, { origin }, 'warn');
            throw new AppError("CORS_ERROR", "Forbidden: Origin not allowed", 403);
        }

        if (req.method !== "POST") {
            throw new AppError("METHOD_NOT_ALLOWED", "Method not allowed", 405);
        }

        // 1. Auth Enforcement
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AppError("UNAUTHORIZED", "Missing Authorization header", 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = getSupabase();

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            log("Auth verification failed", { authError }, 'warn');
            throw new AppError("UNAUTHORIZED", "Invalid or expired token", 401);
        }

        // 2. Parse Body
        const { reservationId } = req.body;
        if (!reservationId) {
            throw new AppError("BAD_REQUEST", "reservationId is required.", 400);
        }

        log("Processing checkout for reservation", { reservationId, userId: user.id });

        // --- Secure URL Derivation (Inlined) ---
        const getAppBaseUrl = () => {
            const explicit = process.env.APP_URL || process.env.VITE_APP_URL;
            if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
                if (explicit) return explicit.replace(/\/$/, "");
                if (process.env.VERCEL_URL) {
                    const vUrl = process.env.VERCEL_URL;
                    return vUrl.startsWith("http") ? vUrl.replace(/\/$/, "") : `https://${vUrl}`.replace(/\/$/, "");
                }
                throw new AppError("CONFIG_ERROR", "Missing APP_URL in production", 500);
            }
            return explicit?.replace(/\/$/, "") || "http://localhost:8080";
        };

        const appUrl = getAppBaseUrl();

        // 3. Fetch Reservation
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
            throw new AppError("NOT_FOUND", "Reservation not found.", 404);
        }

        // 4. Validate User Ownership
        if (reservation.mentee_user_id !== user.id) {
            throw new AppError("FORBIDDEN", "You are not authorized to pay for this reservation.", 403);
        }

        // 5. Validate Status
        const validStatuses = ['pending_payment', 'held'];
        if (!validStatuses.includes(reservation.status)) {
            if (reservation.status === 'confirmed' || reservation.status === 'paid') {
                throw new AppError("CONFLICT", "This reservation is already paid.", 409);
            }
            if (reservation.status === 'expired' || reservation.status === 'cancelled') {
                throw new AppError("GONE", "This reservation has expired or was cancelled.", 410);
            }
            throw new AppError("BAD_REQUEST", `Invalid status: ${reservation.status}`, 400);
        }

        if (reservation.expires_at && new Date(reservation.expires_at) < new Date()) {
            throw new AppError("GONE", "Reservation hold has expired.", 410);
        }

        const stripe = getStripe();

        // 6. Reuse Existing Session if Valid
        if (reservation.stripe_checkout_session_id) {
            try {
                const existingSession = await stripe.checkout.sessions.retrieve(reservation.stripe_checkout_session_id);
                if (existingSession && existingSession.status === 'open') {
                    log("Returning existing open session", { sessionId: existingSession.id });
                    return res.status(200).json({ ok: true, data: { checkoutUrl: existingSession.url }, requestId });
                }
            } catch (ignore) { /* Proceed to create new */ }
        }

        // 7. Create Stripe Session
        log("Creating new Stripe session...");

        let finalAmount = reservation.amount_total || reservation.price_cents;
        if (!finalAmount || finalAmount < 50) {
            console.error("Invalid Amount", { finalAmount, reservation });
            throw new AppError("INTERNAL_ERROR", "Invalid price configuration.", 500);
        }

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
                reservation_id: reservation.id,
                mentee_user_id: reservation.mentee_user_id,
                mentor_id: reservation.mentor_id,
                service_id: reservation.service_id,
                type: "session_booking"
            },
            customer_email: user.email,
            customer_creation: "if_required",
        }, {
            idempotencyKey: `checkout_session_${reservationId}_v2` // Updated key
        });

        // 8. Update Reservation
        await supabase
            .from("booking_reservations")
            .update({ stripe_checkout_session_id: session.id })
            .eq("id", reservationId);

        log("Stripe session created", { sessionId: session.id });

        return res.status(200).json({ ok: true, data: { checkoutUrl: session.url }, requestId });

    } catch (err: any) {
        // Standardized Error Response
        const { response, statusCode } = toErrorResponse(err, requestId);
        log("Request Failed", { statusCode, error: response.error }, 'error');
        return res.status(statusCode).json(response);
    }
}
