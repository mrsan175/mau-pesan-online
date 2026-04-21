import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, MessageCircle, ChevronRight, Flame, Coffee, UtensilsCrossed } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Pesan via WhatsApp",
    description: "Pesananmu langsung dikirim ke WhatsApp penjual. Konfirmasi dan komunikasi lebih mudah & personal.",
    bg: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: ShieldCheck,
    title: "Pembayaran Fleksibel",
    description: "Pilih COD (bayar di tempat) atau transfer bank. Aman, mudah, dan sesuai kebutuhanmu.",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Star,
    title: "Produk Berkualitas",
    description: "Semua produk dipilih langsung oleh penjual. Kualitas terjaga, dibuat dengan penuh perhatian.",
    bg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
  },
  {
    icon: Flame,
    title: "Mudah & Praktis",
    description: "Pilih produk, isi form, klik kirim — pesananmu langsung masuk ke penjual tanpa ribet.",
    bg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
];

const categories = [
  { icon: "🍜", name: "Makanan Berat", color: "from-orange-500 to-red-500" },
  { icon: "🥤", name: "Minuman Segar", color: "from-blue-500 to-cyan-500" },
  { icon: "🍡", name: "Snack & Jajanan", color: "from-purple-500 to-pink-500" },
  { icon: "🍰", name: "Dessert & Kue", color: "from-pink-500 to-rose-500" },
  { icon: "🥗", name: "Makanan Sehat", color: "from-green-500 to-emerald-500" },
  { icon: "☕", name: "Kopi & Teh", color: "from-amber-600 to-yellow-500" },
];

