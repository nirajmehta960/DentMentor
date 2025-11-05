import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// --- INLINED UTILS START (to fix module resolution issues) ---

const APP_NAME = process.env.APP_NAME || "DentMentor";
const EMAIL_FROM = process.env.EMAIL_FROM;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 1. URL Helper
function getAppBaseUrl(): string {
    if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL.replace(/\/$/, "");
    if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
    if (process.env.VERCEL_URL) {
        const url = process.env.VERCEL_URL;
        return url.startsWith("http") ? url.replace(/\/$/, "") : `https://${url}`.replace(/\/$/, "");
    }
    return "http://localhost:8080";
}

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

// 3. Email Sending Logic
async function sendBookingConfirmationEmailsDeduped({
    reservationId, sessionId, mentorTimezone = "UTC", menteeTimezone = "UTC"
}: any) {
    if (!process.env.RESEND_API_KEY || !EMAIL_FROM) {
        console.error("Missing email configuration");
        return { success: false, error: "Configuration missing" };
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase credentials");

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    if (!sessionId || !reservationId || !UUID_REGEX.test(sessionId) || !UUID_REGEX.test(reservationId)) {
        throw new Error("Invalid/Missing ID format");
    }

    const { data: reservation } = await supabase.from("booking_reservations").select("*").eq("id", reservationId).single();
    if (!reservation) throw new Error("Reservation not found");

    const { data: session } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
    if (!session) throw new Error("Session not found");

    const { data: mentorProfile } = await supabase.from("mentor_profiles").select("user_id, timezone").eq("id", reservation.mentor_id).single();
    if (!mentorProfile) throw new Error("Mentor profile not found");
    const { data: mentorUser } = await supabase.auth.admin.getUserById(mentorProfile.user_id);
    const mentorEmail = mentorUser?.user?.email;
    const { data: mentorPublic } = await supabase.from("profiles").select("first_name, last_name").eq("user_id", mentorProfile.user_id).single();
    const mentorName = mentorPublic ? `${mentorPublic.first_name} ${mentorPublic.last_name || ''}`.trim() : "Mentor";

    const { data: menteeUser } = await supabase.auth.admin.getUserById(reservation.mentee_user_id);
    const menteeEmail = menteeUser?.user?.email;
    const { data: menteeProfile } = await supabase.from("mentee_profiles").select("timezone").eq("user_id", reservation.mentee_user_id).single();
    const { data: menteePublic } = await supabase.from("profiles").select("first_name, last_name").eq("user_id", reservation.mentee_user_id).single();
    const menteeName = menteePublic ? `${menteePublic.first_name} ${menteePublic.last_name || ''}`.trim() : "Student";

    if (!mentorEmail || !menteeEmail) throw new Error("Missing emails");

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

    let menteeSent = false;
    if (!reservation.mentee_email_sent_at) {
        const { data: updated } = await supabase
            .from("booking_reservations")
            .update({ mentee_email_sent_at: new Date().toISOString() })
            .eq("id", reservationId)
            .is("mentee_email_sent_at", null)
            .select();

        if (updated && updated.length > 0) {
            try {
                await resend.emails.send({
                    from: EMAIL_FROM, to: menteeEmail, subject: `Booking confirmed: ${serviceTitle}`,
                    html: createMenteeBookingConfirmedEmailHTML({
                        menteeName, mentorName, serviceTitle, sessionDate: session.session_date,
                        durationMinutes: session.duration_minutes, price: session.price_paid,
                        dashboardUrl: menteeDashboardUrl, timezone: resolvedMenteeTimezone
                    }),
                });
                menteeSent = true;
            } catch (e) { console.error("Mentee email failed", e); }
        } else { menteeSent = true; }
    } else { menteeSent = true; }

    let mentorSent = false;
    if (!reservation.mentor_email_sent_at) {
        const { data: updated } = await supabase
            .from("booking_reservations")
            .update({ mentor_email_sent_at: new Date().toISOString() })
            .eq("id", reservationId)
            .is("mentor_email_sent_at", null)
            .select();

        if (updated && updated.length > 0) {
            try {
                await resend.emails.send({
                    from: EMAIL_FROM, to: mentorEmail, subject: `New booking confirmed: ${serviceTitle}`,
                    html: createMentorBookingConfirmedEmailHTML({
                        mentorName, menteeName, serviceTitle, sessionDate: session.session_date,
                        durationMinutes: session.duration_minutes, price: session.price_paid,
                        dashboardUrl: mentorDashboardUrl, timezone: resolvedMentorTimezone
                    }),
                });
                mentorSent = true;
            } catch (e) { console.error("Mentor email failed", e); }
        } else { mentorSent = true; }
    } else { mentorSent = true; }

    return { menteeSent, mentorSent };
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

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const reservationId = session.metadata?.reservation_id;
                const sessionId = session.id;
                const paymentIntentId = session.payment_intent as string;

                log(`Processing checkout.session.completed`, { reservationId, sessionId, paymentIntentId });

                if (!reservationId) {
                    log("Missing reservation_id in metadata", {}, 'error');
                    return res.status(400).json({ error: "Missing metadata" });
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
                    return res.status(500).json({ error: confirmError.message });
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

                } catch (emailErr: any) {
                    log("Failed to execute email service", { error: emailErr?.message || emailErr }, 'error');
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

        return res.status(200).json({ received: true });
    } catch (err: any) {
        console.error(JSON.stringify({
            level: 'error',
            message: `Webhook processing failed: ${err.message}`,
            stack: err.stack,
            eventId: event?.id
        }));
        return res.status(500).json({ error: "Webhook handler failed" });
    }
}
