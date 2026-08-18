import { insforge } from '@/lib/insforge-client';
import { siteConfig } from '@/lib/site';

/**
 * Transactional email. Failures are logged and swallowed — a customer who has
 * paid must never see an error because the receipt could not be sent.
 */

type OrderEmailInput = {
  to: string;
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number; size?: string; color?: string }[];
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  shipping: number;
  grandTotal: number;
  paymentMethod: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
};

const rupees = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOrderHtml(o: OrderEmailInput): string {
  const rows = o.items
    .map((it) => {
      const variant = [it.size && `Size ${it.size}`, it.color].filter(Boolean).join(' · ');
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <div style="font-weight:600;color:#2b1b17;">${escapeHtml(it.name)}</div>
            ${variant ? `<div style="font-size:12px;color:#7a6e60;">${escapeHtml(variant)}</div>` : ''}
            <div style="font-size:12px;color:#7a6e60;">Qty ${it.quantity}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;color:#2b1b17;">
            ${rupees(it.price * it.quantity)}
          </td>
        </tr>`;
    })
    .join('');

  const addr = o.address
    ? [o.address.street, [o.address.city, o.address.state].filter(Boolean).join(', '), o.address.pincode]
        .filter(Boolean)
        .map((l) => escapeHtml(String(l)))
        .join('<br>')
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fdfbf7;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 20px;">

      <div style="background:#6b1d2f;color:#fdfbf7;padding:22px 24px;border-radius:10px 10px 0 0;">
        <div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#c59b27;">
          ${escapeHtml(siteConfig.name)}
        </div>
        <div style="font-size:22px;font-weight:bold;margin-top:6px;">Order confirmed</div>
      </div>

      <div style="background:#ffffff;padding:24px;border:1px solid #e8e0d5;border-top:none;border-radius:0 0 10px 10px;">
        <p style="margin:0 0 6px;color:#2b1b17;font-size:15px;">
          Thank you, ${escapeHtml(o.customerName)}.
        </p>
        <p style="margin:0 0 20px;color:#7a6e60;font-size:14px;line-height:1.6;">
          We have your order and will email you again the moment it ships.
        </p>

        <div style="background:#faf7f2;border:1px solid #e8e0d5;border-radius:8px;padding:14px 16px;margin-bottom:22px;">
          <div style="font-size:12px;color:#7a6e60;text-transform:uppercase;letter-spacing:.06em;">Order number</div>
          <div style="font-size:18px;font-weight:bold;color:#6b1d2f;letter-spacing:.04em;">
            ${escapeHtml(o.orderNumber)}
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:14px;">
          <tr>
            <td style="padding:4px 0;color:#7a6e60;">Subtotal</td>
            <td style="padding:4px 0;text-align:right;color:#2b1b17;">${rupees(o.subtotal)}</td>
          </tr>
          ${
            o.discount > 0
              ? `<tr>
                   <td style="padding:4px 0;color:#7a6e60;">Discount${o.couponCode ? ` (${escapeHtml(o.couponCode)})` : ''}</td>
                   <td style="padding:4px 0;text-align:right;color:#2e7d32;">-${rupees(o.discount)}</td>
                 </tr>`
              : ''
          }
          <tr>
            <td style="padding:4px 0;color:#7a6e60;">Shipping</td>
            <td style="padding:4px 0;text-align:right;color:#2b1b17;">
              ${o.shipping === 0 ? 'FREE' : rupees(o.shipping)}
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;border-top:2px solid #e8e0d5;font-weight:bold;color:#2b1b17;">Total paid</td>
            <td style="padding:12px 0 0;border-top:2px solid #e8e0d5;text-align:right;font-weight:bold;color:#2b1b17;">
              ${rupees(o.grandTotal)}
            </td>
          </tr>
        </table>

        <div style="margin-top:22px;font-size:13px;color:#7a6e60;line-height:1.7;">
          <strong style="color:#2b1b17;">Payment</strong><br>${escapeHtml(o.paymentMethod)}
          ${addr ? `<br><br><strong style="color:#2b1b17;">Delivering to</strong><br>${addr}` : ''}
        </div>

        <p style="margin:24px 0 0;font-size:13px;color:#7a6e60;line-height:1.7;">
          Questions? Just reply to this email or write to
          <a href="mailto:${siteConfig.email}" style="color:#6b1d2f;">${siteConfig.email}</a>.
        </p>
      </div>

      <p style="text-align:center;font-size:11px;color:#9e9080;margin-top:18px;">
        ${escapeHtml(siteConfig.name)} · ${escapeHtml(siteConfig.address.join(' '))}
      </p>
    </div>
  </body>
</html>`;
}

export async function sendOrderConfirmation(order: OrderEmailInput): Promise<void> {
  if (!order.to) return;
  try {
    const { error } = await insforge.emails.send({
      to: order.to,
      subject: `Order ${order.orderNumber} confirmed — ${siteConfig.name}`,
      html: buildOrderHtml(order),
    });
    if (error) console.error('Order confirmation email failed:', error.message);
  } catch (err) {
    console.error('Order confirmation email threw:', err);
  }
}
