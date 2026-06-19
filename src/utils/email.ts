import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTeacherCvEmail(
  to: string,
  firstName: string,
  status: "approved" | "rejected",
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_DOMAIN?.split(",")[0]?.trim() || "http://localhost:3000";
  const isApproved = status === "approved";

  const subject = isApproved
    ? "Your CourSally teacher application has been approved"
    : "Update on your CourSally teacher application";

  const html = isApproved
    ? `
      <p>Hi ${firstName},</p>
      <p>Great news! Your CV has been reviewed and <strong>approved</strong>.</p>
      <p>You can now sign in and access your teacher dashboard:</p>
      <p><a href="${frontendUrl}/auth/login">${frontendUrl}/auth/login</a></p>
      <p>Welcome to CourSally!</p>
    `
    : `
      <p>Hi ${firstName},</p>
      <p>Thank you for applying to teach on CourSally.</p>
      <p>After reviewing your CV, we are unable to approve your application at this time.</p>
      <p>If you believe this was a mistake, please contact our support team.</p>
    `;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn("SMTP not configured — skipping email", { to, status });
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
