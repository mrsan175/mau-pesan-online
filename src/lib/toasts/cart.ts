// Toast message constants for cart/order page

export const CART_TOASTS = {
  // Cart actions
  itemAdded: (name: string) => `${name} ditambahkan ke keranjang!`,

  // Seller data
  sellerDataIncomplete: "Data penjual belum lengkap. Hubungi admin toko." as const,
  formIncomplete: "Mohon lengkapi data pemesanan terlebih dahulu." as const,

  // Transfer proof
  noTransferProof: "Belum ada bukti transfer. Kamu bisa lanjut dan lampirkan langsung di chat WA." as const,
  fileNotImage: "Hanya file gambar yang diperbolehkan." as const,
  fileTooLarge: "Ukuran file maksimal 5 MB." as const,

  // WA
  openingWhatsapp: "Membuka WhatsApp penjual..." as const,
  whatsappDescDelivery: "Tunggu konfirmasi dari penjual ya!" as const,
  whatsappDescTransfer: "Jangan lupa lampirkan bukti transfer di chat WA!" as const,

  // Copy
  messageCopied: "Pesan berhasil disalin!" as const,
  accountCopied: "No. rekening disalin!" as const,
} as const;
