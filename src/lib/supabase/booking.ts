import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// Type definitions for booking operations
export interface Service {
  id: string;
  mentor_id: string;
  service_title: string;
  service_description: string | null;
  price: number;
  duration_minutes: number | null;
  service_type: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityData {
  id: string;
  mentor_id: string;
  date: string;
  time_slots: TimeSlot[];
  is_available: boolean | null;
  duration_minutes: number | null;
  is_recurring: boolean | null;
  recurring_pattern: string | null;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface SessionData {
  mentorId: string;
  menteeId: string;
  sessionDateUtc: string;
  duration: number;
  price: number;
  serviceId: string;
}

export interface BookingError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Fetch active services for a specific mentor
 * @param mentorId - The ID of the mentor
 * @returns Promise<Service[]> - Array of active services
 */
export async function getMentorServices(mentorId: string): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from("mentor_services")
      .select("*")
      .eq("mentor_id", mentorId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new BookingError({
        code: "SERVICES_FETCH_ERROR",
        message: "Failed to fetch mentor services",
        details: error,
      });
    }

    return data || [];
  } catch (error) {
    throw error instanceof BookingError
      ? error
      : new BookingError({
          code: "SERVICES_FETCH_ERROR",
          message: "Failed to fetch mentor services",
          details: error,
        });
  }
}

/**
 * Get availability for a mentor within a date range
 * @param mentorId - The ID of the mentor
 * @param startISO - Start date in ISO format (YYYY-MM-DD)
 * @param endISO - End date in ISO format (YYYY-MM-DD)
 * @returns Promise<AvailabilityData[]> - Array of availability data
 */
export async function getAvailabilityForMonth(
  mentorId: string,
  startISO: string,
  endISO: string
): Promise<AvailabilityData[]> {
  try {
    const { data, error } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", mentorId)
      .gte("date", startISO)
      .lte("date", endISO)
      .eq("is_available", true)
      .order("date", { ascending: true });

    if (error) {
      throw new BookingError({
        code: "AVAILABILITY_FETCH_ERROR",
        message: "Failed to fetch mentor availability",
        details: error,
      });
    }

    // Transform the data to ensure time_slots is properly typed
    const transformedData: AvailabilityData[] = (data || []).map((item) => ({
      ...item,
      time_slots: Array.isArray(item.time_slots)
        ? (item.time_slots as TimeSlot[])
        : [],
    }));

    return transformedData;
  } catch (error) {
    throw error instanceof BookingError
      ? error
      : new BookingError({
          code: "AVAILABILITY_FETCH_ERROR",
          message: "Failed to fetch mentor availability",
          details: error,
        });
  }
}

/**
 * Create a new session with validation and conflict checking
 * @param sessionData - The session data to create
 * @returns Promise<Tables<'sessions'>> - The created session
 */
export async function createSession(
  sessionData: SessionData
): Promise<Tables<"sessions">> {
  try {
    // Step 1: Validate mentee exists
    const { data: menteeProfile, error: menteeError } = await supabase
      .from("mentee_profiles")
      .select("id, user_id")
      .eq("user_id", sessionData.menteeId)
      .single();

    if (menteeError || !menteeProfile) {
      throw new BookingError({
        code: "INVALID_MENTEE",
        message: "Mentee profile not found or invalid",
        details: menteeError,
      });
    }

    // Step 2: Validate service exists and is active
    const { data: service, error: serviceError } = await supabase
      .from("mentor_services")
      .select("*")
      .eq("id", sessionData.serviceId)
      .eq("mentor_id", sessionData.mentorId)
      .eq("is_active", true)
      .single();

    if (serviceError || !service) {
      throw new BookingError({
        code: "INVALID_SERVICE",
        message: "Service not found or inactive",
        details: serviceError,
      });
    }

    // Step 3: Check time slot availability
    const sessionDate = new Date(sessionData.sessionDateUtc);
    const dateString = sessionDate.toISOString().split("T")[0];
    const timeString = sessionDate.toTimeString().slice(0, 5); // HH:MM format

    const { data: availability, error: availabilityError } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", sessionData.mentorId)
      .eq("date", dateString)
      .eq("is_available", true)
      .single();

    if (availabilityError || !availability) {
      throw new BookingError({
        code: "NO_AVAILABILITY",
        message: "No availability found for the selected date",
        details: availabilityError,
      });
    }

    // Check if the specific time slot is available
    const timeSlots = Array.isArray(availability.time_slots)
      ? (availability.time_slots as TimeSlot[])
      : [];
    const requestedSlot = timeSlots.find(
      (slot) => slot.start_time === timeString && slot.is_available
    );

    if (!requestedSlot) {
      throw new BookingError({
        code: "TIME_SLOT_UNAVAILABLE",
        message: "The requested time slot is not available",
        details: { requestedTime: timeString, availableSlots: timeSlots },
      });
    }

    // Step 4: Check for booking conflicts (overlapping sessions)
    const sessionEndTime = new Date(
      sessionDate.getTime() + sessionData.duration * 60000
    );

    const { data: conflictingSessions, error: conflictError } = await supabase
      .from("sessions")
      .select("id, session_date, duration_minutes")
      .eq("mentor_id", sessionData.mentorId)
      .gte("session_date", sessionDate.toISOString())
      .lt("session_date", sessionEndTime.toISOString())
      .in("status", ["scheduled", "confirmed"]);

    if (conflictError) {
      throw new BookingError({
        code: "CONFLICT_CHECK_ERROR",
        message: "Failed to check for booking conflicts",
        details: conflictError,
      });
    }

    if (conflictingSessions && conflictingSessions.length > 0) {
      throw new BookingError({
        code: "BOOKING_CONFLICT",
        message: "This time slot conflicts with an existing booking",
        details: { conflictingSessions },
      });
    }

    // Step 5: Create the session
    const { data: newSession, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        mentor_id: sessionData.mentorId,
        mentee_id: menteeProfile.id,
        session_date: sessionData.sessionDateUtc,
        duration_minutes: sessionData.duration,
        status: "scheduled",
        session_type: "one_on_one",
        price_paid: sessionData.price,
        payment_status: "pending",
      })
      .select()
      .single();

    if (sessionError) {
      throw new BookingError({
        code: "SESSION_CREATION_ERROR",
        message: "Failed to create session",
        details: sessionError,
      });
    }

    return newSession;
  } catch (error) {
    throw error instanceof BookingError
      ? error
      : new BookingError({
          code: "SESSION_CREATION_ERROR",
          message: "Failed to create session",
          details: error,
        });
  }
}

