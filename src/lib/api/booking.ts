import {
  getMentorServices,
  getAvailabilityForMonth,
  createSession,
  getMentorInfo,
  validateBookingData,
  BookingError,
  type Service,
  type AvailabilityData,
  type SessionData,
} from "@/lib/supabase/booking";
import { supabase } from "@/integrations/supabase/client";
import { convertToUTC } from "@/lib/utils/booking";

// API Response types
export interface ServicesResponse {
  success: boolean;
  services: Service[];
  mentor: {
    id: string;
    name: string;
    timezone: string;
    avatar?: string;
  };
  error?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  availability: AvailabilityData[];
  mentor_timezone: string;
  user_timezone: string;
  error?: string;
}

export interface BookingRequest {
  mentorId: string;
  menteeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
}

export interface BookingResponse {
  success: boolean;
  session?: {
    id: string;
    session_date: string;
    status: string;
    payment_status: string;
    mentor_name: string;
    service_title: string;
    price: number;
    duration_minutes: number;
  };
  error?: string;
  code?: string;
  alternatives?: {
    dates: string[];
    times: string[];
  };
}

/**
 * Fetch mentor services API endpoint
 * GET /api/booking/services/:mentorId
 */
export async function fetchMentorServices(
  mentorId: string
): Promise<ServicesResponse> {
  try {
    if (!mentorId) {
      return {
        success: false,
        services: [],
        mentor: { id: "", name: "", timezone: "" },
        error: "Mentor ID is required",
      };
    }

    // Try to fetch services, but don't fail if mentor info is missing
    let services: Service[] = [];
    let mentorName = "Mentor";
    let mentorTimezone = "UTC";
    let mentorAvatar: string | undefined;

    try {
      services = await getMentorServices(mentorId);
    } catch (error) {
      services = [];
    }

    try {
      const mentorInfo = await getMentorInfo(mentorId);
      mentorName = mentorInfo.name;
      mentorTimezone = mentorInfo.mentorProfile.country_of_origin || "UTC";
      mentorAvatar = mentorInfo.avatar || undefined;
    } catch (error) {
      // Use defaults already set above
    }

    return {
      success: true,
      services,
      mentor: {
        id: mentorId,
        name: mentorName,
        timezone: mentorTimezone,
        avatar: mentorAvatar,
      },
    };
  } catch (error) {
    return {
      success: true, // Return success with empty services so the UI can handle it
      services: [],
      mentor: { id: mentorId, name: "Mentor", timezone: "UTC" },
    };
  }
}

/**
 * Fetch mentor availability API endpoint
 * GET /api/booking/availability/:mentorId?month=YYYY-MM
 */
// New interface for the updated availability response
export interface NewAvailabilityResponse {
  success: boolean;
  availability: { [date: string]: DateAvailability };
  mentor_timezone: string;
  user_timezone: string;
  error?: string;
}

export interface DateAvailability {
  date: string;
  slots: TimeSlotData[];
}

export interface TimeSlotData {
  start_time: string;
  end_time: string;
  duration: number;
  is_available: boolean;
}

