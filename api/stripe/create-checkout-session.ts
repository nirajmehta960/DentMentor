import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe Helper
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing in environment variables.");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-09-30.acacia" as any,
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

// Debugging helper
const log = (msg: string, ...args: any[]) => console.log(`[Stripe Checkout] ${msg}`, ...args);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        log("Handler started", req.method);

        // CORS Setup
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }

        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const { reservationId, menteeId, serviceId, origin } = req.body;
        log("Request body parsed", { reservationId, menteeId, serviceId });

        if (!reservationId) {
            return res.status(400).json({ error: "Booking reservation ID is required. Please select a slot first." });
        }

        if (!origin) {
            return res.status(400).json({ error: "Origin URL is required for redirects." });
        }

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
            console.error("Reservation fetch error:", dbError);
            return res.status(404).json({ error: "Reservation not found or expired.", details: dbError });
        }
        log("Reservation fetched successfully", reservation.id);

        // 2. Validate Status
        if (reservation.status !== "pending_payment" && reservation.status !== "held") {
            log("Invalid status:", reservation.status);
            if (reservation.status === 'confirmed' || reservation.status === 'paid') {
                return res.status(409).json({ error: "This reservation is already paid." });
            }
            if (reservation.status === 'expired') {
                return res.status(410).json({ error: "This reservation has expired. Please book again." });
            }
            return res.status(400).json({ error: `Invalid reservation status: ${reservation.status}` });
        }

        // 4. Create Stripe Checkout Session
        log("Creating Stripe session...");

        const stripe = getStripe();

        // Ensure amount is valid
        if (!reservation.amount_total || reservation.amount_total < 50) { // Stripe minimum is 50 cents usually
            log("Amount invalid:", reservation.amount_total);
            // Fallback or error?
            // If amount_total is null, something is wrong.
            if (!reservation.amount_total) {
                return res.status(500).json({ error: "Reservation invalid: missing amount." });
            }
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
            success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservationId}`,
            cancel_url: `${origin}/booking/cancel?reservation_id=${reservationId}`,
            client_reference_id: reservationId, // Critical for Webhook correlation
            metadata: {
                reservation_id: reservationId,
                mentee_user_id: reservation.mentee_user_id,
                mentor_id: reservation.mentor_id,
                service_id: serviceId || reservation.service_id,
                type: "session_booking"
            },
            customer_email: undefined,
        });

        log("Stripe session created", session.id);

        // 5. Update Reservation
        await supabase
            .from("booking_reservations")
            .update({ stripe_checkout_session_id: session.id })
            .eq("id", reservationId);

        // 6. Return URL
        return res.status(200).json({ checkoutUrl: session.url });

    } catch (err: any) {
        console.error("Critical Stripe Checkout Error:", err);
        // Ensure we always return JSON, even for runtime crashes
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        });
    }
}
