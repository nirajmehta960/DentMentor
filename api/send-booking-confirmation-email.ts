import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmationEmailsDeduped } from "./_utils/bookingConfirmationEmails";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const allowedOrigins: string[] = [];

  if (process.env.VITE_APP_URL) {
    allowedOrigins.push(process.env.VITE_APP_URL);
  }

  if (process.env.NODE_ENV === "development" || !process.env.VERCEL) {
    allowedOrigins.push(
      "http://localhost:8080",
      "http://localhost:5173",
      "http://localhost:3000"
    );
  }

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionId, mentorTimezone, menteeTimezone } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    // 1. Auth & Validation
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 2. Fetch Reservation linked to this session
    const { data: reservation, error: resError } = await supabase
      .from("booking_reservations")
      .select(`
            id, 
            mentee_user_id, 
            mentor_profiles:mentor_id (user_id)
        `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (resError || !reservation) {
      return res.status(404).json({ error: "Reservation found for this session." });
    }

    // 3. Verify Participant
    const menteeId = reservation.mentee_user_id;
    // Fix: Accessing nested array-like or object from joined query
    // Supabase returns an object or array depending on relationship. `mentor_profiles` is singular here (FK).
    // Safely cast or check
    const mentorIdRaw = (reservation as any).mentor_profiles;
    // It might be an array if One-to-Many, but here Many-to-One (reservation -> mentor). It should be single object if relationship is correct.
    // Usually select `mentor_profiles:mentor_id (...)` returns an object if it's N:1, or array if 1:N.
    // `booking_reservations.mentor_id` points to `mentor_profiles.id`. This is N:1. So it returns an object or null.
    const mentorUserId = Array.isArray(mentorIdRaw) ? mentorIdRaw[0]?.user_id : mentorIdRaw?.user_id;

    if (user.id !== menteeId && user.id !== mentorUserId) {
      // Optional: Check for Admin role if you have one
      return res.status(403).json({ error: "Unauthorized: You are not a participant of this session." });
    }

    // 4. Send Emails
    const result = await sendBookingConfirmationEmailsDeduped({
      reservationId: reservation.id,
      sessionId,
      mentorTimezone,
      menteeTimezone
    });

    // Build response
    const response: any = {
      success: result.menteeSent || result.mentorSent, // Roughly success if at least one sent or checked
      data: result
    };

    return res.status(200).json(response);

  } catch (error: any) {
    console.error(`[Booking Confirmation] Unexpected error:`, error?.message);
    return res.status(500).json({
      error: "Failed to send booking confirmation email",
      details: error?.message || "Unknown error",
    });
  }
}
