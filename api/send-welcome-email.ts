// Vercel Serverless Function to send welcome emails via Resend
// This avoids CORS issues by calling Resend API from server-side

import { Resend } from "resend";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM;
const APP_NAME = process.env.APP_NAME || "DentMentor";

// Email templates - Matching DentMentor brand colors
// Primary: Deep Teal (hsl(168, 76%, 25%)) ≈ #0D9488
// Accent: Soft Blue (hsl(199, 89%, 48%)) ≈ #0EA5E9
// Gradient Hero: Teal to Blue (135deg)

// Mentor Welcome Email (Google Auth - email already confirmed)
const createMentorWelcomeEmailHTML = (
  userName: string,
  dashboardUrl: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0FDFA;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);">
    
    <!-- Header with DentMentor gradient -->
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${APP_NAME}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">Connect with dental professionals and accelerate your career</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome, ${userName}!</h2>
      
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        Welcome to ${APP_NAME}! We're thrilled to have you join our community of dental professionals. As a mentor, you'll help guide the next generation of dental students on their journey to success.
      </p>
      
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What you can do as a Mentor:</h3>
        <ul style="color: #475569; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Complete your professional profile to help students find you</li>
          <li style="margin-bottom: 8px;">Set your availability and define your services</li>
          <li style="margin-bottom: 8px;">Connect with motivated dental students seeking guidance</li>
          <li style="margin-bottom: 8px;">Schedule mentorship sessions and share your expertise</li>
          <li>Make a meaningful impact on students' dental careers</li>
        </ul>
      </div>
      
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">
        Get Started
      </a>
      
      <p style="color: #64748B; font-size: 14px; margin: 32px 0 0 0; line-height: 1.5;">
        If you have any questions, feel free to reach out to our support team. We're here to help!
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #F0FDFA; padding: 24px 32px; text-align: center; border-top: 1px solid #CCFBF1;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
      <p style="color: #64748B; font-size: 12px; margin: 0;">
        This email was sent because you signed up as a mentor with ${APP_NAME}.
      </p>
    </div>
    
  </div>
</body>
</html>
`;

// Mentee Welcome Email (Google Auth - email already confirmed)
const createMenteeWelcomeEmailHTML = (
  userName: string,
  dashboardUrl: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0FDFA;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);">
    
    <!-- Header with DentMentor gradient -->
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${APP_NAME}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">Connect with dental professionals and accelerate your career</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome, ${userName}!</h2>
      
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        Thank you for joining ${APP_NAME}! We're excited to help you connect with verified dental professionals and accelerate your career journey.
      </p>
      
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What you can do as a Student:</h3>
        <ul style="color: #475569; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Complete your profile to help mentors understand your goals</li>
          <li style="margin-bottom: 8px;">Browse and connect with verified dental professionals</li>
          <li style="margin-bottom: 8px;">Schedule mentorship sessions tailored to your needs</li>
          <li style="margin-bottom: 8px;">Get personalized guidance for your dental career</li>
          <li>Track your progress and milestones</li>
        </ul>
      </div>
      
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">
        Get Started
      </a>
      
      <p style="color: #64748B; font-size: 14px; margin: 32px 0 0 0; line-height: 1.5;">
        If you have any questions, feel free to reach out to our support team. We're here to help!
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #F0FDFA; padding: 24px 32px; text-align: center; border-top: 1px solid #CCFBF1;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
      <p style="color: #64748B; font-size: 12px; margin: 0;">
        This email was sent because you signed up as a student with ${APP_NAME}.
      </p>
    </div>
    
  </div>
</body>
</html>
`;

// Confirmation email templates removed - using Google OAuth only (emails already confirmed)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const allowedOrigins: string[] = [];

  // Add allowed origins from environment variables
  if (process.env.VITE_APP_URL) {
    allowedOrigins.push(process.env.VITE_APP_URL);
  }

  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(
      ...process.env.ALLOWED_ORIGINS.split(",").map((url) => url.trim())
    );
  }

  // Add local development URLs if in development mode
  if (process.env.NODE_ENV === "development" || !process.env.VERCEL) {
    if (process.env.VITE_DEV_ORIGINS) {
      allowedOrigins.push(
        ...process.env.VITE_DEV_ORIGINS.split(",").map((url) => url.trim())
      );
    }
  }

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
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

  // Check for required environment variables
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service not configured" });
  }

  if (!EMAIL_FROM) {
    return res.status(500).json({ error: "Email FROM address not configured" });
  }

  try {
    const { email, userName, dashboardUrl, userType } = req.body;

    // Validate required fields
    if (!email || !userName || !userType) {
      return res.status(400).json({
        error: "Email, userName, and userType are required",
      });
    }

    // Always welcome email (Google OAuth only - emails already confirmed)
    const isMentor = userType === "mentor";
    const redirectUrl =
      dashboardUrl ||
      (process.env.VITE_APP_URL
        ? `${process.env.VITE_APP_URL}/dashboard`
        : undefined);

    let emailHTML: string;
    let emailSubject: string;

    if (isMentor) {
      emailHTML = createMentorWelcomeEmailHTML(userName, redirectUrl);
      emailSubject = `Welcome to ${APP_NAME} - Start Your Mentoring Journey!`;
    } else {
      emailHTML = createMenteeWelcomeEmailHTML(userName, redirectUrl);
      emailSubject = `Welcome to ${APP_NAME} - Connect with Dental Professionals!`;
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: emailSubject,
      html: emailHTML,
    });

    return res.status(200).json({
      success: true,
      message: "Welcome email sent successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
}
