import fs from 'fs';
import path from 'path';

export interface OrderConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  total: number;
  subtotal?: number;
  shippingCost?: number;
  shippingMethod?: string;
  paymentMethod?: string;
  items: Array<{
    title: string;
    variantTitle?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  address: {
    name?: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  trackingUrl?: string;
}

export interface DispatchNotificationEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  carrier: string;
  trackingNumber: string;
  serviceLevel?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  items?: Array<{
    title: string;
    variantTitle?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  address?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  type: 'ORDER_CONFIRMATION' | 'DISPATCH_NOTIFICATION';
  orderNumber: string;
  to: string;
  subject: string;
  status: 'DELIVERED' | 'SIMULATED_DEMO' | 'FAILED';
  carrier?: string;
  trackingNumber?: string;
  html: string;
  provider: string;
  error?: string;
}

const EMAIL_LOG_FILE = path.join('/tmp', 'rycarix_email_logs.json');

export function loadEmailLogs(): EmailLogEntry[] {
  try {
    if (fs.existsSync(EMAIL_LOG_FILE)) {
      const data = JSON.parse(fs.readFileSync(EMAIL_LOG_FILE, 'utf8'));
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Could not read email log cache', e);
  }
  return [];
}

export function saveEmailLog(entry: EmailLogEntry) {
  try {
    const existing = loadEmailLogs();
    const updated = [entry, ...existing.slice(0, 99)]; // Keep last 100
    fs.writeFileSync(EMAIL_LOG_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not save email log', e);
  }
}

/**
 * Build Luxury Rycarix HTML Order Confirmation Email
 */
export function buildOrderConfirmationEmailHtml(data: OrderConfirmationEmailData): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.rycarix.com').replace(/\/$/, '');
  const orderStatusLink =
    data.trackingUrl || `${appUrl}/dashboard/user?orderId=${encodeURIComponent(data.orderNumber)}`;
  const subtotal = data.subtotal !== undefined ? data.subtotal : Math.max(0, data.total - (data.shippingCost || 0));
  const shippingDisplay =
    data.shippingCost !== undefined && data.shippingCost > 0
      ? `£${data.shippingCost.toFixed(2)}`
      : 'FREE';

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #ECE7DE;">
          <div style="font-family: Georgia, serif; font-size: 15px; color: #1A1A1A; font-weight: 500;">
            ${item.title}
          </div>
          ${item.variantTitle ? `<div style="font-size: 12px; color: #736E65; margin-top: 3px;">Edition: ${item.variantTitle}</div>` : ''}
          <div style="font-size: 12px; color: #736E65; margin-top: 2px;">Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #ECE7DE; text-align: right; vertical-align: top; font-family: monospace; font-size: 14px; color: #1A1A1A;">
          £${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation • ${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5EF; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E5DFD3; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #3D1220; padding: 36px 32px; text-align: center;">
              <div style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 0.28em; color: #FFFFFF; text-transform: uppercase; font-weight: 400; margin: 0;">
                R Y C A R I X
              </div>
              <div style="font-size: 10px; letter-spacing: 0.3em; color: #E7DFD5; text-transform: uppercase; margin-top: 8px;">
                Parfum &amp; Botanical Care
              </div>
            </td>
          </tr>

          <!-- Confirmation Title & Order Badge -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #F4EFEB; border: 1px solid #DECFC0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #4A1525; font-weight: 600; margin-bottom: 16px;">
                Order Confirmed
              </div>
              <h1 style="font-family: Georgia, serif; font-size: 24px; color: #1A1A1A; font-weight: normal; margin: 0 0 12px 0;">
                Thank you for your purchase, ${data.customerName || 'Valued Client'}.
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #5C5850; margin: 0 0 20px 0;">
                Your order <strong style="color: #1A1A1A; font-family: monospace;">${data.orderNumber}</strong> has been registered at our London fulfillment center. Each product is carefully inspected and prepared prior to courier dispatch.
              </p>
              
              <div style="background-color: #FBF9F5; border-left: 3px solid #3D1220; padding: 12px 16px; font-size: 12px; color: #666; margin-bottom: 24px;">
                <strong>Order Date:</strong> ${data.date} &nbsp;•&nbsp; <strong>Payment:</strong> ${data.paymentMethod || 'Stripe / Klarna'}
              </div>
            </td>
          </tr>

          <!-- Itemized Product Table -->
          <tr>
            <td style="padding: 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th align="left" style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8A847A; padding-bottom: 10px; border-bottom: 2px solid #1A1A1A;">Product</th>
                    <th align="right" style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8A847A; padding-bottom: 10px; border-bottom: 2px solid #1A1A1A;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Pricing Breakdown -->
          <tr>
            <td style="padding: 20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #736E65;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #1A1A1A;">£${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #736E65;">Delivery (${data.shippingMethod || 'Standard UK Delivery'})</td>
                  <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #1A1A1A;">${shippingDisplay}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0 0; font-family: Georgia, serif; font-size: 18px; color: #1A1A1A; border-top: 1px solid #1A1A1A;">Grand Total</td>
                  <td style="padding: 12px 0 0 0; text-align: right; font-family: Georgia, serif; font-size: 20px; color: #3D1220; font-weight: bold; border-top: 1px solid #1A1A1A;">£${data.total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address & Hazmat Notice -->
          <tr>
            <td style="padding: 16px 32px 28px 32px;">
              <div style="background-color: #F8F5EF; border: 1px solid #E5DFD3; padding: 20px;">
                <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #3D1220; font-weight: bold; margin-bottom: 8px;">
                  Destination & Delivery Address
                </div>
                <div style="font-size: 13px; color: #2B2824; line-height: 1.5;">
                  <strong>${data.address?.name || data.customerName}</strong><br>
                  ${data.address?.street}<br>
                  ${data.address?.city}${data.address?.state ? `, ${data.address.state}` : ''} ${data.address?.postalCode}<br>
                  ${data.address?.country || 'United Kingdom'}<br>
                  ${data.customerPhone ? `<span style="font-size: 11px; color: #777;">Phone: ${data.customerPhone}</span>` : ''}
                </div>
              </div>

              <div style="margin-top: 16px; padding: 12px; background-color: #FFFDF9; border: 1px solid #ECE3D4; font-size: 11px; color: #6E685F; line-height: 1.5;">
                <strong style="color: #3D1220;">UN 1266 Limited Quantity (LQ) Compliant:</strong> Parfums containing alcohol are packed under certified temperature-regulated air & road transit protocols with Royal Mail / Evri courier tracking.
              </div>
            </td>
          </tr>

          <!-- Call to Action Order Status Button -->
          <tr>
            <td style="padding: 0 32px 36px 32px; text-align: center;">
              <a href="${orderStatusLink}" style="display: inline-block; background-color: #3D1220; color: #FFFFFF; text-decoration: none; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600; padding: 16px 36px; border-radius: 0; box-shadow: 0 2px 8px rgba(61,18,32,0.25);">
                View Order Status &rarr;
              </a>
              <div style="font-size: 11px; color: #8A847A; margin-top: 10px;">
                You will receive a separate dispatch email with tracking details once your parcel ships.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F2ECE3; padding: 24px 32px; border-top: 1px solid #E5DFD3; text-align: center; font-size: 11px; color: #736E65; line-height: 1.6;">
              <div>RYCARIX • Rycarix Atelier House, London, United Kingdom</div>
              <div style="margin-top: 6px;">Questions? Inquire with our private concierge at <a href="mailto:concierge@rycarix.com" style="color: #3D1220; text-decoration: underline;">concierge@rycarix.com</a></div>
              <div style="margin-top: 10px; color: #9E988E; font-size: 10px;">© ${new Date().getFullYear()} RYCARIX. All rights reserved.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Build Luxury Rycarix HTML Dispatch Notification Email
 */
export function buildDispatchNotificationEmailHtml(data: DispatchNotificationEmailData): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.rycarix.com').replace(/\/$/, '');
  const trackingLink =
    data.trackingUrl ||
    `${appUrl}/track?ref=${encodeURIComponent(data.trackingNumber || data.orderNumber)}`;

  const itemsSummaryHtml = data.items && data.items.length > 0
    ? `
      <div style="margin-top: 20px; border-top: 1px solid #ECE7DE; padding-top: 16px;">
        <div style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8A847A; margin-bottom: 8px;">
          Enclosed Products:
        </div>
        ${data.items
          .map(
            (i) => `
          <div style="font-size: 13px; color: #1A1A1A; padding: 4px 0;">
            • <strong>${i.title}</strong> ${i.variantTitle ? `(${i.variantTitle})` : ''} &times; ${i.quantity}
          </div>
        `
          )
          .join('')}
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Been Dispatched • ${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5EF; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E5DFD3; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- Atelier Header Banner -->
          <tr>
            <td style="background-color: #3D1220; padding: 36px 32px; text-align: center;">
              <div style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 0.28em; color: #FFFFFF; text-transform: uppercase; font-weight: 400; margin: 0;">
                R Y C A R I X
              </div>
              <div style="font-size: 10px; letter-spacing: 0.3em; color: #E7DFD5; text-transform: uppercase; margin-top: 8px;">
                Courier Fulfillment &amp; Dispatch
              </div>
            </td>
          </tr>

          <!-- Dispatch Announcement -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #EBF7EE; border: 1px solid #B8E4C0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #1B6E32; font-weight: 600; margin-bottom: 16px;">
                ✓ Dispatched &amp; In Transit
              </div>
              <h1 style="font-family: Georgia, serif; font-size: 24px; color: #1A1A1A; font-weight: normal; margin: 0 0 12px 0;">
                Your Rycarix order is on its way.
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #5C5850; margin: 0 0 24px 0;">
                Dear ${data.customerName || 'Valued Client'}, your parcel has completed final quality clearance and was handed over to <strong style="color: #1A1A1A;">${data.carrier}</strong> for tracked delivery.
              </p>

              <!-- Live Courier Details Card -->
              <div style="background-color: #FBF9F5; border: 1px solid #DECFC0; padding: 24px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 6px 0; color: #736E65; width: 40%;">Courier Carrier:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #1A1A1A;">${data.carrier}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #736E65;">Service Level:</td>
                    <td style="padding: 6px 0; color: #1A1A1A;">${data.serviceLevel || `${data.carrier} Priority Tracked`}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #736E65;">Waybill / Tracking #:</td>
                    <td style="padding: 6px 0; font-family: monospace; font-size: 15px; font-weight: bold; color: #3D1220;">
                      ${data.trackingNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #736E65;">Estimated Delivery:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #1B6E32;">${data.estimatedDelivery || '2–3 working days'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #736E65;">Order Reference:</td>
                    <td style="padding: 6px 0; font-family: monospace; color: #1A1A1A;">${data.orderNumber}</td>
                  </tr>
                </table>

                ${itemsSummaryHtml}
              </div>

              <!-- Recipient Address Confirmation -->
              ${
                data.address
                  ? `
              <div style="background-color: #F8F5EF; border: 1px solid #E5DFD3; padding: 16px; font-size: 12px; color: #444; line-height: 1.5; margin-bottom: 24px;">
                <strong style="color: #3D1220; text-transform: uppercase; letter-spacing: 0.15em; font-size: 10px; display: block; margin-bottom: 4px;">Delivering To:</strong>
                ${data.customerName}<br>
                ${data.address.street}, ${data.address.city} ${data.address.postalCode}, ${data.address.country || 'United Kingdom'}
              </div>
              `
                  : ''
              }

              <!-- Call to Action Button -->
              <div style="text-align: center; padding: 8px 0 20px 0;">
                <a href="${trackingLink}" style="display: inline-block; background-color: #3D1220; color: #FFFFFF; text-decoration: none; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600; padding: 16px 36px; box-shadow: 0 2px 8px rgba(61,18,32,0.25);">
                  Track Delivery Journey &rarr;
                </a>
                <div style="font-size: 11px; color: #8A847A; margin-top: 10px;">
                  View live courier milestones, GPS scan points, and estimated delivery window
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F2ECE3; padding: 24px 32px; border-top: 1px solid #E5DFD3; text-align: center; font-size: 11px; color: #736E65; line-height: 1.6;">
              <div>RYCARIX • Rycarix Atelier House, London, United Kingdom</div>
              <div style="margin-top: 6px;">Questions about your parcel? Reach out at <a href="mailto:concierge@rycarix.com" style="color: #3D1220; text-decoration: underline;">concierge@rycarix.com</a></div>
              <div style="margin-top: 10px; color: #9E988E; font-size: 10px;">© ${new Date().getFullYear()} RYCARIX. All rights reserved.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Dispatch Email Sender (supports Resend, SendGrid, and graceful simulated logging)
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  type,
  orderNumber,
  carrier,
  trackingNumber,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  type: 'ORDER_CONFIRMATION' | 'DISPATCH_NOTIFICATION';
  orderNumber: string;
  carrier?: string;
  trackingNumber?: string;
}): Promise<{ success: boolean; id: string; status: 'DELIVERED' | 'SIMULATED_DEMO' | 'FAILED'; error?: string }> {
  const id = `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();
  const from = process.env.EMAIL_FROM || 'RYCARIX <orders@rycarix.com>';

  // 1. Check for Resend API Key
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey && !resendApiKey.includes('...')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          text: text || subject,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        const logEntry: EmailLogEntry = {
          id: resData.id || id,
          timestamp,
          type,
          orderNumber,
          to,
          subject,
          status: 'DELIVERED',
          carrier,
          trackingNumber,
          html,
          provider: 'Resend',
        };
        saveEmailLog(logEntry);
        return { success: true, id: resData.id || id, status: 'DELIVERED' };
      } else {
        console.warn('Resend API returned error:', resData);
      }
    } catch (resendErr: any) {
      console.warn('Resend email dispatch error:', resendErr);
    }
  }

  // 2. Check for SendGrid API Key
  const sendgridApiKey = (process.env.SENDGRID_API_KEY || '').trim();
  if (sendgridApiKey && !sendgridApiKey.includes('...')) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from.includes('<') ? from.split('<')[1].replace('>', '').trim() : from, name: 'RYCARIX' },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      });

      if (response.ok || response.status === 202) {
        const logEntry: EmailLogEntry = {
          id,
          timestamp,
          type,
          orderNumber,
          to,
          subject,
          status: 'DELIVERED',
          carrier,
          trackingNumber,
          html,
          provider: 'SendGrid',
        };
        saveEmailLog(logEntry);
        return { success: true, id, status: 'DELIVERED' };
      }
    } catch (sendgridErr: any) {
      console.warn('SendGrid email dispatch error:', sendgridErr);
    }
  }

  // 3. Graceful Simulation / Local Pipeline:
  // Rendered full HTML is logged and immediately viewable in preview or admin telemetry
  const logEntry: EmailLogEntry = {
    id,
    timestamp,
    type,
    orderNumber,
    to,
    subject,
    status: 'SIMULATED_DEMO',
    carrier,
    trackingNumber,
    html,
    provider: 'Rycarix Mail Pipeline (Local / Preview)',
  };
  saveEmailLog(logEntry);

  console.log(`[Rycarix Mail] ${type} generated for ${to} (${orderNumber}). Status: SIMULATED_DEMO (Add RESEND_API_KEY in .env for production SMTP/API inbox delivery).`);

  return { success: true, id, status: 'SIMULATED_DEMO' };
}

