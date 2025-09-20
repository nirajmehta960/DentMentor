/**
 * Utility functions for booking flow integration
 */

import { v4 as uuidv4 } from 'uuid';

// Timezone utilities
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function convertToUTC(date: string, time: string): string {
  // Validate input parameters
  if (!date || !time) {
    throw new Error('Invalid date or time parameters');
  }

  // Parse date and time components
  const dateParts = date.split('-');
  const timeParts = time.split(':');
  
  if (dateParts.length !== 3 || timeParts.length < 2) {
    throw new Error('Invalid date or time format');
  }

  const [year, month, day] = dateParts.map(Number);
  const [hours, minutes] = timeParts.map(Number);
  
  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    throw new Error('Invalid date or time values');
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Date or time values out of valid range');
  }
  
  // Create date in UTC directly to avoid timezone conversion issues
  const utcDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  
  // Validate the created date
  if (isNaN(utcDateTime.getTime())) {
    throw new Error('Invalid date could not be created');
  }
  
  return utcDateTime.toISOString();
}

export function formatTimeForDisplay(timeString: string, timezone?: string): string {
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    });
  } catch {
    return timeString;
  }
}

export function formatDateForDisplay(dateString: string, timezone?: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone
    });
  } catch {
    return dateString;
  }
}

// Idempotency utilities
export function generateIdempotencyKey(
  mentorId: string,
  serviceId: string,
  date: string,
  time: string,
  menteeId: string
): string {
  return `${mentorId}-${serviceId}-${date}-${time}-${menteeId}`;
}

export function generateUUIDIdempotencyKey(): string {
  return uuidv4();
}

// Validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateBookingRequest(
  mentorId: string,
  serviceId: string,
  date: string,
  time: string,
  services: any[],
  availability: any,
  selectedDate?: string
): ValidationResult {
  const errors: string[] = [];

  // Basic validation
  if (!mentorId) errors.push('Mentor ID is required');
  if (!serviceId) errors.push('Service ID is required');
  if (!date) errors.push('Date is required');
  if (!time) errors.push('Time is required');

  // Service validation
  const service = services.find(s => s.id === serviceId);
  if (!service) {
    errors.push('Selected service is no longer available');
  } else if (!service.is_active) {
    errors.push('Selected service is inactive');
  }

  // Time validation
  const requestedDateTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  if (requestedDateTime <= now) {
    errors.push('Cannot book sessions in the past');
  }

  // Availability validation
  if (availability && selectedDate) {
    const dateAvailability = availability[selectedDate];
    if (!dateAvailability || !dateAvailability.slots) {
      errors.push('No availability found for selected date');
    } else {
      const selectedSlot = dateAvailability.slots.find((slot: any) => 
        slot.start_time === time && slot.is_available
      );
      if (!selectedSlot) {
        errors.push('Selected time slot is no longer available');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Error mapping utilities
export interface ErrorMapping {
  code: string;
  title: string;
  message: string;
  action?: string;
  showAlternatives?: boolean;
}

export function mapBookingError(errorCode: string, details?: any): ErrorMapping {
  switch (errorCode) {
    case 'SLOT_UNAVAILABLE':
      return {
        code: errorCode,
        title: 'Time Slot Unavailable',
        message: 'The selected time slot is no longer available. Please choose another time.',
        action: 'Try a different time slot',
        showAlternatives: true
      };
    
    case 'BOOKING_CONFLICT':
      return {
        code: errorCode,
        title: 'Booking Conflict',
        message: 'This time slot conflicts with an existing session. Please choose another time.',
        action: 'Select a different time',
        showAlternatives: true
      };
    
    case 'MENTEE_NOT_FOUND':
      return {
        code: errorCode,
        title: 'Profile Incomplete',
        message: 'Please complete your profile setup before booking sessions.',
        action: 'Complete Profile'
      };
    
    case 'MENTOR_NOT_FOUND':
      return {
        code: errorCode,
        title: 'Mentor Unavailable',
        message: 'The selected mentor is not available for booking.',
        action: 'Choose Another Mentor'
      };
    
    case 'UNAUTHORIZED':
      return {
        code: errorCode,
        title: 'Authentication Required',
        message: 'Please sign in to continue with your booking.',
        action: 'Sign In'
      };
    
    case 'AUTH_MISMATCH':
      return {
        code: errorCode,
        title: 'Authentication Error',
        message: 'There was an authentication issue. Please refresh the page and try again.',
        action: 'Refresh Page'
      };
    
    case 'SERVICE_INVALID':
      return {
        code: errorCode,
        title: 'Service Unavailable',
        message: 'The selected service is no longer available.',
        action: 'Choose Another Service'
      };
    
    case 'INVALID_REQUEST':
      return {
        code: errorCode,
        title: 'Invalid Request',
        message: 'Please check your booking details and try again.',
        action: 'Review Details'
      };
    
    case 'BOOKING_FAILED':
      return {
        code: errorCode,
        title: 'Booking Failed',
        message: 'Unable to complete your booking. Please try again.',
        action: 'Retry Booking'
      };
    
    case 'INTERNAL_ERROR':
      return {
        code: errorCode,
        title: 'System Error',
        message: 'An unexpected error occurred. Please try again later.',
        action: 'Try Again Later'
      };
    
    default:
      return {
        code: errorCode,
        title: 'Booking Error',
        message: 'Something went wrong. Please try again.',
        action: 'Retry'
      };
  }
}

// Alternative suggestions utilities
export interface AlternativeSuggestion {
  date: string;
  time: string;
  displayDate: string;
  displayTime: string;
  isAvailable: boolean;
}

export function generateAlternativeSuggestions(
  availability: any,
  requestedDate: string,
  requestedTime: string,
  timezone?: string
): AlternativeSuggestion[] {
  const suggestions: AlternativeSuggestion[] = [];
  
  if (!availability) return suggestions;

  // Get available slots for the requested date
  const requestedDateAvailability = availability[requestedDate];
  if (requestedDateAvailability && requestedDateAvailability.slots) {
    requestedDateAvailability.slots.forEach((slot: any) => {
      if (slot.is_available && slot.start_time !== requestedTime) {
        suggestions.push({
          date: requestedDate,
          time: slot.start_time,
          displayDate: formatDateForDisplay(requestedDate, timezone),
          displayTime: formatTimeForDisplay(slot.start_time, timezone),
          isAvailable: true
        });
      }
    });
  }

  // Get available slots for the next 3 days
  const requestedDateObj = new Date(requestedDate);
  for (let i = 1; i <= 3; i++) {
    const nextDate = new Date(requestedDateObj);
    nextDate.setDate(requestedDateObj.getDate() + i);
    const nextDateString = nextDate.toISOString().split('T')[0];
    
    const nextDateAvailability = availability[nextDateString];
    if (nextDateAvailability && nextDateAvailability.slots) {
      nextDateAvailability.slots.forEach((slot: any) => {
        if (slot.is_available) {
          suggestions.push({
            date: nextDateString,
            time: slot.start_time,
            displayDate: formatDateForDisplay(nextDateString, timezone),
            displayTime: formatTimeForDisplay(slot.start_time, timezone),
            isAvailable: true
          });
        }
      });
    }
  }

  return suggestions.slice(0, 8); // Limit to 8 suggestions
}

// Cache invalidation utilities
export interface CacheInvalidationOptions {
  mentorId: string;
  menteeId: string;
  date?: string;
  queryClient: any; // React Query client
}

export async function invalidateBookingCaches(options: CacheInvalidationOptions) {
  const { mentorId, menteeId, date, queryClient } = options;

  // Invalidate mentor availability
  await queryClient.invalidateQueries({
    queryKey: ['mentorAvailability', mentorId]
  });

  // Invalidate sessions for mentor
  await queryClient.invalidateQueries({
    queryKey: ['sessions', 'mentor', mentorId]
  });

  // Invalidate sessions for mentee
  await queryClient.invalidateQueries({
    queryKey: ['sessions', 'mentee', menteeId]
  });

  // Invalidate mentor services
  await queryClient.invalidateQueries({
    queryKey: ['mentorServices', mentorId]
  });

  // Invalidate user profile if needed
  await queryClient.invalidateQueries({
    queryKey: ['userProfile', menteeId]
  });

  // If specific date, also invalidate availability for that date
  if (date) {
    await queryClient.invalidateQueries({
      queryKey: ['mentorAvailability', mentorId, date]
    });
  }
}

// Retry utilities
export interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000
};

export async function retryBookingRequest(
  requestFn: () => Promise<any>,
  idempotencyKey: string,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<any> {
  const { maxRetries, retryDelay, timeout } = options;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const result = await requestFn();
      clearTimeout(timeoutId);
      return result;
      
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries;
      const isTimeout = error.name === 'AbortError';
      const isNetworkError = !error.response && error.message.includes('network');
      
      if (isLastAttempt || (!isTimeout && !isNetworkError)) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }
  
  throw new Error('Max retries exceeded');
}
