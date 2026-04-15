import { CartItem } from "@/store/cart";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SellerInfo {
  storeName: string | null;
  sellerWhatsapp: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountOwner: string | null;
}

export interface OrderData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryMethod: "delivery" | "pickup";
  paymentMethod: "cod" | "transfer";
  note: string;
  items: CartItem[];
  total: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Returns true if all required seller fields are present.
 */
export function isSellerInfoComplete(seller: SellerInfo | null): boolean {
  return !!(
    seller?.sellerWhatsapp &&
    seller?.storeName
  );
}

// ─── Message builder ─────────────────────────────────────────────────────────

/**
 * Build a WhatsApp message string for a new order.
 * Seller info comes from the database (role = seller).
 */
export function buildWhatsAppMessage(order: OrderData, seller: SellerInfo): string {
  const storeName = seller.storeName ?? "Toko";

  const now = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemLines = order.items
    .map(
      (item) =>
        `  • ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`
    )
    .join("\n");

  const paymentLabel =
    order.paymentMethod === "cod" ? "COD (Bayar di Tempat)" : "Transfer Bank";

  const transferInfo =
    order.paymentMethod === "transfer" && seller.bankName
      ? `\n*Info Transfer:*\nBank      : ${seller.bankName}\nNo. Rek  : ${seller.bankAccountNumber ?? "-"}\nA/N        : ${seller.bankAccountOwner ?? "-"}\n_(Bukti transfer akan dilampirkan)_`
      : "";

  const deliveryLabel =
    order.deliveryMethod === "delivery" ? "Diantar (Delivery)" : "Ambil Sendiri (Pickup)";

  const noteSection = order.note
    ? `\n\n*Catatan:*\n${order.note}`
    : "";

  return `*PESANAN BARU — ${storeName}*
━━━━━━━━━━━━━━━━━━━━
${now}

*Data Pemesan:*
Nama       : ${order.customerName}
WhatsApp  : ${order.customerPhone}
Alamat     : ${order.customerAddress}
Pengiriman : ${deliveryLabel}

*Detail Pesanan:*
${itemLines}

──────────────────────
Total  : *${formatPrice(order.total)}*
Bayar  : ${paymentLabel}${transferInfo}${noteSection}

━━━━━━━━━━━━━━━━━━━━
_Pesan dikirim via MauPesan.Online_`;
}

/**
 * Normalizes a WhatsApp number to E.164 format without + prefix.
 * Handles: 08xxx, +628xxx, 628xxx, 8xxx
 * Output: 628xxx (ready for wa.me/...)
 */
export function normalizeWhatsAppNumber(raw: string): string {
  // Strip everything except digits
  let digits = raw.replace(/\D/g, "");

  // Handle leading 0  → replace with 62    (08xx → 628xx)
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  }

  // If it doesn't start with 62, prepend it
  if (!digits.startsWith("62")) {
    digits = "62" + digits;
  }

  return digits;
}

/**
 * Builds a wa.me URL with the seller's WhatsApp number and the pre-filled message.
 */
export function buildWhatsAppUrl(message: string, seller: SellerInfo): string {
  const phone = normalizeWhatsAppNumber(seller.sellerWhatsapp ?? "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
