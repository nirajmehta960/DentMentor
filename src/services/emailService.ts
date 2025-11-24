// Email service - calls serverless API endpoint to avoid CORS issues

// Get API endpoint URL (works for both local development and production)
const getApiUrl = () => {
  // Check for explicit API URL setting
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const origin = window.location.origin;

  // For production/Vercel, use same origin (API routes are on same domain)
  if (
    origin.includes("vercel.app") ||
    (!origin.includes("localhost") && !origin.includes("127.0.0.1"))
  ) {
    return origin; // Use same origin for API routes
  }

  // For local development, check for Vercel dev URL
  if (import.meta.env.VITE_VERCEL_DEV_URL) {
    return import.meta.env.VITE_VERCEL_DEV_URL;
  }

  // For local development:
  // - If accessing via Vercel dev (port 3000), use same origin
  // - If accessing via Vite, check for explicit dev API URL
  if (origin.includes(":8080") || origin.includes(":5173")) {
    // Try environment variable first
    const devApiUrl = import.meta.env.VITE_DEV_API_URL;
    if (devApiUrl) {
      return devApiUrl;
    }
    // Fallback: use Vercel dev URL from environment or same origin
    const vercelDevUrl = import.meta.env.VITE_VERCEL_DEV_URL || origin;
    return vercelDevUrl;
  }

  // Default: same origin (works when using Vercel dev)
  return origin;
};

// Email template is now in the serverless function (api/send-welcome-email.ts)
// This service just calls the API endpoint to avoid CORS issues

export interface SendWelcomeEmailParams {
  email: string;
  userName: string;
  dashboardUrl?: string;
  userType: "mentor" | "mentee";
}

export async function sendWelcomeEmail({
  email,
  userName,
  dashboardUrl = `${window.location.origin}/dashboard`,
  userType,
}: SendWelcomeEmailParams): Promise<{ error?: Error }> {
  const apiUrl = getApiUrl();
  const endpoint = `${apiUrl}/api/send-welcome-email`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        userName,
        dashboardUrl,
        userType,
        emailType: "welcome", // Always welcome for Google OAuth
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    await response.json();
    return {};
  } catch (error: any) {
    // Don't throw error - we don't want to block signup if email fails
    // Handle connection refused errors gracefully (dev server not running)
    if (
      error?.message?.includes("ERR_CONNECTION_REFUSED") ||
      error?.message?.includes("Failed to fetch") ||
      error?.name === "TypeError"
    ) {
      return {
        error: new Error(
          "Email service unavailable in development. Please ensure 'vercel dev' is running."
        ),
      };
    }

    return { error: error as Error };
  }
}
