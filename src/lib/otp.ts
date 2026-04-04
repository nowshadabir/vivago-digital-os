import { createHmac, randomInt } from "node:crypto";

import nodemailer from "nodemailer";

type OtpPurpose = "signup" | "login";

type OtpEmailInput = {
  to: string;
  code: string;
  purpose: OtpPurpose;
};

function getOtpSecret() {
  return process.env.AUTH_OTP_SECRET ?? process.env.AUTH_SESSION_SECRET ?? "vivago-otp-secret";
}

function getMailTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Gmail credentials are not configured.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export function generateOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtpCode(code: string) {
  return createHmac("sha256", getOtpSecret()).update(code).digest("hex");
}

export async function sendOtpEmail({ to, code, purpose }: OtpEmailInput) {
  const transport = getMailTransport();
  const subject = purpose === "signup" ? "Verify your account" : "Confirm your login";
  const label = purpose === "signup" ? "account creation" : "login";

  await transport.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: `VIVAGO DIGITAL OS - ${subject}`,
    text: `Your verification code for ${label} is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin:0 0 12px">VIVAGO DIGITAL OS</h2>
        <p style="margin:0 0 12px">Your verification code for ${label} is:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;display:inline-block">${code}</div>
        <p style="margin:12px 0 0;color:#475569">This code expires in 10 minutes.</p>
      </div>
    `,
  });
}