import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

/**
 * Standard Application Error
 */
class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isRetryable: boolean;
  public readonly details?: any;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    isRetryable: boolean = false,
    details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    this.details = details;
  }
}

/**
 * Generates a consistent error response structure
 */
const toErrorResponse = (error: any, requestId: string) => {
  // Default to handling unknown errors
  const response = {
    ok: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      requestId,
      details: undefined as any
    }
  };

  let statusCode = 500;

  if (error instanceof AppError) {
    response.error.code = error.code;
    response.error.message = error.message;
    response.error.details = error.details;
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    // Handle generic JS errors safely
    response.error.message = error.message;

    // Handle Stripe Errors specifically if reachable
    if ((error as any).type?.startsWith('Stripe')) {
      response.error.code = (error as any).code || 'STRIPE_ERROR';
      statusCode = (error as any).statusCode || 500;
    }
  }

  return { response, statusCode };
};

/**
 * Extract or generate Request ID
 */
const withRequestId = (req: VercelRequest): string => {
  const existingId = req.headers['x-request-id'];
  if (Array.isArray(existingId)) return existingId[0];
  if (existingId) return existingId;
  return uuidv4();
};

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM;
const APP_NAME = process.env.APP_NAME || "DentMentor";

// ... [Email templates omitted for brevity, assumed unchanged or imported] ...
// Ideally templates should be in _utils/emailTemplates.ts but standardizing the handler is the priority here.
// I will inline them simplified or keep them if I can view them again, but since I am replacing the whole file content I need to include them. 
// Actually, looking at the previous file view, specific templates were defined. I should reconstruct them or move them. 
// To be safe and clean, I will move the templates to a separate utility file if I could, but I can't easily create multiple files in one step and I want to minimize risk.
// I will re-include the exact templates from the previous view to ensure no regression.

// Helper to get formatted URL (duplicating strict logic or importing if available)
// I will use a local helper for now to avoid import issues if _utils/url.ts is not perfectly aligned with strict requirement.
const getAppBaseUrl = () => {
  const explicit = process.env.APP_URL || process.env.VITE_APP_URL;
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    if (explicit) return explicit.replace(/\/$/, "");
    if (process.env.VERCEL_URL) {
      const vUrl = process.env.VERCEL_URL;
      return vUrl.startsWith("http") ? vUrl.replace(/\/$/, "") : `https://${vUrl}`.replace(/\/$/, "");
    }
    throw new AppError("CONFIG_ERROR", "Missing APP_URL in production", 500);
  }
  return explicit?.replace(/\/$/, "") || "http://localhost:8080";
};

// Mentor Welcome Email
const createMentorWelcomeEmailHTML = (userName: string, dashboardUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0FDFA;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);">
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${APP_NAME}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">Connect with dental professionals and accelerate your career</p>
    </div>
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome, ${userName}!</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        Welcome to ${APP_NAME}! We're thrilled to have you join our community of dental professionals. As a mentor, you'll help guide the next generation of dental students on their journey to success.
      </p>
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What you can do as a Mentor:</h3>
        <ul style="color: #475569; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Complete your professional profile</li>
          <li style="margin-bottom: 8px;">Set your availability and define services</li>
          <li style="margin-bottom: 8px;">Connect with motivated students</li>
          <li style="margin-bottom: 8px;">Schedule mentorship sessions</li>
          <li>Make a meaningful impact</li>
        </ul>
      </div>
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">Get Started</a>
      <p style="color: #64748B; font-size: 14px; margin: 32px 0 0 0; line-height: 1.5;">If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div style="background-color: #F0FDFA; padding: 24px 32px; text-align: center; border-top: 1px solid #CCFBF1;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p style="color: #64748B; font-size: 12px; margin: 0;">This email was sent because you signed up as a mentor with ${APP_NAME}.</p>
    </div>
  </div>
</body>
</html>
`;

// Mentee Welcome Email
const createMenteeWelcomeEmailHTML = (userName: string, dashboardUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0FDFA;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);">
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${APP_NAME}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">Connect with dental professionals and accelerate your career</p>
    </div>
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome, ${userName}!</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        Thank you for joining ${APP_NAME}! We're excited to help you connect with verified dental professionals.
      </p>
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What you can do as a Student:</h3>
        <ul style="color: #475569; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Complete your profile</li>
          <li style="margin-bottom: 8px;">Browse and connect with mentors</li>
          <li style="margin-bottom: 8px;">Schedule mentorship sessions</li>
          <li style="margin-bottom: 8px;">Get personalized guidance</li>
          <li>Track your progress</li>
        </ul>
      </div>
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">Get Started</a>
      <p style="color: #64748B; font-size: 14px; margin: 32px 0 0 0; line-height: 1.5;">If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div style="background-color: #F0FDFA; padding: 24px 32px; text-align: center; border-top: 1px solid #CCFBF1;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p style="color: #64748B; font-size: 12px; margin: 0;">This email was sent because you signed up as a student with ${APP_NAME}.</p>
    </div>
  </div>
</body>
</html>
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = withRequestId(req);
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
  const origin = req.headers.origin;

  // Add VITE_APP_URL and dev origins
  if (process.env.VITE_APP_URL) allowedOrigins.push(process.env.VITE_APP_URL);
  if (process.env.NODE_ENV === "development" && process.env.VITE_DEV_ORIGINS) {
    allowedOrigins.push(...process.env.VITE_DEV_ORIGINS.split(",").map(o => o.trim()));
  }

  // Set Request ID
  res.setHeader("x-request-id", requestId);

  try {
    // --- CORS ---
    let isAllowed = false;
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))) {
      isAllowed = true;
    }

    if (isAllowed && origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      throw new AppError("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    // --- Configuration Check ---
    if (!process.env.RESEND_API_KEY) {
      throw new AppError("CONFIG_ERROR", "Email service not configured", 500);
    }
    if (!EMAIL_FROM) {
      throw new AppError("CONFIG_ERROR", "Email FROM address not configured", 500);
    }

    const { email, userName, dashboardUrl, userType } = req.body;

    // --- Validation ---
    if (!email || !userName || !userType) {
      throw new AppError("BAD_REQUEST", "Email, userName, and userType are required", 400);
    }

    const isMentor = userType === "mentor";
    const redirectUrl = dashboardUrl || `${getAppBaseUrl()}/dashboard`;

    let emailHTML: string;
    let emailSubject: string;

    if (isMentor) {
      emailHTML = createMentorWelcomeEmailHTML(userName, redirectUrl);
      emailSubject = `Welcome to ${APP_NAME} - Start Your Mentoring Journey!`;
    } else {
      emailHTML = createMenteeWelcomeEmailHTML(userName, redirectUrl);
      emailSubject = `Welcome to ${APP_NAME} - Connect with Dental Professionals!`;
    }

    // --- Sending ---
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: emailSubject,
      html: emailHTML,
    });

    return res.status(200).json({
      ok: true,
      data: result,
      requestId
    });

  } catch (error: any) {
    const { response, statusCode } = toErrorResponse(error, requestId);
    console.error(`[WelcomeEmail] Error: ${response.error.message}`, { requestId, error });
    return res.status(statusCode).json(response);
  }
}
