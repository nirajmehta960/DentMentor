import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// --- INLINED EMAIL LOGIC START ---
// Initialize Resend lazily
const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is missing/undefined");
    }
    return new Resend(process.env.RESEND_API_KEY);
};

const EMAIL_FROM = process.env.EMAIL_FROM;
const APP_NAME = process.env.APP_NAME || "DentMentor";
// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


interface BookingEmailParams {
    menteeName: string;
    mentorName: string;
    serviceTitle: string;
    sessionDate: string;
    durationMinutes: number;
    price: number;
    dashboardUrl: string;
    timezone: string;
}

// Helper function to get timezone abbreviation
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

const createMenteeBookingConfirmedEmailHTML = ({
    menteeName,
    mentorName,
    serviceTitle,
    sessionDate,
    durationMinutes,
    price,
    dashboardUrl,
    timezone,
}: BookingEmailParams) => {
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: timezone,
    }).format(new Date(sessionDate));

    const timezoneAbbr = getTimezoneAbbr(timezone);
    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0FDFA;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);">
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${APP_NAME}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">Booking Confirmed</p>
    </div>
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Your session is confirmed, ${menteeName}!</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        Your mentorship session with ${mentorName} has been successfully booked. We're excited to help you on your journey!
      </p>
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Session Details</h3>
        <div style="color: #475569; font-size: 14px; margin: 0; line-height: 1.8;">
          <p style="margin: 0 0 12px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          <p style="margin: 0 0 12px 0;"><strong>Date & Time:</strong> ${formattedDate} (${timezoneAbbr})</p>
          <p style="margin: 0 0 12px 0;"><strong>Duration:</strong> ${durationMinutes} minutes</p>
          <p style="margin: 0;"><strong>Total:</strong> ${formattedPrice}</p>
        </div>
      </div>
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">
        View Booking
      </a>
      <p style="color: #64748B; font-size: 14px; margin: 32px 0 0 0; line-height: 1.5;">
        We'll send you a reminder before your session. See you soon!
      </p>
    </div>
    <div style="background-color: #F0FDFA; padding: 24px 32px; text-align: center; border-top: 1px solid #CCFBF1;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
      <p style="color: #64748B; font-size: 12px; margin: 0;">
        This email confirms your booking on ${APP_NAME}.
      </p>
    </div>
  </div>
</body>
</html>
`;
};

const createMentorBookingConfirmedEmailHTML = ({
    mentorName,
    menteeName,
    serviceTitle,
    sessionDate,
    durationMinutes,
    price,
    dashboardUrl,
    timezone,
}: BookingEmailParams) => {
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: timezone,
    }).format(new Date(sessionDate));

    const timezoneAbbr = getTimezoneAbbr(timezone);
    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking - ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0FDFA;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);">
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${APP_NAME}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">New Booking Received</p>
    </div>
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">New session booked, ${mentorName}!</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        ${menteeName} has booked a mentorship session with you. Thank you for making a difference in their dental career journey.
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
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">
        View Session
      </a>
      <p style="color: #64748B; font-size: 14px; margin: 32px 0 0 0; line-height: 1.5;">
        We'll send you a reminder before the session. Prepare to make an impact!
      </p>
    </div>
    <div style="background-color: #F0FDFA; padding: 24px 32px; text-align: center; border-top: 1px solid #CCFBF1;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
      <p style="color: #64748B; font-size: 12px; margin: 0;">
        This email confirms a new booking on ${APP_NAME}.
      </p>
    </div>
  </div>
</body>
</html>
`;
};

