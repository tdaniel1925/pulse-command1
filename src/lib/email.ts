import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@pulsecommand.com'

export async function sendWelcomeEmail({
  to,
  firstName,
  businessName,
  pin,
}: {
  to: string
  firstName: string
  businessName: string
  pin: string
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to PulseCommand, ${firstName}!`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Inter, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="background: #2563eb; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">⚡ PulseCommand</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111827; margin-top: 0;">Welcome, ${firstName}!</h2>
      <p style="color: #6b7280;">Your account for <strong>${businessName}</strong> is ready. Your content machine starts now.</p>

      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: #0369a1; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">YOUR ONBOARDING PIN</p>
        <p style="color: #0c4a6e; font-size: 36px; font-weight: 800; letter-spacing: 8px; margin: 0;">${pin}</p>
        <p style="color: #0369a1; font-size: 12px; margin: 8px 0 0 0;">Use this when you call +1 (651) 728-7626 for your brand interview</p>
      </div>

      <h3 style="color: #111827;">What happens next:</h3>
      <ol style="color: #6b7280; line-height: 1.8;">
        <li>Call <strong>+1 (651) 728-7626</strong> and enter your PIN when prompted</li>
        <li>Complete your 15-minute brand interview with our AI</li>
        <li>We'll build your brand profile and start generating content</li>
        <li>Within 48 hours, your first content batch will be ready</li>
      </ol>

      <div style="text-align: center; margin-top: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background: #2563eb; color: white; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px;">
          Go to Dashboard →
        </a>
      </div>
    </div>
    <div style="padding: 20px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PulseCommand. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  })
}

export async function sendReportEmail({
  to,
  firstName,
  month,
  year,
  pdfUrl,
}: {
  to: string
  firstName: string
  month: string
  year: number
  pdfUrl?: string
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${month} ${year} Performance Report is Ready`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="background: #2563eb; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">⚡ PulseCommand</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111827; margin-top: 0;">Hi ${firstName}, your ${month} report is ready!</h2>
      <p style="color: #6b7280;">Your monthly performance report for ${month} ${year} has been generated.</p>
      ${pdfUrl ? `<div style="text-align: center; margin-top: 32px;">
        <a href="${pdfUrl}" style="display: inline-block; background: #2563eb; color: white; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
          Download Report PDF
        </a>
      </div>` : ''}
      <div style="text-align: center; margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/report" style="color: #2563eb; font-size: 14px;">View in Dashboard →</a>
      </div>
    </div>
  </div>
</body>
</html>`,
  })
}

export async function sendSMSNotification(message: string) {
  // Slack fallback for internal notifications
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    })
  }
}
