import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

// tailwind-merge doesn't know the custom font sizes in tailwind.config.ts, so it
// read `text-display-2` as a text colour and dropped it whenever a real colour
// (`text-band-fg`) came after it. Registering them keeps size and colour apart.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-1", "display-2", "display-3", "body-lg", "body-sm"] }],
    },
  },
})

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
