import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactSchema } from "@/lib/validation/contact.schema";
import { withProtectedRoute } from "@/lib/security/with-protected-route";
import { rateLimit } from "@/lib/security/rate-limit";
import { renderContactEmail, renderConfirmationEmail } from "@/lib/email/contact-mail";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

function isEmailConfigured(): boolean {
  return Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim());
}

const EMAIL_UNCONFIGURED_DEV =
  "Contact email is not configured on the server. Add EMAIL_USER and EMAIL_PASS to .env.local at the project root (same folder as package.json), then stop and restart `npm run dev`.";

export async function POST(request: NextRequest) {
  return withProtectedRoute(request, async (_req, body) => {
    const rlKey = "contact:" + (request.headers.get("x-forwarded-for") || "unknown");
    const rl = await rateLimit(rlKey, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: process.env.NODE_ENV === "development" ? EMAIL_UNCONFIGURED_DEV : "Message could not be sent." },
        { status: 503 }
      );
    }

    const emailUser = process.env.EMAIL_USER!;
    const emailTo = process.env.EMAIL_TO?.trim() || emailUser;
    const content = renderContactEmail({ name, email, message });

    const transport = getTransporter();
    try {
      await transport.sendMail({
        from: emailUser,
        to: emailTo,
        replyTo: email,
        subject: content.subject,
        html: content.html,
        text: content.text,
      });

      if (process.env.SEND_CONFIRMATION_EMAIL === "true") {
        const { html } = renderConfirmationEmail({ name, email, message });
        await transport.sendMail({
          from: emailUser,
          to: email,
          subject: "Thank you for contacting λstepweaver",
          html,
        });
      }
    } catch (err) {
      const messageText =
        process.env.NODE_ENV === "development" && err instanceof Error
          ? err.message
          : "Message could not be sent.";
      console.error("[api/contact] sendMail failed", err);
      return NextResponse.json({ error: messageText }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  }, contactSchema);
}