async function sendBookingConfirmationEmails(
    sessionId: string,
    reservationId: string,
    mentorTimezoneParam?: string,
    menteeTimezoneParam?: string
) {
    // Check for required environment variables
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY not configured");
    }

    if (!EMAIL_FROM) {
        throw new Error("EMAIL_FROM not configured");
    }

    // In local webhook context, supabase init is outside
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Supabase configuration not found");
    }

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    if (!sessionId || !reservationId) throw new Error("sessionId and reservationId are required");

    // 0) Check deduplication status
    const { data: reservation, error: resError } = await supabase
        .from("booking_reservations")
        .select("mentee_email_sent_at, mentor_email_sent_at, service_id")
        .eq("id", reservationId)
        .single();

    if (resError || !reservation) throw new Error(`Reservation lookup failed: ${resError?.message}`);

    const validatedMentorTimezone = mentorTimezoneParam || "UTC";
    const validatedMenteeTimezone = menteeTimezoneParam || "UTC";

    if (typeof sessionId !== "string" || !UUID_REGEX.test(sessionId)) {
        throw new Error("sessionId must be a valid UUID string");
    }

    // 1) Fetch session
    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("session_date, mentor_id, mentee_id, duration_minutes, status, payment_status, price_paid")
        .eq("id", sessionId)
        .single();

    if (sessionError || !session) {
        throw new Error(`Session not found: ${sessionError?.message}`);
    }

    // 2) Fetch mentor
    const { data: mentorProfile, error: mentorError } = await supabase
        .from("mentor_profiles")
        .select("professional_headline, user_id")
        .eq("id", session.mentor_id)
        .single();

    if (mentorError || !mentorProfile) throw new Error(`Mentor profile not found: ${mentorError?.message}`);

    // 3) Fetch mentee
    const { data: menteeProfile, error: menteeError } = await supabase
        .from("mentee_profiles")
        .select("user_id")
        .eq("id", session.mentee_id)
        .single();

    if (menteeError || !menteeProfile) throw new Error(`Mentee profile not found: ${menteeError?.message}`);

    // Mentee Details
    const { data: menteeProfileDetails } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", menteeProfile.user_id)
        .single();

    // 4) Fetch service info from reservations
    let serviceData = null;
    try {
        const { data: reservations } = await supabase
            .from("booking_reservations")
            .select("service_id")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: false })
            .limit(1);

        if (reservations && reservations.length > 0 && reservations[0].service_id) {
            const { data: mentorService } = await supabase
                .from("mentor_services")
                .select("service_title, price, duration_minutes")
                .eq("id", reservations[0].service_id)
                .single();
            serviceData = mentorService;
        }
    } catch (e: any) { console.warn("Fetch service error", e); }

    // 5) Fetch emails
    const { data: mentorUser } = await supabase.auth.admin.getUserById(mentorProfile.user_id);
    const { data: menteeUser } = await supabase.auth.admin.getUserById(menteeProfile.user_id);

    const mentorEmail = mentorUser?.user?.email;
    const menteeEmail = menteeUser?.user?.email;

    if (!mentorEmail || !menteeEmail) throw new Error("Mentor or Mentee email not found");

    const menteeName = menteeProfileDetails?.first_name
        ? `${menteeProfileDetails.first_name} ${menteeProfileDetails.last_name || ''}`
        : "Student";

    let mentorProfileDetails = null;
    const { data: mpd } = await supabase.from("profiles").select("first_name, last_name").eq("user_id", mentorProfile.user_id).single();
    mentorProfileDetails = mpd;

    const mentorName = mentorProfileDetails?.first_name
        ? `${mentorProfileDetails.first_name} ${mentorProfileDetails.last_name || ''}`
        : "Mentor";

    const serviceTitle = serviceData?.service_title || "Mentorship Session";
    const durationMinutes = serviceData?.duration_minutes || session.duration_minutes;
    const price = serviceData?.price || session.price_paid || 0;

    const baseUrl = process.env.VITE_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
    const menteeDashboardUrl = `${baseUrl}/mentee-dashboard?tab=sessions`;
    const mentorDashboardUrl = `${baseUrl}/dashboard?tab=sessions`;

    const menteeEmailParams = {
        menteeName, mentorName, serviceTitle, sessionDate: session.session_date, durationMinutes, price, dashboardUrl: menteeDashboardUrl, timezone: validatedMenteeTimezone
    };
    const mentorEmailParams = {
        menteeName, mentorName, serviceTitle, sessionDate: session.session_date, durationMinutes, price, dashboardUrl: mentorDashboardUrl, timezone: validatedMentorTimezone
    };

    let menteeEmailSent = false;
    let mentorEmailSent = false;
    let menteeEmailError = null;
    let mentorEmailError = null;

    // Send Mentee Email if not sent
    if (!reservation.mentee_email_sent_at) {
        try {
            const resend = getResend();
            await resend.emails.send({
                from: EMAIL_FROM,
                to: menteeEmail,
                subject: `Booking confirmed: ${serviceTitle}`,
                html: createMenteeBookingConfirmedEmailHTML(menteeEmailParams),
            });
            menteeEmailSent = true;
            // Update DB immediately
            await supabase.from("booking_reservations").update({ mentee_email_sent_at: new Date().toISOString() }).eq("id", reservationId);
        } catch (e: any) { menteeEmailError = e.message; console.error("Mentee email failed", e); }
    } else {
        console.log("Mentee email already sent. Skipping.");
        menteeEmailSent = true;
    }

    // Send Mentor Email if not sent
    if (!reservation.mentor_email_sent_at) {
        try {
            const resend = getResend();
            await resend.emails.send({
                from: EMAIL_FROM,
                to: mentorEmail,
                subject: `New booking confirmed: ${serviceTitle}`,
                html: createMentorBookingConfirmedEmailHTML(mentorEmailParams),
            });
            mentorEmailSent = true;
            // Update DB immediately
            await supabase.from("booking_reservations").update({ mentor_email_sent_at: new Date().toISOString() }).eq("id", reservationId);
        } catch (e: any) { mentorEmailError = e.message; console.error("Mentor email failed", e); }
    } else {
        console.log("Mentor email already sent. Skipping.");
        mentorEmailSent = true;
    }

    return { success: menteeEmailSent || mentorEmailSent, menteeEmailSent, mentorEmailSent, menteeEmailError, mentorEmailError };
}
// --- INLINED EMAIL LOGIC END ---

// Helper for safe init
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY");
    }
    // Using 'as any' to avoid strict TypeScript errors with specific Stripe library versions
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

    // Structured logging helper
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
                    log(`Attempting to send emails`, { confirmedSessionId });
                    // Use INLINED function with reservationId for deduplication
                    const result = await sendBookingConfirmationEmails(confirmedSessionId, reservationId);

                    if (result.success) {
                        log("Emails sent/verified successfully");
                    } else {
                        log("Email sending failed partially or fully", { result }, 'error');
                    }

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
