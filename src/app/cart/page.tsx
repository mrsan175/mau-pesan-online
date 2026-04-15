"use client";

import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  isSellerInfoComplete,
  type SellerInfo,
} from "@/lib/whatsapp";
import type { OrderData } from "@/lib/whatsapp";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingCart,
  Bike,
  ShieldCheck,
  ChevronRight,
  Package,
  User,
  Phone,
  MapPin,
  MessageCircle,
  Copy,
  CheckCheck,
  Upload,
  X,
  Building2,
  AlertCircle,
  CreditCard,
  Banknote,
  Loader2,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Section, FormField } from "@/components/cart/FormPrimitives";
import { WhatsAppIcon } from "@/components/cart/WhatsAppIcon";
import { CART_TOASTS } from "@/lib/toasts/cart";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";



type DeliveryMethod = "delivery" | "pickup";
type PaymentMethod = "cod" | "transfer";

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [sellerError, setSellerError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [note, setNote] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);
  const [transferProofPreview, setTransferProofPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [waMessage, setWaMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"cart" | "preview">("cart");

  const subtotal = getTotalPrice();
  const total = subtotal;

  useEffect(() => {
    const fetchSeller = async () => {
      if (items.length === 0) return;
      try {
        setSellerLoading(true);
        const res = await fetch(`/api/seller?storeId=${items[0].storeId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSellerError(data.error ?? "Gagal memuat data penjual.");
          return;
        }
        const data: SellerInfo = await res.json();
        setSeller(data);
      } catch {
        setSellerError("Tidak dapat terhubung ke server.");
      } finally {
        setSellerLoading(false);
      }
    };
    fetchSeller();
  }, [items]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!customerName.trim()) errs.customerName = "Nama wajib diisi";
    if (!customerPhone.trim()) errs.customerPhone = "Nomor WhatsApp wajib diisi";
    else if (!/^[0-9+\-\s]{9,15}$/.test(customerPhone.trim()))
      errs.customerPhone = "Format nomor tidak valid";
    if (deliveryMethod === "delivery" && !customerAddress.trim())
      errs.customerAddress = "Alamat wajib diisi untuk pengiriman";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(CART_TOASTS.fileNotImage);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(CART_TOASTS.fileTooLarge);
      return;
    }
    setTransferProofFile(file);
    setTransferProofPreview(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleGenerateOrder = () => {
    if (items.length === 0) return;
    if (!seller || !isSellerInfoComplete(seller)) {
      toast.error(CART_TOASTS.sellerDataIncomplete);
      return;
    }
    if (!validate()) {
      toast.error(CART_TOASTS.formIncomplete);
      return;
    }
    if (paymentMethod === "transfer" && !transferProofFile) {
      toast.warning(
        CART_TOASTS.noTransferProof,
        { duration: 4000 }
      );
    }

    const order: OrderData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress:
        deliveryMethod === "pickup" ? "Ambil Sendiri (Pickup)" : customerAddress.trim(),
      deliveryMethod,
      paymentMethod,
      note: note.trim(),
      items,
      total,
    };

    const msg = buildWhatsAppMessage(order, seller);
    setWaMessage(msg);
    setStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenWhatsApp = () => {
    if (!waMessage || !seller) return;
    const url = buildWhatsAppUrl(waMessage, seller);
    window.open(url, "_blank");
    toast.success(CART_TOASTS.openingWhatsapp, {
      description:
        paymentMethod === "transfer"
          ? CART_TOASTS.whatsappDescTransfer
          : CART_TOASTS.whatsappDescDelivery,
      duration: 5000,
    });
  };

  const handleCopyMessage = async () => {
    if (!waMessage) return;
    await navigator.clipboard.writeText(waMessage);
    setCopied(true);
    toast.success(CART_TOASTS.messageCopied);
    setTimeout(() => setCopied(false), 2000);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Keranjangmu Kosong</h1>
          <p className="text-muted-foreground mb-8">
            Belum ada produk di keranjangmu. Yuk, mulai pilih produk favoritmu!
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-600 text-white px-8 py-3.5 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-100"
          >
            <ShoppingCart className="h-5 w-5" />
            Lihat Produk
          </Link>
        </div>
      </main>
    );
  }

  if (step === "preview" && waMessage && seller) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStep("cart")}
              className="h-10 w-10 text-muted-foreground hover:bg-muted/60 transition-all rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-extrabold">Preview Pesanan 📋</h1>
              <p className="text-xs text-muted-foreground">Pastikan pesananmu sudah benar</p>
            </div>
          </div>

          {/* WhatsApp message preview */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
            <div className="flex items-center justify-between px-5 py-3 bg-[#075E54] text-white">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-bold text-sm">Preview Pesan WhatsApp</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMessage}
                className="flex items-center gap-1.5 h-8 bg-white/20 hover:bg-white/30 text-white hover:text-white px-3 py-1.5 transition-colors"
              >
                {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Tersalin!" : "Salin"}
              </Button>
            </div>
            <div className="p-5 bg-[#ECE5DD] dark:bg-[#1a1a2e]">
              <div className="bg-white dark:bg-[#202C33] rounded-xl p-4 shadow-sm max-w-sm">
                <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                  {waMessage}
                </pre>
                <p className="text-[10px] text-muted-foreground mt-2 text-right">
                  {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>

          {/* Transfer proof */}
          {paymentMethod === "transfer" && (
            <div
              className={`rounded-2xl border p-4 mb-4 ${transferProofFile
                ? "border-green-400 bg-green-500/5"
                : "border-orange-400 bg-orange-500/5"
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle
                  className={`h-4 w-4 ${transferProofFile ? "text-green-600" : "text-orange-500"}`}
                />
                <span
                  className={`font-semibold text-sm ${transferProofFile ? "text-green-700 dark:text-green-400" : "text-orange-600"
                    }`}
                >
                  {transferProofFile
                    ? "Bukti transfer siap dilampirkan"
                    : "Bukti transfer belum diunggah"}
                </span>
              </div>
              {transferProofPreview ? (
                <div className="mt-2">
                  <img
                    src={transferProofPreview}
                    alt="Bukti transfer"
                    className="max-h-40 rounded-lg border border-border object-contain"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Lampirkan gambar ini secara manual ke chat WhatsApp penjual.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Kamu bisa tetap melanjutkan dan lampirkan bukti transfer langsung di chat
                  WhatsApp.
                </p>
              )}
            </div>
          )}

          {/* Seller info card */}
          <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-md shrink-0">
              💬
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{seller.storeName ?? "Toko"}</p>
              <p className="text-xs text-muted-foreground">
                +{seller.sellerWhatsapp ?? ""}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pesanan akan diterima penjual via WhatsApp
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              id="open-whatsapp-btn"
              onClick={handleOpenWhatsApp}
              className="flex items-center justify-center gap-2.5 w-full h-14 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-xl font-extrabold text-base transition-all shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-100"
            >
              <WhatsAppIcon />
              Kirim ke WhatsApp Penjual
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep("cart")}
              className="flex items-center justify-center gap-2 w-full h-12 text-muted-foreground hover:bg-muted/60 transition-all rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali & Edit Pesanan
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-20 pb-32 lg:pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/store"
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-orange-300/50 hover:bg-muted/60 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Keranjang & Pemesanan 🛒</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Isi data di bawah, lalu kirim ke WhatsApp penjual
            </p>
          </div>
        </div>

        {/* Seller loading / error banner */}
        {sellerLoading && (
          <Alert className="mb-6 border-border bg-muted/50">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <AlertTitle className="text-muted-foreground">Memuat...</AlertTitle>
            <AlertDescription className="text-muted-foreground">Memuat data penjual...</AlertDescription>
          </Alert>
        )}
        {!sellerLoading && sellerError && (
          <Alert variant="destructive" className="mb-6">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Data penjual tidak tersedia</AlertTitle>
            <AlertDescription>{sellerError}</AlertDescription>
          </Alert>
        )}
        {!sellerLoading && seller && !isSellerInfoComplete(seller) && (
          <Alert className="mb-6 border-orange-400/40 bg-orange-500/5 text-orange-600">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle>Profil penjual belum lengkap</AlertTitle>
            <AlertDescription className="text-orange-600/80">
              Nomor WhatsApp penjual belum diisi. Admin perlu melengkapi profil seller.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-6">

            {/* 1. Cart items */}
            <Section
              title="Item Pesanan"
              icon={<ShoppingCart className="h-4 w-4 text-orange-500" />}
            >
              <Card className="rounded-2xl shadow-none overflow-hidden border-border bg-card">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                  <p className="text-sm text-muted-foreground">
                    {items.length} item dalam keranjang
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-8 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus Semua
                  </Button>
                </div>
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-4 p-4 sm:p-5 group hover:bg-muted/30 transition-colors"
                    >
                      <div className="h-20 w-20 rounded-xl overflow-hidden border border-border shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-base font-extrabold text-orange-600">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:border-orange-400 hover:text-orange-600 hover:bg-orange-500/10 transition-all"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:border-orange-400 hover:text-orange-600 hover:bg-orange-500/10 transition-all"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-5 py-3.5 border-t border-border">
                  <Link
                    href="/store"
                    className="flex items-center gap-2 text-sm text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah produk lain
                  </Link>
                </div>
              </Card>
            </Section>

            {/* 2. Data Pemesan */}
            <Section
              title="Data Pemesan"
              icon={<User className="h-4 w-4 text-orange-500" />}
            >
              <Card className="rounded-2xl shadow-none border-border bg-card">
                <CardContent className="p-5 flex flex-col gap-4">
                <FormField
                  id="customer-name"
                  label="Nama Lengkap"
                  required
                  icon={<User className="h-4 w-4" />}
                  error={errors.customerName}
                >
                  <Input
                    id="customer-name"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setErrors((p) => ({ ...p, customerName: undefined }));
                    }}
                    className={errors.customerName ? "border-destructive" : ""}
                  />
                </FormField>

                <FormField
                  id="customer-phone"
                  label="Nomor WhatsApp"
                  required
                  icon={<Phone className="h-4 w-4" />}
                  error={errors.customerPhone}
                >
                  <Input
                    id="customer-phone"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      setErrors((p) => ({ ...p, customerPhone: undefined }));
                    }}
                    className={errors.customerPhone ? "border-destructive" : ""}
                  />
                </FormField>

                {/* Delivery method */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Metode Pengiriman <span className="text-destructive">*</span>
                  </p>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(val) => setDeliveryMethod(val as DeliveryMethod)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {(
                      [
                        { id: "delivery", label: "Diantar (Delivery)", icon: Bike },
                        { id: "pickup", label: "Ambil Sendiri (Pickup)", icon: Building2 },
                      ] as const
                    ).map(({ id, label, icon: Icon }) => (
                      <div key={id}>
                        <RadioGroupItem value={id} id={`delivery-${id}`} className="peer sr-only" />
                        <Label
                          htmlFor={`delivery-${id}`}
                          className="flex items-center gap-2.5 p-3.5 rounded-xl border cursor-pointer transition-all border-border peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 peer-data-[state=checked]:text-orange-600 hover:border-orange-300/50 text-foreground"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-semibold">{label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Address — only for delivery */}
                {deliveryMethod === "delivery" && (
                  <FormField
                    id="customer-address"
                    label="Alamat Lengkap"
                    required
                    icon={<MapPin className="h-4 w-4" />}
                    error={errors.customerAddress}
                  >
                    <Textarea
                      id="customer-address"
                      placeholder="Masukkan alamat lengkap termasuk RT/RW, Kelurahan, Kecamatan..."
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        setErrors((p) => ({ ...p, customerAddress: undefined }));
                      }}
                      rows={3}
                      className={`resize-none ${errors.customerAddress ? "border-destructive" : ""}`}
                    />
                  </FormField>
                )}

                <FormField
                  id="order-note"
                  label="Catatan (opsional)"
                  icon={<Package className="h-4 w-4" />}
                >
                  <Textarea
                    id="order-note"
                    placeholder="Contoh: tidak pakai pedas, pembungkus terpisah, dll..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </FormField>
                </CardContent>
              </Card>
            </Section>

            {/* 3. Pembayaran */}
            <Section
              title="Metode Pembayaran"
              icon={<CreditCard className="h-4 w-4 text-orange-500" />}
            >
              <Card className="rounded-2xl shadow-none border-border bg-card">
                <CardContent className="p-5 flex flex-col gap-5">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                  className="grid grid-cols-2 gap-3"
                >
                  {(
                    [
                      {
                        id: "cod",
                        label: "COD (Bayar di Tempat)",
                        icon: Banknote,
                        desc: "Bayar langsung ke kurir/penjual saat barang tiba",
                      },
                      {
                        id: "transfer",
                        label: "Transfer Bank",
                        icon: Building2,
                        desc: "Transfer ke rekening penjual, lampirkan bukti",
                      },
                    ] as const
                  ).map(({ id, label, icon: Icon, desc }) => (
                    <div key={id}>
                      <RadioGroupItem value={id} id={`payment-${id}`} className="peer sr-only" />
                      <Label
                        htmlFor={`payment-${id}`}
                        className="flex flex-col gap-1.5 p-4 rounded-xl border cursor-pointer transition-all border-border peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 hover:border-orange-300/50"
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground peer-data-[state=checked]:text-orange-600">
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-normal">{desc}</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Transfer info (from seller DB) + upload */}
                {paymentMethod === "transfer" && (
                  <div className="flex flex-col gap-4">
                    {/* Rekening info */}
                    {sellerLoading ? (
                      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Memuat info rekening penjual...
                        </span>
                      </div>
                    ) : seller?.bankName ? (
                      <div className="rounded-xl border border-orange-300/40 bg-linear-to-br from-orange-500/5 to-amber-500/5 p-4">
                        <p className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-1.5">
                          <Building2 className="h-4 w-4" />
                          Info Rekening Penjual
                        </p>
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bank</span>
                            <span className="font-bold">{seller.bankName}</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-muted-foreground">No. Rekening</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold font-mono">
                                {seller.bankAccountNumber ?? "-"}
                              </span>
                              {seller.bankAccountNumber && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      seller.bankAccountNumber ?? ""
                                    );
                                    toast.success(CART_TOASTS.accountCopied);
                                  }}
                                  className="h-6 w-6 text-muted-foreground hover:text-orange-600 transition-colors"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Atas Nama</span>
                            <span className="font-bold">{seller.bankAccountOwner ?? "-"}</span>
                          </div>
                          <div className="mt-1 pt-2 border-t border-orange-200/50 flex justify-between">
                            <span className="text-muted-foreground">Jumlah Transfer</span>
                            <span className="font-extrabold text-orange-600">
                              {formatPrice(total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-orange-300/40 bg-orange-500/5 p-4">
                        <p className="text-sm text-orange-600 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" />
                          Info rekening belum tersedia — tanyakan ke penjual via WA.
                        </p>
                      </div>
                    )}

                    {/* Upload bukti */}
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Upload className="h-4 w-4 text-orange-500" />
                        Upload Bukti Transfer
                        <span className="text-xs font-normal text-muted-foreground">
                          (opsional — bisa dilampirkan di WA)
                        </span>
                      </p>

                      {transferProofPreview ? (
                        <div className="relative rounded-xl border border-green-400 bg-green-500/5 p-3">
                          <img
                            src={transferProofPreview}
                            alt="Bukti transfer"
                            className="max-h-48 w-full object-contain rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            type="button"
                            onClick={() => {
                              setTransferProofFile(null);
                              setTransferProofPreview(null);
                            }}
                            className="absolute top-4 right-4 h-7 w-7 rounded-full text-white shadow-md transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-2 font-semibold text-center">
                            ✓ Bukti transfer berhasil diunggah
                          </p>
                        </div>
                      ) : (
                        <div
                          id="transfer-proof-dropzone"
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDragging
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-border hover:border-orange-400 hover:bg-orange-500/5"
                            }`}
                        >
                          <Upload
                            className={`h-8 w-8 ${isDragging ? "text-orange-500" : "text-muted-foreground"}`}
                          />
                          <p className="text-sm font-semibold text-foreground">
                            Drag & drop atau klik untuk unggah
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, JPEG — maks. 5 MB
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
            </Section>
          </div>

          {/* ── RIGHT COLUMN: Summary ── */}
          <div className="sticky top-24 flex flex-col gap-4">
            <Card className="rounded-2xl shadow-none border-border bg-card">
              <CardContent className="p-5">
              <h2 className="font-extrabold text-foreground text-lg mb-4">Ringkasan Pesanan</h2>
              <div className="flex flex-col gap-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.name} <span className="text-xs">×{item.quantity}</span>
                    </span>
                    <span className="font-medium shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Bike className="h-3.5 w-3.5" /> Ongkir
                  </span>
                  <span className="text-xs text-muted-foreground italic">Diinfokan penjual</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pembayaran</span>
                  <span className="font-semibold">
                    {paymentMethod === "cod" ? "COD" : "Transfer Bank"}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between mt-1 mb-5">
                  <span className="font-extrabold text-foreground text-base">Total Produk</span>
                  <span className="font-extrabold text-orange-600 text-xl">
                    {formatPrice(total)}
                  </span>
                </div>
                
                {/* Desktop CTA directly inside the Card to ensure visibility without scrolling */}
                <Button
                  id="generate-order-btn-desktop"
                  onClick={handleGenerateOrder}
                  disabled={sellerLoading || !seller || !isSellerInfoComplete(seller)}
                  className="hidden lg:flex w-full gap-2.5 py-6 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-100 transition-all text-base font-extrabold"
                >
                  {sellerLoading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" />Memuat...</>
                  ) : (
                    <><WhatsAppIcon />Lanjut ke WhatsApp<ChevronRight className="h-5 w-5" /></>
                  )}
                </Button>
              </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <div className="rounded-2xl border border-border bg-linear-to-br from-orange-500/5 to-red-500/5 p-4">
              <p className="text-sm font-bold text-foreground mb-3">Cara Pesan 📋</p>
              {[
                { s: "1", text: "Isi data pemesan & pilih pembayaran" },
                { s: "2", text: 'Klik "Lanjut ke WhatsApp"' },
                { s: "3", text: "Pesan otomatis terkirim ke penjual" },
                { s: "4", text: "Tunggu konfirmasi dari penjual" },
              ].map(({ s, text }) => (
                <div key={s} className="flex items-start gap-2.5 mb-2 last:mb-0">
                  <span className="h-5 w-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {s}
                  </span>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>

            {/* Action CTA is now placed inside the Card for desktop, this text is just for assurance */}
            <p className="hidden lg:flex text-center text-xs text-muted-foreground items-center justify-center gap-1 mt-2">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              Pesanan langsung ke WhatsApp penjual
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-[0_-10px_20px_rgba(0,0,0,0.05)] lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Total Bayar</p>
            <p className="text-lg font-extrabold text-orange-600">{formatPrice(total)}</p>
          </div>
          <Button
            id="generate-order-btn-mobile"
            onClick={handleGenerateOrder}
            disabled={sellerLoading || !seller || !isSellerInfoComplete(seller)}
            className="flex-1 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30 font-extrabold gap-2 py-6 rounded-xl"
          >
            {sellerLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <><WhatsAppIcon /> WhatsApp <ChevronRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}

