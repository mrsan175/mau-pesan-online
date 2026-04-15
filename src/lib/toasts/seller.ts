// Toast message constants for all seller-related pages
// Used in: seller/page, seller/profile/page, seller/products/page

export const SELLER_TOASTS = {
  // Profile
  profileSaved: "Profil toko berhasil disimpan!" as const,
  profileLoadFailed: "Gagal memuat profil penjual." as const,
  profileIncomplete: "Profil toko belum lengkap. Hubungi admin toko." as const,

  // WA
  waCopied: "Nomor WA disalin!" as const,

  // Products
  productAdded: "Produk berhasil ditambahkan!" as const,
  productUpdated: "Produk berhasil diperbarui!" as const,
  productDeleted: "Produk berhasil dihapus." as const,
  productDeleteFailed: "Gagal menghapus produk." as const,
  productLoadFailed: "Gagal memuat daftar produk." as const,
  productHidden: "Produk disembunyikan." as const,
  productShown: "Produk ditampilkan." as const,
  productSaveFailed: "Gagal menyimpan produk." as const,

  // Upload
  photoUploaded: "Foto berhasil diunggah!" as const,
  photoUploadFailed: (msg: string) => `Upload gagal: ${msg}`,

  // Account
  accountCopied: "No. rekening disalin!" as const,
} as const;
