// Email notifications via Resend (https://resend.com)
// Free tier: 3,000 emails/month — perfect for this use case.
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

/�� HEADR HEADA HEADA Send email (with fallback to console) ───────────────────────────────(*async function sendEmail({ to, subject, html }) {
  const resend = await getResendClient();

  if (!resend) {
    console.log("═══ EMAIL (no Resend key — logged only) ═══");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html.replace(/<[^>]*>/g, "").substring(0, 200)}...`);
    console.log("══════════════════════════════════════════");
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

/��[\]\�8�)\]Y[XZ[�[��YHTH��X��[����\�Y\��eٝ[��[ۈ�\�U[\]J�۝[�
H�]\��