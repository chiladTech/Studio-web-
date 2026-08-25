import nodemailer from 'nodemailer';

interface InquiryEmailData {
  inquiryNumber: string;
  fullName: string;
  email: string;
  phone: string;
  service?: string | null;
  package?: string | null;
  preferredDate?: string | null;
  location?: string | null;
  budget?: string | null;
  message: string;
  contactMethod?: string | null;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendInquiryNotifications(data: InquiryEmailData) {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || 'noreply@mayapictures.com';
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'studio@mayapictures.com';
  const studioName = process.env.NEXT_PUBLIC_APP_NAME || 'Maya Pictures';

  if (!transporter) {
    console.log(`[Email Notice] SMTP not configured. Inquiry ${data.inquiryNumber} received for ${data.fullName} (${data.email}).`);
    return { success: true, simulated: true };
  }

  try {
    // 1. Notify Studio Management
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fdfaf7;">
        <div style="background-color: #6a1b2a; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">NEW SESSION INQUIRY</h2>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Reference: ${data.inquiryNumber}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
          <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Client Name:</td><td>${data.fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${data.phone}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Service Requested:</td><td>${data.service || 'General Session'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Package:</td><td>${data.package || 'Custom'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Date:</td><td>${data.preferredDate || 'Flexible / To be discussed'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td>${data.location || 'Studio / On location'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Budget:</td><td>${data.budget || 'Not specified'}</td></tr>
        </table>

        <div style="margin-top: 16px; padding: 12px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px;">
          <strong style="color: #6a1b2a;">Client Message:</strong>
          <p style="margin: 8px 0 0 0; line-height: 1.5; color: #4b5563;">${data.message}</p>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;">
          Received automatically via ${studioName} Web Portal.
        </p>
      </div>
    `;

    // 2. Client Confirmation
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fdfaf7;">
        <div style="background-color: #6a1b2a; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">${studioName}</h2>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Inquiry Received: ${data.inquiryNumber}</p>
        </div>

        <p style="font-size: 15px; color: #1f2937;">Dear <strong>${data.fullName}</strong>,</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
          Thank you for reaching out to <strong>${studioName}</strong>. We have received your booking request and our team is currently reviewing your session requirements.
        </p>

        <div style="background-color: #ffffff; border: 1px dashed #6a1b2a; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #6a1b2a;">Your Inquiry Summary</h4>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Reference No:</strong> ${data.inquiryNumber}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Service:</strong> ${data.service || 'Photography'}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Package:</strong> ${data.package || 'Custom'}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Preferred Date:</strong> ${data.preferredDate || 'To be scheduled'}</p>
        </div>

        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
          One of our creative directors will contact you via <strong>${data.contactMethod || 'email or phone'}</strong> within 24 hours with availability and next steps.
        </p>

        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: #1f2937;">Maya Pictures Creative Studio</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">High-End Photography & Cinema</p>
        </div>
      </div>
    `;

    const clientEmail = (data.email || '').trim().toLowerCase();

    // 1. Send Management Alert
    try {
      await transporter.sendMail({
        from: `"${studioName}" <${fromEmail}>`,
        to: notificationEmail,
        replyTo: clientEmail || undefined,
        subject: `🔔 New Session Inquiry [${data.inquiryNumber}] — ${data.fullName}`,
        html: adminHtml,
      });
      console.log(`[Email Success] Admin notification delivered to ${notificationEmail} for ${data.inquiryNumber}`);
    } catch (adminErr: any) {
      console.error(`[Email Error] Failed to send admin notification for ${data.inquiryNumber}:`, adminErr?.message || adminErr);
    }

    // 2. Send Client Confirmation Receipt
    if (clientEmail && clientEmail.includes('@')) {
      // Pause 1.2 seconds to respect sandbox/free-tier SMTP rate limits (e.g. Mailtrap 1 email/sec limit)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        await transporter.sendMail({
          from: `"${studioName}" <${fromEmail}>`,
          to: clientEmail,
          subject: `Your Booking Inquiry with ${studioName} [${data.inquiryNumber}]`,
          html: clientHtml,
        });
        console.log(`[Email Success] Client confirmation receipt delivered to ${clientEmail} for ${data.inquiryNumber}`);
      } catch (clientErr: any) {
        // If rate limited, wait 2 seconds and retry once
        if (clientErr?.message?.includes('Too many emails') || clientErr?.message?.includes('rate')) {
          console.log(`[Email Notice] Rate limit encountered. Retrying client receipt in 2 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          try {
            await transporter.sendMail({
              from: `"${studioName}" <${fromEmail}>`,
              to: clientEmail,
              subject: `Your Booking Inquiry with ${studioName} [${data.inquiryNumber}]`,
              html: clientHtml,
            });
            console.log(`[Email Success] Client confirmation receipt delivered to ${clientEmail} on retry.`);
          } catch (retryErr: any) {
            console.error(`[Email Error] Retry failed for client receipt:`, retryErr?.message || retryErr);
          }
        } else {
          console.error(`[Email Error] Failed to send client confirmation receipt to ${clientEmail} for ${data.inquiryNumber}:`, clientErr?.message || clientErr);
        }
      }
    } else {
      console.warn(`[Email Warning] No valid client email provided for inquiry ${data.inquiryNumber} (received: "${data.email}")`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed in email dispatch pipeline:', error);
    return { success: false, error: error.message };
  }
}
