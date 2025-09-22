import { supabase } from "@/integrations/supabase/client";
import type { BookingResponse } from "./booking";

export interface BookSessionParams {
  mentorId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  timezone: string; // IANA timezone string
}

/**
 * Book a session via Supabase Edge Function
 * Calls the "instant-book" Edge Function with local date/time and timezone
 */
export async function bookSession({
  mentorId,
  serviceId,
  date,
  startTime,
  timezone,
}: BookSessionParams): Promise<BookingResponse> {
  try {
    // Get current session for authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return {
        success: false,
        error: "Please sign in to continue with your booking.",
        code: "UNAUTHORIZED",
      };
    }

    // Generate idempotency key
    // Stable for same user+mentor+service+date+time combination
    const idempotencyKey = `${session.user.id}-${mentorId}-${serviceId}-${date}-${startTime}`;

    // Prepare payload for Edge Function
    const payload = {
      mentor_id: mentorId,
      service_id: serviceId,
      date,
      start_time_local: startTime,
      timezone,
      idempotency_key: idempotencyKey,
    };

    // Call the Supabase Edge Function
    console.log('Calling Edge Function instant-book with payload:', payload);
    
    const { data, error } = await supabase.functions.invoke("instant-book", {
      body: payload,
    });

    console.log('Edge Function response:', { data, error });

    if (error) {
      console.error("Edge Function error:", error);
      return {
        success: false,
        error: error.message || "Failed to create booking",
        code: "BOOKING_FAILED",
      };
    }

    // Parse response - Edge Function returns { ok: boolean } format
    const response = data as any;

    // Handle new response format: { ok: true/false, session?: {...}, error?: string }
    if (!response || response.ok !== true) {
      console.warn("Booking failed:", response);
      return {
        success: false,
        error: response?.error || "Booking failed",
        code: response?.code || "BOOKING_FAILED",
        alternatives: response?.alternatives,
      };
    }

    console.log("Booking successful! Session created:", response.session);

    // Convert new format to old format for backward compatibility
    return {
      success: true,
      session: response.session,
    };
  } catch (error: any) {
    console.error("Booking error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}