export async function fetchMentorAvailability(
  mentorId: string,
  monthISO: string
): Promise<NewAvailabilityResponse> {
  try {
    if (!mentorId || !monthISO) {
      return {
        success: false,
        availability: {},
        mentor_timezone: "UTC",
        user_timezone: "UTC",
        error: "Mentor ID and month are required",
      };
    }

    // Parse month to get date range
    const [year, month] = monthISO.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const startISO = startDate.toISOString().split("T")[0];
    const endISO = endDate.toISOString().split("T")[0];

    // Query Supabase for mentor availability
    const { data: availabilityRows, error } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", mentorId)
      .gte("date", startISO)
      .lte("date", endISO)
      .eq("is_available", true)
      .order("date", { ascending: true });

    if (error) {
      // Fall back to mock data for testing
      return generateMockAvailabilityResponse(startISO, endISO);
    }

    // Parse the availability data
    const availability: { [date: string]: DateAvailability } = {};

    if (availabilityRows && availabilityRows.length > 0) {
      availabilityRows.forEach((row) => {
        const dateStr = row.date;
        let timeSlots: string[] = [];

        // Parse time_slots - it could be JSON array or string
        try {
          if (typeof row.time_slots === "string") {
            timeSlots = JSON.parse(row.time_slots);
          } else if (Array.isArray(row.time_slots)) {
            timeSlots = row.time_slots;
          }
        } catch (parseError) {
          timeSlots = [];
        }

        // Convert time slot objects/strings to structured data
        const slots: TimeSlotData[] = timeSlots.map((slot) => {
          // Handle new JSONB format: {start_time, end_time, is_available}
          if (typeof slot === "object" && slot !== null) {
            const processedSlot = {
              start_time: slot.start_time || "",
              end_time: slot.end_time || "",
              duration: slot.duration_minutes || 60,
              is_available: slot.is_available !== false, // Default to true if not specified
            };
            return processedSlot;
          }

          // Handle legacy string format: "HH:MM-HH:MM:duration" or "HH:MM-HH:MM" or "HH:MM-HH"
          if (typeof slot === "string") {
            // Handle mentor dashboard format: "10:30-11" or "15:00-16"
            if (slot.match(/^\d{1,2}:\d{2}-\d{1,2}$/)) {
              const [startTime, endHour] = slot.split("-");
              const endTime = `${endHour}:00`; // Assume :00 for minutes

              return {
                start_time: startTime,
                end_time: endTime,
                duration: 60,
                is_available: true,
              };
            }

            // Handle mentor dashboard format: "14:30-15:00:30" or "08:30-09:30:60"
            if (slot.match(/^\d{1,2}:\d{2}-\d{1,2}:\d{2}:\d+$/)) {
              const parts = slot.split("-");
              const startTime = parts[0];
              const endTimeAndDuration = parts[1].split(":");
              const endTime = `${endTimeAndDuration[0]}:${endTimeAndDuration[1]}`;
              const duration = parseInt(endTimeAndDuration[2] || "60");

              return {
                start_time: startTime,
                end_time: endTime,
                duration: duration,
                is_available: true,
              };
            }

            const parts = slot.split(":");
            if (parts.length >= 4) {
              // Format: "12:30-13:30:60"
              const startTime = `${parts[0]}:${parts[1]}`;
              const endTime = `${parts[2].split("-")[1]}:${parts[3]}`;
              const duration = parseInt(parts[4] || "60");

              return {
                start_time: startTime,
                end_time: endTime,
                duration: duration,
                is_available: true,
              };
            } else if (parts.length === 3) {
              // Format: "12:30-13:30" (assume 60 min duration)
              const [startHour, startMin, endPart] = parts;
              const [endHour, endMin] = endPart.split("-")[1]?.split(":") || [
                "",
                "",
              ];

              return {
                start_time: `${startHour}:${startMin}`,
                end_time: `${endHour}:${endMin}`,
                duration: 60,
                is_available: true,
              };
            } else {
              // Fallback parsing
              const timeRange = slot.split("-");
              return {
                start_time: timeRange[0] || "09:00",
                end_time: timeRange[1] || "10:00",
                duration: 60,
                is_available: true,
              };
            }
          }

          // Fallback for invalid format
          return {
            start_time: typeof slot === "string" ? slot : "09:00",
            end_time: typeof slot === "string" ? slot : "10:00",
            duration: 60,
            is_available: false,
          };
        });

        availability[dateStr] = {
          date: dateStr,
          slots: slots,
        };
      });
    }

    // If no real data found, add some mock data for testing
    if (Object.keys(availability).length === 0) {
      return generateMockAvailabilityResponse(startISO, endISO);
    }

    // Get user timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
      success: true,
      availability,
      mentor_timezone: "UTC", // Default, could be fetched from mentor profile
      user_timezone: userTimezone,
    };
  } catch (error) {
    // Return mock data for testing
    const startDate = new Date();
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );
    return generateMockAvailabilityResponse(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );
  }
}

