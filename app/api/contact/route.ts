import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact.schema";
import { withProtectedRoute } from "@/lib/security/with-protected-route";
import { rateLimit } from "@/lib/security/rate-limit";
import nodemailer from "nodemailer";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hello@stepweaver.dev";

export async function POST(request: NextRequest) {
  return withProtectedRoute(request, async (_req, body) => {
    const rlKey = "contact:" + (request.headers.get("x-forwarded-for") || "unknown");
    const rl = rateLimit(rlKey, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    if (!process.env.SMTP_HOST?.trim()) {
      return NextResponse.json(
        {
          error:
            "Email delivery is not configured. Set SMTP_HOST (and SMTP_USER, SMTP_PASS, CONTACT_EMAIL) in the server environment.",
        },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"stepweaver.dev" <${CONTACT_EMAIL}>`,
      to: CONTACT_EMAIL,
      subject: `Contact form: ${name}`,
      replyTo: email,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, "<br>")}</p>`,
    });

    return NextResponse.json({ success: true });
  }, contactSchema);
}
