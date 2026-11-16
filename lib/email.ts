import { saveEmailLog } from "./services/emailService";

// lib/email.ts
const BUSINESS_ADDRESS = "83 Fulwell Road, Sunderland, UK";
const FROM_EMAIL = process.env.EMAIL_FROM || "RYCARIX <orders@send.rycarix.com>";
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || "info@rycarix.com";

class ResendClient {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  emails = {
    send: async (payload: {
      from: string;
      to: string | string[];
      subject: string;
      html: string;
      reply_to?: string;
    }) => {
      let isDelivered = false;
      const recipient = Array.isArray(payload.to) ? payload.to.join(", ") : payload.to;

      if (this.apiKey && this.apiKey !== "dummy" && this.apiKey.startsWith("re_")) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (res.ok) {
            isDelivered = true;
          } else {
            console.warn("Resend API error:", data);
          }
        } catch (err: any) {
          console.warn("Resend fetch error:", err);
        }
      }

      // Record in local log store for telemetry and in-browser preview
      saveEmailLog({
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        type: payload.subject.includes("Dispatched") ? "DISPATCH_NOTIFICATION" : "ORDER_CONFIRMATION",
        orderNumber: payload.subject,
        to: recipient,
        subject: payload.subject,
        status: isDelivered ? "DELIVERED" : "SIMULATED_DEMO",
        html: payload.html,
        provider: isDelivered ? "Resend" : "Rycarix Mail Pipeline (Local / Preview)",
      });

      console.log(`[Email Dispatch] To: ${recipient} | Subject: ${payload.subject} | Status: ${isDelivered ? "DELIVERED" : "SIMULATED_DEMO"}`);
      return {
        data: { id: `mail_${Date.now()}` },
        error: null,
      };
    },
  };
}

const resend = new ResendClient(process.env.RESEND_API_KEY);

export interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  items: { productName: string; quantity: number; price: string }[];
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
}

export async function sendOrderConfirmationEmail(data: OrderEmailPayload) {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.productName} × ${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">£${Number(item.price).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    reply_to: REPLY_TO_EMAIL,
    subject: `Order Confirmed — #${data.orderNumber} | Rycarix`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2 style="letter-spacing: 0.1em; text-transform: uppercase;">Rycarix</h2>
        <p>Hi ${data.customerName},</p>
        <p>Thank you for your order. Your package is currently <strong>being prepared</strong> at our studio. You will receive another email with your tracking number as soon as it has been dispatched.</p>
        
        <div style="background: #f9f9f9; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> #${data.orderNumber}</p>
          <p style="margin: 0;"><strong>Status:</strong> Preparing Package</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Total</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right;">£${Number(data.totalAmount).toFixed(2)}</td>
          </tr>
        </table>

        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/orders" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 14px;">Track Order Status</a></p>

        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0 16px;" />
        <p style="font-size: 12px; color: #666;">
          Rycarix<br />
          ${BUSINESS_ADDRESS}
        </p>
      </div>
    `,
  });
}

export async function sendOrderShippedEmail(data: OrderEmailPayload) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    reply_to: REPLY_TO_EMAIL,
    subject: `Your Rycarix Order #${data.orderNumber} Has Been Dispatched`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2 style="letter-spacing: 0.1em; text-transform: uppercase;">Rycarix</h2>
        <p>Hi ${data.customerName},</p>
        <p>Great news—your order <strong>#${data.orderNumber}</strong> has been sent out for delivery.</p>

        <div style="background: #f9f9f9; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Status:</strong> Sent Out / Dispatched</p>
          <p style="margin: 0 0 8px 0;"><strong>Carrier:</strong> ${data.carrier || "Standard Courier"}</p>
          <p style="margin: 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
        </div>

        ${
          data.trackingUrl
            ? `<p><a href="${data.trackingUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 14px;">Track Your Package</a></p>`
            : `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/orders" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 14px;">View Tracking on Dashboard</a></p>`
        }

        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0 16px;" />
        <p style="font-size: 12px; color: #666;">
          Dispatched from: Rycarix, ${BUSINESS_ADDRESS}
        </p>
      </div>
    `,
  });
}