const menuHighlights = [
  {
    icon: Flame,
    label: "Paling Diminati",
    items: ["Nasi Goreng Spesial", "Ayam Geprek Krispy", "Kopi Susu Aren"],
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Coffee,
    label: "Menu Baru",
    items: ["Es Teh Lychee", "Dimsum Mix Premium", "Martabak Manis Special"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: UtensilsCrossed,
    label: "Pilihan Penjual",
    items: ["Pisang Coklat Crispy", "Pempek Palembang", "Mie Ayam Bakso"],
    color: "from-purple-500 to-pink-600",
  },
];

const howToOrder = [
  { step: "1", emoji: "🛍️", title: "Pilih Produk", desc: "Jelajahi produk dan masukkan ke keranjang." },
  { step: "2", emoji: "📋", title: "Isi Data Diri", desc: "Masukkan nama, nomor WA, dan alamat pengirimanmu." },
  { step: "3", emoji: "💳", title: "Pilih Pembayaran", desc: "COD atau transfer bank — sesuai pilihanmu." },
  { step: "4", emoji: "💬", title: "Kirim ke WhatsApp", desc: "Pesanan dikirim otomatis ke WhatsApp penjual untuk konfirmasi." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-linear-to-br from-orange-500/20 to-red-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-linear-to-tr from-amber-500/15 to-yellow-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                Pesan Produk{" "}
                <span className="relative inline-block">
                  <span className="bg-linear-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                    Favorit
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9C50 3 150 1 297 9"
                      stroke="url(#heroUnderline)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="heroUnderline" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>{" "}
                Langsung ke WhatsApp Penjual
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Pilih produk yang kamu mau, isi data diri, dan pesananmu langsung dikirim ke WhatsApp penjual. Mudah, cepat, tanpa aplikasi tambahan.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/store"
                  id="hero-order-btn"
                  className="group flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-600 text-white px-7 py-3.5 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-100 text-base"
                >
                  Lihat Produk
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#cara-pesan"
                  className="flex items-center gap-2 border border-border bg-card text-foreground px-7 py-3.5 rounded-xl font-bold hover:bg-muted/60 hover:border-orange-300/50 transition-all text-base"
                >
                  Cara Pesan
                </Link>
              </div>
            </div>

            {/* Right: Phone mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="relative rounded-[2.5rem] border-4 border-foreground/10 bg-card shadow-2xl overflow-hidden">
                  {/* App header */}
                  <div className="bg-linear-to-r from-orange-500 to-red-600 px-5 pt-8 pb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white/80 text-xs">Halo, Selamat datang 👋</p>
                        <p className="text-white font-bold text-base">Mau pesan apa hari ini?</p>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                        😊
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5">
                      <span className="text-white/70 text-sm">🔍</span>
                      <span className="text-white/70 text-sm">Cari produk...</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 bg-background">
                    <div className="flex gap-2 mb-4 overflow-hidden">
                      {["Semua", "Makanan", "Minuman", "Snack"].map((cat, i) => (
                        <span
                          key={cat}
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="rounded-xl overflow-hidden border border-border mb-3">
                      <div className="h-24 bg-linear-to-r from-orange-400 to-amber-400 relative flex items-end p-3">
                        <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">🍜</div>
                        <div className="relative z-10">
                          <span className="bg-white/90 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            Pilihan Penjual
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm">Nasi Goreng Spesial</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-orange-600 font-bold text-sm">Rp 35.000</span>
                          <span className="h-6 w-6 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs">+</span>
                        </div>
                      </div>
                    </div>

                    {["Ayam Geprek Krispy", "Kopi Susu Aren"].map((name, i) => (
                      <div key={name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg ${i === 0 ? "bg-red-100" : "bg-amber-100"}`}>
                          {i === 0 ? "🍗" : "☕"}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium">{name}</p>
                          <p className="text-xs text-orange-600 font-bold">{i === 0 ? "Rp 32.000" : "Rp 20.000"}</p>
                        </div>
                        <span className="text-orange-500 text-xs">+</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badge — WA confirmation */}
                <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold">Pesanan masuk!</p>
                    <p className="text-[10px] text-muted-foreground">Ke WA penjual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Pesan */}
      <section id="cara-pesan" className="py-16 px-4 sm:px-6 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">Cara Pesan</p>
            <h2 className="text-3xl font-extrabold">Semudah 4 Langkah</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howToOrder.map(({ step, emoji, title, desc }) => (
              <div key={step} className="relative rounded-2xl border border-border bg-card p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-7 w-7 rounded-full bg-linear-to-br from-orange-500 to-red-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md shrink-0">
                    {step}
                  </span>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">Kategori</p>
            <h2 className="text-3xl font-extrabold">Temukan Seleramu</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="/store"
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-orange-300/60 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className={`h-14 w-14 rounded-2xl bg-linear-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <p className="font-semibold text-sm text-foreground">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Menu highlights */}
      <section className="py-16 px-4 sm:px-6 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">Produk</p>
            <h2 className="text-3xl font-extrabold">Pilihan Tersedia</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {menuHighlights.map(({ icon: Icon, label, items, color }) => (
              <div key={label} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <div className={`bg-linear-to-r ${color} p-5`}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <Icon className="h-5 w-5 text-white" />
                    <h3 className="font-bold text-white text-base">{label}</h3>
                  </div>
                </div>
                <ul className="p-4 flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </li>
                  ))}
                </ul>
                <div className="px-4 pb-4">
                  <Link
                    href="/store"
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg bg-linear-to-r ${color} text-white text-sm font-semibold hover:opacity-90 transition-opacity`}
                  >
                    Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">Keunggulan</p>
            <h2 className="text-3xl font-extrabold">Kenapa Pilih Kami?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, bg, iconColor }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-orange-300/50 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-orange-500 via-red-500 to-pink-600 p-10 sm:p-16 text-center shadow-2xl shadow-orange-500/30">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 text-6xl">🛍️</div>
              <div className="absolute top-4 right-4 text-6xl">🍗</div>
              <div className="absolute bottom-4 left-4 text-6xl">☕</div>
              <div className="absolute bottom-4 right-4 text-6xl">🍰</div>
            </div>
            <div className="relative z-10">
              <p className="text-white/80 font-semibold uppercase tracking-widest text-sm mb-3">Mulai Sekarang</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Tertarik? Langsung Pesan! 🛒
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Pilih produk favoritmu dan kirim pesanan langsung ke WhatsApp penjual. Prosesnya cepat dan mudah!
              </p>
              <Link
                href="/store"
                id="cta-order-btn"
                className="group inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-extrabold hover:bg-orange-50 transition-all shadow-xl hover:scale-105 active:scale-100 text-base"
              >
                Lihat Produk Sekarang
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-base">🛍</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm text-foreground">Mau Pesan</span>
              <span className="font-bold text-sm bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Online</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Platform pesan produk UMKM online. Mudah, langsung ke WhatsApp penjual.
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mau Pesan Online
          </p>
        </div>
      </footer>
    </main>
  );
}