// Helper function to generate mock availability in the new format
function generateMockAvailabilityResponse(
  startISO: string,
  endISO: string
): NewAvailabilityResponse {
  const availability: { [date: string]: DateAvailability } = {};
  const start = new Date(startISO);
  const end = new Date(endISO);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const dateString = d.toISOString().split("T")[0];

    // Skip weekends for simplicity
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Create different availability patterns
    const dayNumber = d.getDate();
    const availabilityLevel = dayNumber % 4;

    let slots: TimeSlotData[] = [];

    const allSlots = [
      {
        start_time: "09:00",
        end_time: "10:00",
        duration: 60,
        is_available: true,
      },
      {
        start_time: "10:00",
        end_time: "11:00",
        duration: 60,
        is_available: true,
      },
      {
        start_time: "11:00",
        end_time: "12:00",
        duration: 60,
        is_available: true,
      },
      {
        start_time: "14:00",
        end_time: "15:00",
        duration: 60,
        is_available: true,
      },
      {
        start_time: "15:00",
        end_time: "16:00",
        duration: 60,
        is_available: true,
      },
      {
        start_time: "16:00",
        end_time: "17:00",
        duration: 60,
        is_available: true,
      },
    ];

    switch (availabilityLevel) {
      case 0: // Fully available
        slots = allSlots;
        break;
      case 1: // Partially booked (50% available)
        slots = allSlots.filter((_, index) => index % 2 === 0);
        break;
      case 2: // Mostly booked (33% available)
        slots = allSlots.filter((_, index) => index % 3 === 0);
        break;
      case 3: // Skip this date (fully booked)
        continue;
    }

    if (slots.length > 0) {
      availability[dateString] = {
        date: dateString,
        slots: slots,
      };
    }
  }

  return {
    success: true,
    availability,
    mentor_timezone: "UTC",
    user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

// Helper function to generate mock availability for testing
function generateMockAvailability(
  startISO: string,
  endISO: string
): AvailabilityData[] {
  const availability: AvailabilityData[] = [];
  const start = new Date(startISO);
  const end = new Date(endISO);

  // Generate availability for weekdays with varying levels
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const dateString = d.toISOString().split("T")[0];

    // Skip weekends for simplicity, but include some Saturday availability
    if (dayOfWeek === 0) continue; // Skip Sunday

    // Create different availability patterns
    let timeSlots: {
      start_time: string;
      end_time: string;
      is_available: boolean;
    }[] = [];

    if (dayOfWeek === 6) {
      // Saturday - limited availability
      timeSlots = [
        { start_time: "10:00", end_time: "11:00", is_available: true },
        { start_time: "11:00", end_time: "12:00", is_available: true },
      ];
    } else {
      // Weekdays - full schedule but with varying availability
      const allSlots = [
        { start_time: "09:00", end_time: "10:00", is_available: true },
        { start_time: "10:00", end_time: "11:00", is_available: true },
        { start_time: "11:00", end_time: "12:00", is_available: true },
        { start_time: "14:00", end_time: "15:00", is_available: true },
        { start_time: "15:00", end_time: "16:00", is_available: true },
        { start_time: "16:00", end_time: "17:00", is_available: true },
      ];

      // Simulate different booking levels
      const dayNumber = d.getDate();
      const availabilityLevel = dayNumber % 4;

      switch (availabilityLevel) {
        case 0: // Fully available
          timeSlots = allSlots;
          break;
        case 1: // Partially booked (50% available)
          timeSlots = allSlots.map((slot, index) => ({
            ...slot,
            is_available: index % 2 === 0,
          }));
          break;
        case 2: // Mostly booked (33% available)
          timeSlots = allSlots.map((slot, index) => ({
            ...slot,
            is_available: index % 3 === 0,
          }));
          break;
        case 3: // Fully booked
          timeSlots = allSlots.map((slot) => ({
            ...slot,
            is_available: false,
          }));
          break;
      }
    }

    // Only add dates that have at least one available slot or show unavailable dates
    availability.push({
      id: `mock-${dateString}`,
      mentor_id: "mock-mentor",
      date: dateString,
      time_slots: timeSlots,
      is_available: timeSlots.some((slot) => slot.is_available),
      duration_minutes: 60,
      is_recurring: false,
      recurring_pattern: null,
    });
  }

  return availability;
}

/**
 * Create booking API endpoint using Supabase Edge Function
 * POST /api/booking/book
 */
