import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { queryCustom } from '@/backend/database/direct';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const users = await queryCustom('SELECT * FROM "User" WHERE email = $1 LIMIT 1', [email]);
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Use ISO string for the timestamp
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await queryCustom(
      'UPDATE "User" SET otp = $1, "otpExpiry" = $2 WHERE id = $3',
      [otp, otpExpiry, user.id]
    );

    // Send the email
    await transporter.sendMail({
      from: `"Odoo POS Cafe" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Security Code: Verify Password Reset',
      html: `
        <div style="font-family: sans-serif; background: #020617; color: white; padding: 40px; border-radius: 24px; border: 1px solid #1e293b;">
          <h2 style="color: #0ea5e9; margin-top: 0;">Identity Recovery</h2>
          <p style="color: #94a3b8;">You requested an OTP to reset your security credentials.</p>
          <div style="background: #0f172a; padding: 24px; margin: 24px 0; border: 1px solid #334155; border-radius: 16px; text-align: center;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #38bdf8;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you did not request this, please secure your account immediately.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'OTP dispatch successful' });
  } catch (e: any) {
    console.error('FORGOT_PASS_ERROR:', e);
    return NextResponse.json({ error: e.message || 'Identity verification failed' }, { status: 500 });
  }
}
