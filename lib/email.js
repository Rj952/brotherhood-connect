// Email notifications via Resend (https://resend.com)
// Free tier: 3,000 emails/month â perfect for this use case.
// If RESEND_API_KEY is not set, emails are logged to console instead.

let Resend;

async function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!Resend) {
    const mod = await import("resend");
    Resend = mod.Resend;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM || "Brotherhood Connect <noreply@example.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@brotherhoodconnect.com";

// ââ Send email (with fallback to console) âââââââââââââââââââââââââââââââ

async function sendEmail({ to, subject, html }) {
  const resend = await getResendClient();

  if (!resend) {
    console.log("âââ EMAIL (no Resend key â logged only) âââ");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html.replace(/<[^>]*>/g, "").substring(0, 200)}...`);
    console.log("âââââââââââââââââââââââââââââââââââââââââââ");
    return { success: true, method: "console" };
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }
    return { success: true, id: data.id, method: "resend" };
  } catch (err) {
    console.error("Email failed:", err);
    return { success: false, error: err.message };
  }
}

// ââ Email Templates âââââââââââââââââââââââââââââââââââââââââââââââââââââ

function baseTemplate(content) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F0EDE6; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="font-size: 2rem;">ð¤</span>
        <h1 style="font-family: Georgia, serif; color: #D4A843; font-size: 1.5rem; margin: 8px 0 0;">Brotherhood Connect</h1>
      </div>
      ${content}
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 0.8rem; color: #6B6780;">
        <p>Brotherhood Connect â Created by Rohan Jowallah</p>
        <p>Built on 85+ years of Harvard research</p>
      </div>
    </div>
  `;
}

// ââ Notify admin when someone registers âââââââââââââââââââââââââââââââââ

export async function notifyAdminNewRegistration(user) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `ð¤ New Registration Request: ${user.name}`,
    html: baseTemplate(`
      <h2 style="color: #D4A843; font-size: 1.2rem;">New Member Request</h2>
      <div style="background: #141420; padding: 20px; border-radius: 12px; margin: 16px 0;">
        <p><strong style="color: #D4A843;">Name:</strong> ${user.name}</p>
        <p><strong style="color: #D4A843;">Email:</strong> ${user.email}</p>
        <p><strong style="color: #D4A843;">Referred by:</strong> ${user.invited_by || "Direct registration"}</p>
        ${user.reason ? `<p><strong style="color: #D4A843;">Reason:</strong> "${user.reason}"</p>` : ""}
        <p><strong style="color: #D4A843;">Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p style="color: #A8A4B8;">Log in to the admin dashboard to approve or deny this request:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${APP_URL}/admin" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #D4A843, #C09430); color: #0A0A0F; text-decoration: none; font-weight: bold; border-radius: 8px;">Review in Admin Panel</a>
      </div>
    `),
  });
}

// ââ Notify user when they're approved âââââââââââââââââââââââââââââââââââ

export async function notifyUserApproved(user) {
  return sendEmail({
    to: user.email,
    subject: "ð¤ Welcome to Brotherhood Connect â You're In!",
    html: baseTemplate(`
      <h2 style="color: #D4A843; font-size: 1.2rem;">Welcome, ${user.name.split(" ")[0]}!</h2>
      <p style="color: #A8A4B8; line-height: 1.7;">Your request to join Brotherhood Connect has been approved. You now have full access to our research-powered wellness platform built for Black and brown men.</p>
      <div style="background: rgba(212,168,67,0.1); padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(212,168,67,0.15);">
        <p style="color: #F0EDE6; margin: 0;">ð¡ï¸ <strong>Privacy</strong> â What happens in the circle stays in the circle</p>
        <p style="color: #F0EDE6; margin: 8px 0 0;">ðª <strong>Strength</strong> â Vulnerability is courage, not weakness</p>
        <p style="color: #F0EDE6; margin: 8px 0 0;">ð <strong>Culture</strong> â Our heritage is our power</p>
        <p style="color: #F0EDE6; margin: 8px 0 0;">ð¤ <strong>Brotherhood</strong> â We rise by lifting each other</p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #D4A843, #C09430); color: #0A0A0F; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 1.05rem;">Enter the Circle</a>
      </div>
      <p style="color: #6B6780; font-size: 0.85rem; text-align: center;">Sign in with the email and password you used to register.</p>
    `),
  });
}

// ââ Notify user when they're denied âââââââââââââââââââââââââââââââââââââ

export async function notifyUserDenied(user) {
  return sendEmail({
    to: user.email,
    subject: "Brotherhood Connect â Registration Update",
    html: baseTemplate(`
      <h2 style="color: #D4A843; font-size: 1.2rem;">Hello, ${user.name.split(" ")[0]}</h2>
      <p style="color: #A8A4B8; line-height: 1.7;">Thank you for your interest in Brotherhood Connect. After reviewing your registration, we're unable to approve access at this time.</p>
      <p style="color: #A8A4B8; line-height: 1.7;">If you believe this is an error or have questions, please reach out to the administrator.</p>
    `),
  });
}

// ââ Registration confirmation to user âââââââââââââââââââââââââââââââââââ

export async function notifyUserRegistered(user) {
  return sendEmail({
    to: user.email,
    subject: "ð¤ Brotherhood Connect â Registration Received",
    html: baseTemplate(`
      <h2 style="color: #D4A843; font-size: 1.2rem;">Thank You, ${user.name.split(" ")[0]}</h2>
      <p style="color: #A8A4B8; line-height: 1.7;">Your registration request for Brotherhood Connect has been received. Our administrator will review your request and you'll receive an email once a decision has been made.</p>
      <p style="color: #A8A4B8; line-height: 1.7;">Brotherhood Connect is a private, research-powered wellness platform designed for Black and brown men. We take care in building our community, which is why access is approved individually.</p>
      <p style="color: #6B6780; font-size: 0.85rem; margin-top: 24px;">You'll be notified at this email address when your access is ready.</p>
    `),
  });
}
