import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// --- INLINED UTILS START (to fix module resolution issues) ---

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

const APP_NAME = process.env.APP_NAME || "DentMentor";
const EMAIL_FROM = process.env.EMAIL_FROM;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 1. URL Helper
function getAppBaseUrl(): string {
    // 1. Production/Explicit overrides (safe sources)
    const explicitUrl = process.env.APP_URL ?? process.env.VITE_APP_URL;

    // 2. Production safety check:
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        if (explicitUrl) {
            return explicitUrl.replace(/\/$/, "");
        }
        if (process.env.VERCEL_URL) {
            const url = process.env.VERCEL_URL;
            return url.startsWith("http") ? url.replace(/\/$/, "") : `https://${url}`.replace(/\/$/, "");
        }
        throw new AppError("CONFIG_ERROR", "Missing APP_URL or VITE_APP_URL in production environment", 500);
    }

    // 3. Local Development Fallbacks
    return explicitUrl?.replace(/\/$/, "") ?? "http://localhost:8080";
}

// ... (Email Templates and other helpers remain unchanged, skipping for brevity in replacement chunk if possible, but simplest to overwrite the function and keep helpers if range allows. 
// Wait, the range 6-312 covers EVERYTHING inline. That's huge. 
// I should use `multi_replace_file_content` or targeted `replace_file_content`.
// The user prompt implies I should just do it. I will use `replace_file_content` but I need to be careful not to delete the helper functions `createBaseEmailHTML`, etc.
// I will target the `sendBookingConfirmationEmailsDeduped` function specifically and the start of the file separately? 
// Or I can just overwrite the `sendBookingConfirmationEmailsDeduped` function and add AppError above it? No, AppError needs to be available generally.
// I'll add AppError at the top, and replace the function at the bottom.
// I'll use MULTI_REPLACE.

// PART 1: Add AppError
// PART 2: Replace sendBookingConfirmationEmailsDeduped
// PART 3: Update `handler` call site (Wait, that's in `handler` function, outside the utils block).

// I will switch to `multi_replace_file_content`.

// Re-planning for `multi_replace_file_content`.
// Chunk 1: Insert AppError after line 6.
// Chunk 2: Replace `sendBookingConfirmationEmailsDeduped`.
// Chunk 3: Update call site in `handler`.



// 2. Email Templates
const getTimezoneAbbr = (timezone: string): string => {
    try {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "short",
        });
        const parts = formatter.formatToParts(new Date());
        const tzName = parts.find((part) => part.type === "timeZoneName");
        return tzName?.value || timezone;
    } catch (error) {
        return timezone;
    }
};

const createBaseEmailHTML = (
    title: string,
    headerTitle: string,
    headerSubtitle: string,
    contentHTML: string,
    footerText: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0FDFA;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);">
    <div style="background-color: #0D9488; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${headerTitle}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">${headerSubtitle}</p>
    </div>
    <div style="padding: 40px 32px; text-align: center;">
      ${contentHTML}
    </div>
    <div style="background-color: #F0FDFA; padding: 24px 32px; text-align: center; border-top: 1px solid #CCFBF1;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
      <p style="color: #64748B; font-size: 12px; margin: 0;">
        ${footerText}
      </p>
    </div>
  </div>
