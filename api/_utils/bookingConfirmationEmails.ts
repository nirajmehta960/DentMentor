import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
    createMenteeBookingConfirmedEmailHTML,
    createMentorBookingConfirmedEmailHTML
} from "./emailTemplates";
import { getAppBaseUrl } from "./url";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_FROM = process.env.EMAIL_FROM;

const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is missing/undefined");
    }
    return new Resend(process.env.RESEND_API_KEY);
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

interface SendBookingConfirmationParams {
    reservationId: string;
    sessionId: string;
    mentorTimezone?: string;
    menteeTimezone?: string;
}

export async function sendBookingConfirmationEmailsDeduped({
    reservationId,
    sessionId,
    mentorTimezone = "UTC", // Fallback, will try to fetch from DB
    menteeTimezone = "UTC"  // Fallback, will try to fetch from DB
}: SendBookingConfirmationParams) {
    console.log(`Starting deduped email send for Reservation: ${reservationId}, Session: ${sessionId}`);

    if (!process.env.RESEND_API_KEY || !EMAIL_FROM) {
        console.error("Missing email configuration (RESEND_API_KEY or EMAIL_FROM)");
        return { success: false, error: "Configuration missing" };
    }

    const supabase = getSupabase();

    if (!sessionId || !reservationId) {
        throw new Error("sessionId and reservationId are required");
    }
    if (!UUID_REGEX.test(sessionId) || !UUID_REGEX.test(reservationId)) {
        throw new Error("Invalid UUID format for sessionId or reservationId");
    }

    // 1. Fetch Reservation (Source of Truth for participants and Service)
    const { data: reservation, error: resError } = await supabase
        .from("booking_reservations")
        .select(`
            id, 
            mentee_email_sent_at, 
            mentor_email_sent_at, 
            service_id, 
            mentee_user_id, 
            mentor_id,
            session_id
        `)
        .eq("id", reservationId)
        .single();

    if (resError || !reservation) {
        console.error("Reservation lookup failed", resError);
        throw new Error(`Reservation lookup failed: ${resError?.message}`);
    }

    // 2. Fetch Session (Date, Duration, Price)
    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("session_date, duration_minutes, price_paid")
        .eq("id", sessionId)
        .single();

    if (sessionError || !session) {
        console.error("Session lookup failed", sessionError);
        throw new Error(`Session not found: ${sessionError?.message}`);
    }

    // 3. Fetch Details for Emails
    // Mentor Profile & User
    const { data: mentorProfile } = await supabase
        .from("mentor_profiles")
        .select("user_id, timezone")
        .eq("id", reservation.mentor_id)
        .single();

    if (!mentorProfile) throw new Error("Mentor profile not found");

    // Use fetched timezone if available, otherwise fallback to passed param or UTC
    const resolvedMentorTimezone = mentorProfile.timezone || mentorTimezone;

    const { data: mentorUser } = await supabase.auth.admin.getUserById(mentorProfile.user_id);
    const mentorEmail = mentorUser?.user?.email;

    const { data: mentorPublicProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", mentorProfile.user_id)
        .single();

    const mentorName = mentorPublicProfile?.first_name
        ? `${mentorPublicProfile.first_name} ${mentorPublicProfile.last_name || ''}`.trim()
        : "Mentor";

    // Mentee Profile & User
    const { data: menteeUser } = await supabase.auth.admin.getUserById(reservation.mentee_user_id);
    const menteeEmail = menteeUser?.user?.email;

    // Fetch mentee profile to get timezone if possible
    const { data: menteeProfile } = await supabase
        .from("mentee_profiles")
        .select("timezone")
        .eq("user_id", reservation.mentee_user_id)
        .single();

    // Use fetched timezone if available, otherwise fallback to passed param or UTC
    const resolvedMenteeTimezone = menteeProfile?.timezone || menteeTimezone;

    const { data: menteePublicProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", reservation.mentee_user_id)
        .single();

    const menteeName = menteePublicProfile?.first_name
        ? `${menteePublicProfile.first_name} ${menteePublicProfile.last_name || ''}`.trim()
        : "Student";

    if (!mentorEmail || !menteeEmail) {
        throw new Error(`Missing email addresses. Mentor: ${!!mentorEmail}, Mentee: ${!!menteeEmail}`);
    }

    // Service Title
    let serviceTitle = "Mentorship Session";
    if (reservation.service_id) {
        const { data: service } = await supabase
            .from("mentor_services")
            .select("service_title")
            .eq("id", reservation.service_id)
            .single();
        if (service?.service_title) serviceTitle = service.service_title;
    }

    const price = session.price_paid || 0;
    const durationMinutes = session.duration_minutes || 0;

    // Construct URLs
    const baseUrl = getAppBaseUrl();
    const menteeDashboardUrl = `${baseUrl}/mentee-dashboard?tab=sessions`;
    const mentorDashboardUrl = `${baseUrl}/dashboard?tab=sessions`;

    // 4. Send Logic
    let menteeSent = false;
    let mentorSent = false;
    const resend = getResend();

    // --- MENTEE EMAIL ---
    if (reservation.mentee_email_sent_at) {
        console.log("Mentee email already sent (DB flag set). Skipping.");
        menteeSent = true;
    } else {
        // Atomic Update Attempt
        const { data: updated, error: updateError } = await supabase
            .from("booking_reservations")
            .update({ mentee_email_sent_at: new Date().toISOString() })
            .eq("id", reservationId)
            .is("mentee_email_sent_at", null) // Conditional: ONLY if null
            .select();

        if (updateError) {
            console.error("Failed to acquire mentee email lock", updateError);
        } else if (updated && updated.length > 0) {
            // Lock acquired, send email
            try {
                console.log(`Sending email to Mentee: ${menteeEmail}`);
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: menteeEmail,
                    subject: `Booking confirmed: ${serviceTitle}`,
                    html: createMenteeBookingConfirmedEmailHTML({
                        menteeName, mentorName, serviceTitle,
                        sessionDate: session.session_date,
                        durationMinutes, price, dashboardUrl: menteeDashboardUrl,
                        timezone: resolvedMenteeTimezone
                    }),
                });
                menteeSent = true;
                console.log("Mentee email sent successfully.");
            } catch (emailErr) {
                console.error("CRITICAL: Mentee email failed AFTER lock acquired.", emailErr);
                // Optional: Revert lock? Or just alert admin. 
                // For now, we leave it as 'sent' in DB to prevent retry loops causing spam if it's a data issue.
            }
        } else {
            console.log("Mentee email lock missed (race condition or already sent). Skipping.");
            menteeSent = true;
        }
    }

    // --- MENTOR EMAIL ---
    if (reservation.mentor_email_sent_at) {
        console.log("Mentor email already sent (DB flag set). Skipping.");
        mentorSent = true;
    } else {
        // Atomic Update Attempt
        const { data: updated, error: updateError } = await supabase
            .from("booking_reservations")
            .update({ mentor_email_sent_at: new Date().toISOString() })
            .eq("id", reservationId)
            .is("mentor_email_sent_at", null)
            .select();

        if (updateError) {
            console.error("Failed to acquire mentor email lock", updateError);
        } else if (updated && updated.length > 0) {
            // Lock acquired
            try {
                console.log(`Sending email to Mentor: ${mentorEmail}`);
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: mentorEmail,
                    subject: `New booking confirmed: ${serviceTitle}`,
                    html: createMentorBookingConfirmedEmailHTML({
                        mentorName, menteeName, serviceTitle,
                        sessionDate: session.session_date,
                        durationMinutes, price, dashboardUrl: mentorDashboardUrl,
                        timezone: resolvedMentorTimezone
                    }),
                });
                mentorSent = true;
                console.log("Mentor email sent successfully.");
            } catch (emailErr) {
                console.error("CRITICAL: Mentor email failed AFTER lock acquired.", emailErr);
            }
        } else {
            console.log("Mentor email lock missed. Skipping.");
            mentorSent = true;
        }
    }

    return { menteeSent, mentorSent };
}
