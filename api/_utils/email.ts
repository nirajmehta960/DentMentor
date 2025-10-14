import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Initialize Resend lazily
const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is missing/undefined");
    }
    return new Resend(process.env.RESEND_API_KEY);
};

const EMAIL_FROM = process.env.EMAIL_FROM;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

// Mentee Booking Confirmation Email
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
    
    <!-- Header with DentMentor gradient -->
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${APP_NAME}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">Booking Confirmed</p>
    </div>
    
    <!-- Content -->
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
    
    <!-- Footer -->
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

// Mentor Booking Confirmation Email
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
    
    <!-- Header with DentMentor gradient -->
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${APP_NAME}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">New Booking Received</p>
    </div>
    
    <!-- Content -->
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
    
    <!-- Footer -->
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

export async function sendBookingConfirmationEmails(
    sessionId: string,
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

    // Validate required fields
    if (!sessionId) {
        throw new Error("sessionId is required");
    }

    // Validate timezones - use defaults if not provided
    const validatedMentorTimezone = mentorTimezoneParam || "UTC";
    const validatedMenteeTimezone = menteeTimezoneParam || "UTC";

    // Validate sessionId is a valid UUID string
    if (typeof sessionId !== "string" || !UUID_REGEX.test(sessionId)) {
        throw new Error("sessionId must be a valid UUID string");
    }

    // 1) Fetch session by id
    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("session_date, mentor_id, mentee_id, duration_minutes, status, payment_status, price_paid")
        .eq("id", sessionId)
        .single();

    if (sessionError || !session) {
        throw new Error(`Session not found: ${sessionError?.message}`);
    }

    // 2) Fetch mentor profile info
    const { data: mentorProfile, error: mentorError } = await supabase
        .from("mentor_profiles")
        .select("professional_headline, user_id")
        .eq("id", session.mentor_id)
        .single();

    if (mentorError || !mentorProfile) {
        throw new Error(`Mentor profile not found: ${mentorError?.message}`);
    }

    // 3) Fetch mentee profile info
    const { data: menteeProfile, error: menteeError } = await supabase
        .from("mentee_profiles")
        .select("user_id")
        .eq("id", session.mentee_id)
        .single();

    if (menteeError || !menteeProfile) {
        throw new Error(`Mentee profile not found: ${menteeError?.message}`);
    }

    // Get mentee first_name and last_name from profiles table
    const { data: menteeProfileDetails, error: menteeProfileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", menteeProfile.user_id)
        .single();

    if (menteeProfileError) {
        console.warn(`[Booking Confirmation] Mentee profile details not found (using fallback):`, menteeProfileError?.message);
    }

    // 4) Fetch booking_reservations by session_id to get service_id (latest record)
    let serviceData = null;
    try {
        const { data: reservations, error: reservationsError } = await supabase
            .from("booking_reservations")
            .select("service_id")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: false })
            .limit(1);

        if (reservationsError) {
            console.warn(`[Booking Confirmation] Failed to fetch reservations (continuing without service data):`, reservationsError?.message);
        } else if (reservations && reservations.length > 0 && reservations[0].service_id) {
            const serviceId = reservations[0].service_id;

            // 5) Fetch mentor_services by service_id
            const { data: mentorService, error: serviceError } = await supabase
                .from("mentor_services")
                .select("service_title, price, duration_minutes")
                .eq("id", serviceId)
                .single();

            if (serviceError) {
                console.warn(`[Booking Confirmation] Service not found (continuing without service data):`, serviceError?.message);
            } else {
                serviceData = mentorService;
            }
        }
    } catch (error: any) {
        console.warn(`[Booking Confirmation] Error fetching service data (continuing without it):`, error?.message);
    }

    // 6) Fetch emails from Supabase Auth (admin)
    const { data: mentorUser, error: mentorAuthError } = await supabase.auth.admin.getUserById(mentorProfile.user_id);
    if (mentorAuthError || !mentorUser?.user) {
        throw new Error(`Failed to fetch mentor email: ${mentorAuthError?.message}`);
    }

    const { data: menteeUser, error: menteeAuthError } = await supabase.auth.admin.getUserById(menteeProfile.user_id);
    if (menteeAuthError || !menteeUser?.user) {
        throw new Error(`Failed to fetch mentee email: ${menteeAuthError?.message}`);
    }

    const mentorEmail = mentorUser.user.email;
    const menteeEmail = menteeUser.user.email;

    if (!mentorEmail) throw new Error("Mentor email not found");
    if (!menteeEmail) throw new Error("Mentee email not found");

    // Prepare email data
    const menteeName =
        menteeProfileDetails?.first_name && menteeProfileDetails?.last_name
            ? `${menteeProfileDetails.first_name} ${menteeProfileDetails.last_name}`
            : menteeProfileDetails?.first_name || menteeUser.user.email?.split("@")[0] || "Student";

    let mentorProfileDetails = null;
    try {
        const { data, error: mentorProfileDetailsError } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", mentorProfile.user_id)
            .single();

        if (mentorProfileDetailsError) {
            console.warn(`[Booking Confirmation] Mentor profile details not found (using fallback):`, mentorProfileDetailsError?.message);
        } else {
            mentorProfileDetails = data;
        }
    } catch (error: any) {
        console.warn(`[Booking Confirmation] Error fetching mentor profile details (using fallback):`, error?.message);
    }

    const mentorName =
        mentorProfileDetails?.first_name && mentorProfileDetails?.last_name
            ? `${mentorProfileDetails.first_name} ${mentorProfileDetails.last_name}`
            : mentorProfileDetails?.first_name || mentorUser.user.email?.split("@")[0] || "Mentor";

    const serviceTitle = serviceData?.service_title || "Mentorship Session";
    const durationMinutes = serviceData?.duration_minutes || session.duration_minutes;
    const price = serviceData?.price || session.price_paid || 0;

    // Set correct dashboard URLs
    const baseUrl = process.env.VITE_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
    // The frontend might be on a different port in dev (8080), but usually 3000 is fine if strictly backend. 
    // Ideally, use the frontend URL var.
    // Using generic # for now if not set, or relative path relative to the domain email was sent from? No, needs absolute.

    const menteeDashboardUrl = `${baseUrl}/mentee-dashboard?tab=sessions`;
    const mentorDashboardUrl = `${baseUrl}/dashboard?tab=sessions`;

    const menteeEmailParams = {
        menteeName,
        mentorName,
        serviceTitle,
        sessionDate: session.session_date,
        durationMinutes,
        price,
        dashboardUrl: menteeDashboardUrl,
        timezone: validatedMenteeTimezone,
    };

    const mentorEmailParams = {
        menteeName,
        mentorName,
        serviceTitle,
        sessionDate: session.session_date,
        durationMinutes,
        price,
        dashboardUrl: mentorDashboardUrl,
        timezone: validatedMentorTimezone,
    };

    // Send emails
    let menteeEmailSent = false;
    let mentorEmailSent = false;
    let menteeEmailError: string | null = null;
    let mentorEmailError: string | null = null;

    try {
        const resend = getResend();
        await resend.emails.send({
            from: EMAIL_FROM,
            to: menteeEmail,
            subject: `Booking confirmed: ${serviceTitle}`,
            html: createMenteeBookingConfirmedEmailHTML(menteeEmailParams),
        });
        menteeEmailSent = true;
    } catch (error: any) {
        menteeEmailError = error.message || "Unknown error";
        console.error(`[Booking Confirmation] Failed to send mentee email:`, menteeEmailError);
    }

    try {
        const resend = getResend();
        await resend.emails.send({
            from: EMAIL_FROM,
            to: mentorEmail,
            subject: `New booking confirmed: ${serviceTitle}`,
            html: createMentorBookingConfirmedEmailHTML(mentorEmailParams),
        });
        mentorEmailSent = true;
    } catch (error: any) {
        mentorEmailError = error.message || "Unknown error";
        console.error(`[Booking Confirmation] Failed to send mentor email:`, mentorEmailError);
    }

    const overallSuccess = menteeEmailSent || mentorEmailSent;

    return {
        success: overallSuccess,
        menteeEmailSent,
        mentorEmailSent,
        menteeEmailError,
        mentorEmailError
    };
}
