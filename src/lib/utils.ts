import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return format(parseISO(dateString), 'MMM d, yyyy')
}

export function formatTime(dateString: string) {
  return format(parseISO(dateString), 'h:mm a')
}

export function formatDateTime(dateString: string) {
  return format(parseISO(dateString), 'MMM d, yyyy h:mm a')
}