</body>
</html>
`;

const createMenteeBookingConfirmedEmailHTML = ({
    menteeName, mentorName, serviceTitle, sessionDate, durationMinutes, price, dashboardUrl, timezone,
}: any) => {
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: timezone,
    }).format(new Date(sessionDate));
    const timezoneAbbr = getTimezoneAbbr(timezone);
    const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

    const contentHTML = `
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Your session is confirmed, ${menteeName}!</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        Your mentorship session with ${mentorName} has been successfully booked.
      </p>
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Session Details</h3>
        <div style="color: #475569; font-size: 14px; margin: 0; line-height: 1.8;">
          <p style="margin: 0 0 12px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          <p style="margin: 0 0 12px 0;"><strong>Mentor:</strong> ${mentorName}</p>
          <p style="margin: 0 0 12px 0;"><strong>Date & Time:</strong> ${formattedDate} (${timezoneAbbr})</p>
          <p style="margin: 0 0 12px 0;"><strong>Duration:</strong> ${durationMinutes} minutes</p>
          <p style="margin: 0;"><strong>Total:</strong> ${formattedPrice}</p>
        </div>
      </div>
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #0D9488; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0;">View Booking</a>
    `;
    return createBaseEmailHTML(`Booking Confirmed - ${APP_NAME}`, APP_NAME, "Booking Confirmed", contentHTML, `This email confirms your booking on ${APP_NAME}.`);
};

const createMentorBookingConfirmedEmailHTML = ({
    mentorName, menteeName, serviceTitle, sessionDate, durationMinutes, price, dashboardUrl, timezone,
}: any) => {
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: timezone,
    }).format(new Date(sessionDate));
    const timezoneAbbr = getTimezoneAbbr(timezone);
    const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

    const contentHTML = `
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">New session booked, ${mentorName}!</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        ${menteeName} has booked a mentorship session with you.
      </p>
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Session Details</h3>
        <div style="color: #475569; font-size: 14px; margin: 0; line-height: 1.8;">
          <p style="margin: 0 0 12px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          <p style="margin: 0 0 12px 0;"><strong>Student:</strong> ${menteeName}</p>
          <p style="margin: 0 0 12px 0;"><strong>Date & Time:</strong> ${formattedDate} (${timezoneAbbr})</p>
          <p style="margin: 0 0 12px 0;"><strong>Duration:</strong> ${durationMinutes} minutes</p>
          <p style="margin: 0;"><strong>Amount:</strong> ${formattedPrice}</p>
        </div>
      </div>
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #0D9488; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0;">View Session</a>
    `;
    return createBaseEmailHTML(`New Booking - ${APP_NAME}`, APP_NAME, "New Booking Received", contentHTML, `This email confirms a new booking on ${APP_NAME}.`);
};

// 4. Calendar Helper
const generateICS = ({
    sessionId,
    startTimeUTC,
    durationMinutes,
    serviceTitle,
    mentorName,
    menteeName,
    dashboardUrl,
}: any) => {
    const start = new Date(startTimeUTC);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const formatDate = (date: Date) =>
        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const now = formatDate(new Date());
    const dtStart = formatDate(start);
    const dtEnd = formatDate(end);

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DentMentor//Booking//EN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        `UID:dentmentor-${sessionId}@dentmentor.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:DentMentor Session: ${serviceTitle}`,
        `DESCRIPTION:Mentorship session between ${mentorName} and ${menteeName}.\\n\\nView details: ${dashboardUrl}`,
        "LOCATION:DentMentor",
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
};

// 5. Email Sending Logic
async function sendBookingConfirmationEmailsDeduped({
    reservationId, sessionId, mentorTimezone = "UTC", menteeTimezone = "UTC"
}: any) {
    const errors: string[] = [];

    if (!process.env.RESEND_API_KEY || !EMAIL_FROM) {
        throw new AppError("CONFIG_ERROR", "Missing email configuration", 500);
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) throw new AppError("CONFIG_ERROR", "Missing Supabase credentials", 500);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    if (!sessionId || !reservationId || !UUID_REGEX.test(sessionId) || !UUID_REGEX.test(reservationId)) {
        throw new AppError("VALIDATION_ERROR", "Invalid/Missing ID format", 400);
    }

    const { data: reservation } = await supabase.from("booking_reservations").select("*").eq("id", reservationId).single();
    if (!reservation) throw new AppError("NOT_FOUND", "Reservation not found", 404);

    const { data: session } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
    if (!session) throw new AppError("NOT_FOUND", "Session not found", 404);

    const { data: mentorProfile } = await supabase.from("mentor_profiles").select("user_id, timezone").eq("id", reservation.mentor_id).single();
    if (!mentorProfile) throw new AppError("NOT_FOUND", "Mentor profile not found", 500);
    const { data: mentorUser } = await supabase.auth.admin.getUserById(mentorProfile.user_id);
    const mentorEmail = mentorUser?.user?.email;
    const { data: mentorPublic } = await supabase.from("profiles").select("first_name, last_name").eq("user_id", mentorProfile.user_id).single();
    const mentorName = mentorPublic ? `${mentorPublic.first_name} ${mentorPublic.last_name || ''}`.trim() : "Mentor";

    const { data: menteeUser } = await supabase.auth.admin.getUserById(reservation.mentee_user_id);
    const menteeEmail = menteeUser?.user?.email;
    const { data: menteeProfile } = await supabase.from("mentee_profiles").select("timezone").eq("user_id", reservation.mentee_user_id).single();
    const { data: menteePublic } = await supabase.from("profiles").select("first_name, last_name").eq("user_id", reservation.mentee_user_id).single();
    const menteeName = menteePublic ? `${menteePublic.first_name} ${menteePublic.last_name || ''}`.trim() : "Student";

    if (!mentorEmail || !menteeEmail) throw new AppError("DATA_ERROR", "Missing emails", 400);

    const resolvedMentorTimezone = mentorProfile.timezone || mentorTimezone;
    const resolvedMenteeTimezone = menteeProfile?.timezone || menteeTimezone;

    let serviceTitle = "Mentorship Session";
    if (reservation.service_id) {
        const { data: service } = await supabase.from("mentor_services").select("service_title").eq("id", reservation.service_id).single();
        if (service?.service_title) serviceTitle = service.service_title;
    }

    const baseUrl = getAppBaseUrl();
    const menteeDashboardUrl = `${baseUrl}/mentee-dashboard?tab=sessions`;
    const mentorDashboardUrl = `${baseUrl}/dashboard?tab=sessions`;

    // Generate ICS content
    const icsContent = generateICS({
        sessionId,
        startTimeUTC: session.session_date,
        durationMinutes: session.duration_minutes,
        serviceTitle,
        mentorName,
        menteeName,
        dashboardUrl: menteeDashboardUrl // Using generic dashboard link, could customize per user if needed
    });

    const icsAttachment = {
        filename: "dentmentor-session.ics",
        content: Buffer.from(icsContent).toString("base64"),
        contentType: "text/calendar; charset=utf-8",
    };

    let menteeSent = false;
    // Check if previously sent
    if (reservation.mentee_email_sent_at) {
        console.log(`[Email] Skipping mentee email (already sent at ${reservation.mentee_email_sent_at})`, { reservationId });
    } else {
        try {
            await resend.emails.send({
                from: EMAIL_FROM, to: menteeEmail, subject: `Booking confirmed: ${serviceTitle}`,
                html: createMenteeBookingConfirmedEmailHTML({
                    menteeName, mentorName, serviceTitle, sessionDate: session.session_date,
                    durationMinutes: session.duration_minutes, price: session.price_paid,
                    dashboardUrl: menteeDashboardUrl, timezone: resolvedMenteeTimezone
                }),
                attachments: [icsAttachment]
            });
            console.log(`[Email] Mentee email sent successfully`, { reservationId, menteeEmail });
            menteeSent = true;

            // Update DB after success
            await supabase
                .from("booking_reservations")
                .update({ mentee_email_sent_at: new Date().toISOString() })
                .eq("id", reservationId);

        } catch (e: any) {
            console.error("Mentee email failed", e);
            errors.push(`Mentee email failed: ${e.message}`);
        }
    }

    let mentorSent = false;
    // Check if previously sent
    if (reservation.mentor_email_sent_at) {
        console.log(`[Email] Skipping mentor email (already sent at ${reservation.mentor_email_sent_at})`, { reservationId });
    } else {
        try {
            await resend.emails.send({
                from: EMAIL_FROM, to: mentorEmail, subject: `New booking confirmed: ${serviceTitle}`,
                html: createMentorBookingConfirmedEmailHTML({
                    mentorName, menteeName, serviceTitle, sessionDate: session.session_date,
                    durationMinutes: session.duration_minutes, price: session.price_paid,
                    dashboardUrl: mentorDashboardUrl, timezone: resolvedMentorTimezone
                }),
                attachments: [icsAttachment]
            });
            console.log(`[Email] Mentor email sent successfully`, { reservationId, mentorEmail });
            mentorSent = true;

            // Update DB after success
            await supabase
                .from("booking_reservations")
                .update({ mentor_email_sent_at: new Date().toISOString() })
                .eq("id", reservationId);

        } catch (e: any) {
            console.error("Mentor email failed", e);
            errors.push(`Mentor email failed: ${e.message}`);
        }
    }

    return { menteeSent, mentorSent, errors };
}

// --- INLINED UTILS END ---

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20" as any,
    });
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
}

export const config = {
    api: {
        bodyParser: false,
    },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", (err) => reject(err));
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        console.error("Missing Stripe Signature or Webhook Secret");
        return res.status(400).json({ error: "Missing signature or secret" });
    }

    let event: Stripe.Event;
    let rawBody: Buffer;

    try {
        const stripe = getStripe();
        rawBody = await getRawBody(req);
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const log = (message: string, context: any = {}, level: 'info' | 'warn' | 'error' = 'info') => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            eventId: event?.id,
            eventType: event?.type,
            message,
            ...context
        }));
    };

    // --- IDEMPOTENCY CHECK START ---
    const stripeEventId = event.id;
    const stripeEventType = event.type;
    const eventObject = event.data.object as any;
    const reservationId = eventObject.metadata?.reservation_id || null;
    // Extract likely session ID depending on event type, or null
    const eventSessionId = stripeEventType.startsWith('checkout.session') ? eventObject.id : null;

    try {
        const { error: insertError } = await supabase.from('booking_events').insert({
            event_type: stripeEventType,
            stripe_event_id: stripeEventId,
            reservation_id: reservationId ? reservationId : null,
            stripe_session_id: eventSessionId || 'N/A',
            session_id: null, // Internal session ID is not known yet, will be updated later
            status: 'processing',
            payload: {
                id: eventObject.id,
                metadata: eventObject.metadata,
                payment_intent: eventObject.payment_intent,
                reservation_id: reservationId
            }
        });

        if (insertError) {
            // Check for unique violation (Postgres code 23505)
            if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
                log(`[Idempotency] Event already processed. Skipping.`, { stripeEventId });
                return res.status(200).json({ received: true, idempotent: true });
            }
            // For other errors, we log but might want to proceed or fail.
            // Failing ensures we don't process without a trace.
            log(`[Idempotency] Failed to insert event record`, { error: insertError }, 'error');
            throw insertError;
        }
    } catch (err: any) {
        log(`[Idempotency] Critical error inserting event`, { error: err?.message }, 'error');
        return res.status(500).json({ error: "Failed to track event" });
    }
    // --- IDEMPOTENCY CHECK END ---

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const reservationId = session.metadata?.reservation_id;
                const sessionId = session.id;
                const paymentIntentId = session.payment_intent as string;

                log(`Processing checkout.session.completed`, { reservationId, sessionId, paymentIntentId });

                if (!reservationId) {
                    throw new Error("Missing reservation_id in metadata");
                }

                // 1. Confirm Booking (RPC)
                const { data: confirmData, error: confirmError } = await supabase.rpc(
                    "confirm_booking_payment",
                    {
                        p_reservation_id: reservationId,
                        p_stripe_checkout_id: sessionId,
                        p_stripe_payment_intent_id: paymentIntentId,
                    }
                );

                if (confirmError) {
                    log("Error confirming booking", { error: confirmError }, 'error');
                    throw confirmError;
                }

                const resultStatus = (confirmData as any)?.status;
                const confirmedSessionId = (confirmData as any)?.session_id;

                if (resultStatus === 'already_processed') {
                    log(`Booking already processed. Continuing to verify emails...`, { reservationId });
                }

                try {
                    log(`Attempting to send emails (deduped)`, { confirmedSessionId, reservationId });

                    // Use INLINED version
                    const result = await sendBookingConfirmationEmailsDeduped({
                        reservationId,
                        sessionId: confirmedSessionId
                    });

                    log("Email process completed", { result });

                    if (result.errors && result.errors.length > 0) {
                        log("Partial email failure", { errors: result.errors }, 'warn');
                    }

                    // Update booking event with session link if available
                    if (confirmedSessionId) {
                        await supabase.from('booking_events')
                            .update({ session_id: confirmedSessionId })
                            .eq('stripe_event_id', stripeEventId);
                    }

                } catch (emailErr: any) {
                    log("Failed to execute email service", { error: emailErr?.message || emailErr }, 'error');
                    // We don't fail the whole webhook for emails, but we log it
                }

                break;
            }

            case "checkout.session.expired": {
                const session = event.data.object as Stripe.Checkout.Session;
                const reservationId = session.metadata?.reservation_id;

                log(`Processing checkout.session.expired`, { reservationId });

                if (reservationId) {
                    const { error: cancelError } = await supabase.rpc('cancel_booking_hold', {
                        p_reservation_id: reservationId
                    });

                    if (cancelError) {
                        log("Error releasing expired hold", { error: cancelError }, 'error');
                        throw cancelError;
                    } else {
                        log("Successfully released hold", { reservationId });
                    }
                }
                break;
            }

            case "payment_intent.payment_failed": {
                log("Payment failed", { paymentIntentId: (event.data.object as any).id }, 'warn');
                break;
            }

            default:
                log(`Unhandled event type`, { type: event.type });
        }

        // --- SUCCESS UPDATE ---
        await supabase.from('booking_events')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('stripe_event_id', stripeEventId);

        return res.status(200).json({ received: true });

    } catch (err: any) {
        console.error(JSON.stringify({
            level: 'error',
            message: `Webhook processing failed: ${err.message}`,
            stack: err.stack,
            eventId: event?.id
        }));

        // --- FAILURE UPDATE ---
        await supabase.from('booking_events')
            .update({
                status: 'failed',
                error_message: err.message || 'Unknown error',
                updated_at: new Date().toISOString()
            })
            .eq('stripe_event_id', stripeEventId);

        return res.status(500).json({ error: "Webhook handler failed" });
    }
}