/**
 * Get mentor information for booking context
 * @param mentorId - The ID of the mentor
 * @returns Promise with mentor profile and basic profile data
 */
export async function getMentorInfo(mentorId: string) {
  try {
    const { data: mentorProfile, error: mentorError } = await supabase
      .from("mentor_profiles")
      .select("*")
      .eq("id", mentorId)
      .single();

    if (mentorError || !mentorProfile) {
      throw new BookingError({
        code: "MENTOR_NOT_FOUND",
        message: "Mentor profile not found",
        details: mentorError,
      });
    }

    // Get basic profile info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("user_id", mentorProfile.user_id)
      .single();

    return {
      mentorProfile,
      profile: profile || null,
      name: profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
        : "Mentor",
      avatar: profile?.avatar_url || mentorProfile.profile_photo_url || null,
    };
  } catch (error) {
    throw error instanceof BookingError
      ? error
      : new BookingError({
          code: "MENTOR_INFO_ERROR",
          message: "Failed to fetch mentor information",
          details: error,
        });
  }
}

/**
 * Validate booking data before submission
 * @param bookingData - The booking data to validate
 * @returns Promise<boolean> - True if valid, throws error if invalid
 */
export async function validateBookingData(bookingData: {
  mentorId: string;
  serviceId: string;
  date: string;
  time: string;
}): Promise<boolean> {
  try {
    // Validate mentor exists and is active
    const { data: mentor, error: mentorError } = await supabase
      .from("mentor_profiles")
      .select("id, is_active")
      .eq("id", bookingData.mentorId)
      .eq("is_active", true)
      .single();

    if (mentorError || !mentor) {
      throw new BookingError({
        code: "INVALID_MENTOR",
        message: "Mentor not found or inactive",
        details: mentorError,
      });
    }

    // Validate service
    const services = await getMentorServices(bookingData.mentorId);
    const service = services.find((s) => s.id === bookingData.serviceId);

    if (!service) {
      throw new BookingError({
        code: "INVALID_SERVICE",
        message: "Service not found or inactive",
        details: { serviceId: bookingData.serviceId },
      });
    }

    // Validate date/time format
    const dateTime = new Date(`${bookingData.date}T${bookingData.time}:00`);
    if (isNaN(dateTime.getTime())) {
      throw new BookingError({
        code: "INVALID_DATETIME",
        message: "Invalid date or time format",
        details: { date: bookingData.date, time: bookingData.time },
      });
    }

    // Check if date is in the future
    if (dateTime <= new Date()) {
      throw new BookingError({
        code: "PAST_DATETIME",
        message: "Cannot book sessions in the past",
        details: { requestedDateTime: dateTime.toISOString() },
      });
    }

    return true;
  } catch (error) {
    throw error instanceof BookingError
      ? error
      : new BookingError({
          code: "VALIDATION_ERROR",
          message: "Booking validation failed",
          details: error,
        });
  }
}

// Custom error class for booking operations
class BookingError extends Error {
  code: string;
  details?: any;

  constructor({
    code,
    message,
    details,
  }: {
    code: string;
    message: string;
    details?: any;
  }) {
    super(message);
    this.name = "BookingError";
    this.code = code;
    this.details = details;
  }
}

export { BookingError };
