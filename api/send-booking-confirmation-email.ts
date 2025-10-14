import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendBookingConfirmationEmails } from "./_utils/email";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const allowedOrigins: string[] = [];

  // Add allowed origins from environment variables
  if (process.env.VITE_APP_URL) {
    allowedOrigins.push(process.env.VITE_APP_URL);
  }

  // Add local development URLs if in development mode
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
  } else if (process.env.NODE_ENV === "development" || !process.env.VERCEL) {
    if (origin && origin.includes("localhost")) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionId, mentorTimezone, menteeTimezone } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const result = await sendBookingConfirmationEmails(sessionId, mentorTimezone, menteeTimezone);

    // Build response
    const response: any = {
      success: result.success,
    };

    if (result.menteeEmailSent && result.mentorEmailSent) {
      response.message = "Both confirmation emails sent successfully";
    } else if (result.menteeEmailSent) {
      response.message = "Mentee confirmation email sent successfully";
      response.partialFailure = {
        mentorEmailFailed: true,
        mentorEmailError: result.mentorEmailError,
      };
    } else if (result.mentorEmailSent) {
      response.message = "Mentor confirmation email sent successfully";
      response.partialFailure = {
        menteeEmailFailed: true,
        menteeEmailError: result.menteeEmailError,
      };
    } else {
      response.message = "Failed to send confirmation emails";
      response.partialFailure = {
        menteeEmailFailed: true,
        menteeEmailError: result.menteeEmailError,
        mentorEmailFailed: true,
        mentorEmailError: result.mentorEmailError,
      };
    }

    return res.status(result.success ? 200 : 500).json(response);

  } catch (error: any) {
    console.error(`[Booking Confirmation] Unexpected error:`, error?.message);
    return res.status(500).json({
      error: "Failed to send booking confirmation email",
      details: error?.message || "Unknown error",
    });
  }
}
