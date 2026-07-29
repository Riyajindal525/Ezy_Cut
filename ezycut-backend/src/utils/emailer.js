const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInvoiceEmail = async (invoice, pdfAbsolutePath) => {
  if (!invoice.customer?.email) {
    console.warn(`[EMAIL SKIPPED] No email on file for customer ${invoice.customer?._id}`);
    return { sent: false, reason: "No customer email on file" };
  }

  const amountFormatted = `Rs. ${invoice.totalAmount.toLocaleString("en-IN")}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: invoice.customer.email,
    subject: `Your Invoice ${invoice.invoiceNumber} from ${invoice.salon?.name || "EzyCut"}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f7f9f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color:#ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(4,47,46,0.08);">

          <!-- Header band -->
          <tr>
            <td style="background: linear-gradient(135deg, #031715 0%, #042f2e 50%, #0f766e 100%); padding: 32px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block; width:36px; height:36px; background:rgba(255,255,255,0.12); border-radius:10px; text-align:center; line-height:36px; font-size:16px; margin-bottom:14px;">✂️</span>
                    <div style="font-size: 22px; font-weight: 800; color:#ffffff; letter-spacing:-0.02em; font-family: Georgia, serif;">
                      EZY<span style="color:#5eead4;">CUT</span>
                    </div>
                    <div style="font-size: 13px; color:rgba(255,255,255,0.6); margin-top:4px;">Your invoice is ready</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; color:#022525; margin: 0 0 16px;">
                Hi <strong>${invoice.customer.name || "there"}</strong>,
              </p>
              <p style="font-size: 14px; color:#5b6b68; line-height:1.7; margin: 0 0 24px;">
                Thank you for visiting <strong style="color:#022525;">${invoice.salon?.name || "our salon"}</strong>.
                Your invoice has been generated and is attached to this email as a PDF.
              </p>

              <!-- Invoice summary card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdfa; border:1px solid #ccfbf1; border-radius:12px; margin-bottom:24px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:11px; font-weight:700; color:#0f766e; text-transform:uppercase; letter-spacing:0.05em; padding-bottom:6px;">
                          Invoice Number
                        </td>
                        <td align="right" style="font-size:11px; font-weight:700; color:#0f766e; text-transform:uppercase; letter-spacing:0.05em; padding-bottom:6px;">
                          Total Amount
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:16px; font-weight:800; color:#022525; font-family: 'Courier New', monospace;">
                          ${invoice.invoiceNumber}
                        </td>
                        <td align="right" style="font-size:20px; font-weight:800; color:#0d9488;">
                          ${amountFormatted}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color:#9ca3af; line-height:1.6; margin: 0;">
                📎 The full invoice PDF is attached to this email. If you have any questions about this invoice, please reach out to the salon directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f7f9f8; padding: 20px 32px; border-top:1px solid #e5e7eb;">
              <p style="font-size: 11px; color:#9ca3af; text-align:center; margin: 0; line-height:1.6;">
                This is a computer-generated email from <strong>EzyCut Solutions Private Limited</strong>.<br/>
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    attachments: [
      {
        filename: `${invoice.invoiceNumber}.pdf`,
        path: pdfAbsolutePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  return { sent: true };
};

const sendSalonReopenedEmail = async (customer, salon) => {
  if (!customer?.email) {
    console.warn(`[EMAIL SKIPPED] No email on file for customer ${customer?._id}`);
    return { sent: false, reason: "No customer email on file" };
  }

  const salonUrl = `${process.env.FRONTEND_URL || "https://ezycut.co.in"}/salons/${salon._id}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: customer.email,
    subject: `${salon.name} is now open — book your slot!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f7f9f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color:#ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(4,47,46,0.08);">

          <!-- Header band -->
          <tr>
            <td style="background: linear-gradient(135deg, #031715 0%, #042f2e 50%, #0f766e 100%); padding: 32px 32px 28px;">
              <span style="display:inline-block; width:36px; height:36px; background:rgba(255,255,255,0.12); border-radius:10px; text-align:center; line-height:36px; font-size:16px; margin-bottom:14px;">🔔</span>
              <div style="font-size: 22px; font-weight: 800; color:#ffffff; letter-spacing:-0.02em; font-family: Georgia, serif;">
                EZY<span style="color:#5eead4;">CUT</span>
              </div>
              <div style="font-size: 13px; color:rgba(255,255,255,0.6); margin-top:4px;">Good news — the salon you wanted is open</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; color:#022525; margin: 0 0 16px;">
                Hi <strong>${customer.name || "there"}</strong>,
              </p>
              <p style="font-size: 14px; color:#5b6b68; line-height:1.7; margin: 0 0 24px;">
                <strong style="color:#022525;">${salon.name}</strong> is now accepting bookings again.
                You asked to be notified when they reopened — now's your chance to grab a slot before it fills up!
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdfa; border:1px solid #ccfbf1; border-radius:12px; margin-bottom:28px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size:11px; font-weight:700; color:#0f766e; text-transform:uppercase; letter-spacing:0.05em; padding-bottom:6px;">
                      Now Open
                    </div>
                    <div style="font-size:17px; font-weight:800; color:#022525;">
                      ${salon.name}
                    </div>
                    <div style="font-size:13px; color:#5b6b68; margin-top:4px;">
                      ${salon.address || ""}, ${salon.city || ""}
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius:10px; background-color:#0d9488;">
                    <a href="${salonUrl}" style="display:inline-block; padding:13px 32px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;">
                      Book Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f7f9f8; padding: 20px 32px; border-top:1px solid #e5e7eb;">
              <p style="font-size: 11px; color:#9ca3af; text-align:center; margin: 0; line-height:1.6;">
                You're receiving this because you asked to be notified when this salon reopened.<br/>
                <strong>EzyCut Solutions Private Limited</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { sent: true };
};

module.exports = { sendInvoiceEmail, sendSalonReopenedEmail };
