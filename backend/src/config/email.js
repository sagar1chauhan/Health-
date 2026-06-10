import nodemailer from 'nodemailer';

let transporter;

const createTransporter = async () => {
  // If SMTP credentials are not set, create an Ethereal test account
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal Test Email Account Created:');
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
    console.log(`   Preview URL: https://ethereal.email`);

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    await createTransporter();
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@healthhub.com',
    to,
    subject,
    html,
    text,
  });

  // Log preview URL for Ethereal
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 Preview URL: ${previewUrl}`);
  }

  return info;
};

export const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'HealthHub+ — Verify Your Email',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #3B82F6; text-align: center;">HealthHub+</h1>
        <p>Hello ${user.name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify Email</a>
        </div>
        <p style="color: #94A3B8; font-size: 14px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'HealthHub+ — Reset Your Password',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #3B82F6; text-align: center;">HealthHub+</h1>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #EF4444, #F59E0B); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </div>
        <p style="color: #94A3B8; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore.</p>
      </div>
    `,
  });
};

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
