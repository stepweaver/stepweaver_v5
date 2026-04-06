import { escapeHtmlForEmail } from "@/lib/email/escape-html-for-email";

export function renderContactEmail(formData: { name: string; email: string; message: string }) {
  const { name, email, message } = formData;
  const safeName = escapeHtmlForEmail(name);
  const safeEmail = escapeHtmlForEmail(email);
  const safeMessage = escapeHtmlForEmail(message);

  return {
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
        </div>
        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
          <h3 style="color: #007bff; margin-top: 0;">Project Summary</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
          <p>This message was sent from the contact form on your website.</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
    text: `
New Contact Form Submission

Contact Information:
- Name: ${name}
- Email: ${email}

Project Summary:
${message}

Timestamp: ${new Date().toLocaleString()}
    `,
  };
}

export function renderConfirmationEmail(formData: { name: string; email: string; message: string }) {
  const { name, email, message } = formData;
  const safeName = escapeHtmlForEmail(name);
  const safeMessage = escapeHtmlForEmail(message);

  return {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for reaching out!</h2>
        <p>Hi ${safeName},</p>
        <p>I've received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
        <p>Best regards,<br>Stephen<br>FOUNDER<br>λstepweaver</p>
      </div>
    `,
  };
}