export async function createBooking(
  bookingRequest: BookingRequest
): Promise<BookingResponse> {
  try {
    // Validate required fields
    const { mentorId, menteeId, serviceId, date, time } = bookingRequest;

    if (!mentorId || !menteeId || !serviceId || !date || !time) {
      return {
        success: false,
        error: "Missing required booking information",
      };
    }

    // Simple authentication check - don't interfere with existing working flow
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError) {
      return {
        success: false,
        error: "Authentication error. Please sign in again.",
        code: "UNAUTHORIZED",
      };
    }

    if (!session || !session.user) {
      return {
        success: false,
        error: "Please sign in to continue with your booking.",
        code: "UNAUTHORIZED",
      };
    }

    // Verify the mentee ID matches the authenticated user
    if (menteeId !== session.user.id) {
      return {
        success: false,
        error: "Authentication mismatch. Please refresh and try again.",
        code: "AUTH_MISMATCH",
      };
    }

    // Check if this is a mock service (for testing)
    if (serviceId.startsWith("mock-")) {
      // Create a mock successful booking response
      return {
        success: true,
        session: {
          id: `mock-session-${Date.now()}`,
          session_date: `${date}T${time}:00Z`,
          status: "scheduled",
          payment_status: "pending",
          mentor_name: "Test Mentor",
          service_title: serviceId.includes("interview")
            ? "Mock Interview"
            : "Career Guidance",
          price: serviceId.includes("interview") ? 150 : 120,
          duration_minutes: 60,
        },
      };
    }

    // Get service details for duration and price
    let services: Service[] = [];
    try {
      services = await getMentorServices(mentorId);
    } catch (error) {
      return {
        success: false,
        error: "Service not found",
        code: "INVALID_SERVICE",
      };
    }

    const service = services.find((s) => s.id === serviceId);

    if (!service) {
      return {
        success: false,
        error: "Service not found",
        code: "INVALID_SERVICE",
      };
    }

    // Create session date in UTC
    const sessionDateUtc = convertToUTC(date, time);

    // Generate idempotency key for this booking
    const idempotencyKey = `${mentorId}-${serviceId}-${date}-${time}-${menteeId}`;

    // Call the Supabase RPC function
    const { data: rpcResponse, error } = await supabase.rpc(
      "instant_book_simple",
      {
        p_mentee_user_id: menteeId,
        p_mentor_id: mentorId,
        p_service_id: serviceId,
        p_session_start_utc: sessionDateUtc,
        p_duration_minutes: service.duration_minutes || 60,
        p_idempotency_key: idempotencyKey,
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to create booking",
        code: "BOOKING_FAILED",
      };
    }

    // Check if rpcResponse is null, undefined, or empty object
    if (
      !rpcResponse ||
      (typeof rpcResponse === "object" && Object.keys(rpcResponse).length === 0)
    ) {
      return {
        success: false,
        error: "No response from booking service",
        code: "NO_RESPONSE",
      };
    }

    // Check RPC response status
    if (rpcResponse.status === "error") {
      return {
        success: false,
        error: rpcResponse.message,
        code: rpcResponse.code,
        alternatives: rpcResponse.details?.alternatives,
      };
    }

    // Convert RPC response to expected format
    if (rpcResponse.status === "ok" && rpcResponse.session) {
      return {
        success: true,
        session: rpcResponse.session,
      };
    }

    // Fallback error
    return {
      success: false,
      error: "Unexpected response format",
      code: "UNKNOWN_ERROR",
    };
  } catch (error) {
    return {
      success: false,
      error: "Internal error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Generate alternative booking suggestions when conflicts occur
 */
async function generateAlternatives(mentorId: string, requestedDate: string) {
  try {
    // Get availability for the requested date and surrounding dates
    const date = new Date(requestedDate);
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - 3); // 3 days before
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 7); // 7 days after

    const availability = await getAvailabilityForMonth(
      mentorId,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    const alternativeDates: string[] = [];
    const alternativeTimes: string[] = [];

    availability.forEach((avail) => {
      if (avail.time_slots && avail.time_slots.length > 0) {
        alternativeDates.push(avail.date);

        // Collect available times for the requested date
        if (avail.date === requestedDate) {
          avail.time_slots.forEach((slot) => {
            if (slot.is_available) {
              alternativeTimes.push(slot.start_time);
            }
          });
        }
      }
    });

    return {
      dates: [...new Set(alternativeDates)].slice(0, 5), // Max 5 alternative dates
      times: [...new Set(alternativeTimes)].slice(0, 8), // Max 8 alternative times
    };
  } catch (error) {
    return {
      dates: [],
      times: [],
    };
  }
}

/**
 * Utility function to format error responses consistently
 */
export function formatErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
) {
  if (error instanceof BookingError) {
    return {
      success: false as const,
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: false as const,
    error: defaultMessage,
  };
}

/**
 * Utility function to validate date/time formats
 */
export function validateDateTimeFormat(date: string, time: string): boolean {
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return false;
  }

  // Validate that the date is valid
  const dateObj = new Date(`${date}T${time}:00`);
  return !isNaN(dateObj.getTime());
}

/**
 * Utility function to get timezone offset for display
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const targetTime = new Date(
      utc.toLocaleString("en-US", { timeZone: timezone })
    );
    const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);

    const sign = offset >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.round((Math.abs(offset) - hours) * 60);

    return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  } catch (error) {
    return "UTC+00:00";
  }
}
