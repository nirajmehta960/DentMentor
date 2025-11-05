
const APP_NAME = process.env.APP_NAME || "DentMentor";

// Helper function to get timezone abbreviation
const getTimezoneAbbr = (timezone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(new Date());
    const tzName = parts.find((part) => part.type === "timeZoneName");
    return tzName?.value || timezone;
  } catch (error) {
    return timezone;
  }
};

export interface BookingEmailParams {
  menteeName: string;
  mentorName: string;
  serviceTitle: string;
  sessionDate: string;
  durationMinutes: number;
  price: number;
  dashboardUrl: string;
  timezone: string;
}

// Shared layout template
const createBaseEmailHTML = (
  title: string,
  headerTitle: string,
  headerSubtitle: string,
  contentHTML: string,
  footerText: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0FDFA;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);">
    
    <!-- Shared Header -->
    <div style="background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em;">${headerTitle}</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.95;">${headerSubtitle}</p>
    </div>

    <!-- Dynamic Content -->
    <div style="padding: 40px 32px; text-align: center;">
      ${contentHTML}
    </div>

    <!-- Shared Footer -->
    <div style="background-color: #F0FDFA; padding: 24px 32px; text-align: center; border-top: 1px solid #CCFBF1;">
      <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
      <p style="color: #64748B; font-size: 12px; margin: 0;">
        ${footerText}
      </p>
    </div>

  </div>
</body>
</html>
`;

export const createMenteeBookingConfirmedEmailHTML = ({
  menteeName,
  mentorName,
  serviceTitle,
  sessionDate,
  durationMinutes,
  price,
  dashboardUrl,
  timezone,
}: BookingEmailParams) => {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(sessionDate));

  const timezoneAbbr = getTimezoneAbbr(timezone);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

  const contentHTML = `
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Your session is confirmed, ${menteeName}!</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        Your mentorship session with ${mentorName} has been successfully booked. We're excited to help you on your journey!
      </p>
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Session Details</h3>
        <div style="color: #475569; font-size: 14px; margin: 0; line-height: 1.8;">
          <p style="margin: 0 0 12px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          <p style="margin: 0 0 12px 0;"><strong>Date & Time:</strong> ${formattedDate} (${timezoneAbbr})</p>
          <p style="margin: 0 0 12px 0;"><strong>Duration:</strong> ${durationMinutes} minutes</p>
          <p style="margin: 0;"><strong>Total:</strong> ${formattedPrice}</p>
        </div>
      </div>
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">
        View Booking
      </a>
      <p style="color: #64748B; font-size: 14px; margin: 32px 0 0 0; line-height: 1.5;">
        We'll send you a reminder before your session. See you soon!
      </p>
    `;

  return createBaseEmailHTML(
    `Booking Confirmed - ${APP_NAME}`,
    APP_NAME,
    "Booking Confirmed",
    contentHTML,
    `This email confirms your booking on ${APP_NAME}.`
  );
};

export const createMentorBookingConfirmedEmailHTML = ({
  mentorName,
  menteeName,
  serviceTitle,
  sessionDate,
  durationMinutes,
  price,
  dashboardUrl,
  timezone,
}: BookingEmailParams) => {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(sessionDate));

  const timezoneAbbr = getTimezoneAbbr(timezone);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

  const contentHTML = `
      <h2 style="color: #0F172A; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">New session booked, ${mentorName}!</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
        ${menteeName} has booked a mentorship session with you. Thank you for making a difference in their dental career journey.
      </p>
      <div style="background-color: #F0FDFA; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #CCFBF1;">
        <h3 style="color: #0D9488; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Session Details</h3>
        <div style="color: #475569; font-size: 14px; margin: 0; line-height: 1.8;">
          <p style="margin: 0 0 12px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          <p style="margin: 0 0 12px 0;"><strong>Student:</strong> ${menteeName}</p>
          <p style="margin: 0 0 12px 0;"><strong>Date & Time:</strong> ${formattedDate} (${timezoneAbbr})</p>
          <p style="margin: 0 0 12px 0;"><strong>Duration:</strong> ${durationMinutes} minutes</p>
          <p style="margin: 0;"><strong>Amount:</strong> ${formattedPrice}</p>
        </div>
      </div>
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: all 0.3s ease;">
        View Session
      </a>
      <p style="color: #64748B; font-size: 14px; margin: 32px 0 0 0; line-height: 1.5;">
        We'll send you a reminder before the session. Prepare to make an impact!
      </p>
    `;

  return createBaseEmailHTML(
    `New Booking - ${APP_NAME}`,
    APP_NAME,
    "New Booking Received",
    contentHTML,
    `This email confirms a new booking on ${APP_NAME}.`
  );
};
