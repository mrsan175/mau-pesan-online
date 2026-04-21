"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  Store, Package, Settings, ExternalLink, ArrowLeft,
  Loader2, Plus, PenSquare, Trash2, Building2, Smartphone, X, ShoppingBag, Eye, CheckCircle, Clock,
  AlertCircle, ArrowUpRight, ArrowDownRight, BarChart3, Activity,
} from "lucide-react";
import { UploadButton } from "@/lib/uploadthing-client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

type StoreData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountOwner: string | null;
  isActive: boolean;
};

type ProductData = {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string | null;
  badge: unknown;
  isActive: boolean;
};

const storeSchema = z.object({
  name: z.string().min(3, "Nama toko minimal 3 karakter"),
  description: z.string().optional().nullable(),
  whatsapp: z.string().min(9, "Nomor WhatsApp tidak valid"),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountOwner: z.string().optional().nullable(),
  isActive: z.boolean(),
});

const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  description: z.string(),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  category: z.string().min(1, "Kategori wajib diisi"),
  imageUrl: z.string().url("Harus berupa URL gambar yang valid").or(z.literal("")),
  isActive: z.boolean(),
});

type StoreFormValues = z.infer<typeof storeSchema>;
type ProductFormValues = z.infer<typeof productSchema>;

const PRODUCT_CATEGORIES = ["Makanan", "Minuman", "Camilan", "Dessert", "Paket Hemat", "Lainnya"];

// ─── Mock Data for Charts ────────────────────────────────────────────────────
const generateSalesData = () => {
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  return days.map((day) => ({
    day,
    pesanan: Math.floor(Math.random() * 15) + 2,
    produk: Math.floor(Math.random() * 25) + 5,
  }));
};

const generateMonthlyData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  return months.slice(0, new Date().getMonth() + 1).map((month) => ({
    month,
    views: Math.floor(Math.random() * 300) + 50,
    orders: Math.floor(Math.random() * 50) + 5,
  }));
};

const CATEGORY_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];

// ─── Komponen StatCard ───────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "orange",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "orange" | "blue" | "green" | "purple";
}) {
  const colorMap = {
    orange: { bg: "bg-orange-100", icon: "text-orange-600", ring: "ring-orange-200" },
    blue: { bg: "bg-blue-100", icon: "text-blue-600", ring: "ring-blue-200" },
    green: { bg: "bg-green-100", icon: "text-green-600", ring: "ring-green-200" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600", ring: "ring-purple-200" },
  };
  const c = colorMap[color];

  return (
    <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`h-11 w-11 rounded-2xl ${c.bg} flex items-center justify-center ring-4 ${c.ring}`}>
            <Icon className={`h-5 w-5 ${c.icon}`} />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-1 ${trend === "up" ? "bg-green-100 text-green-700" :
              trend === "down" ? "bg-red-100 text-red-700" :
                "bg-muted text-muted-foreground"
              }`}>
              {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <p className="text-3xl font-extrabold text-foreground mb-1">{value}</p>
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function StoreDashboardClient({ initialStore }: { initialStore: StoreData }) {
  const [store, setStore] = useState<StoreData>(initialStore);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);
  const [isProductActionLoading, setIsProductActionLoading] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [salesData] = useState(generateSalesData());
  const [monthlyData] = useState(generateMonthlyData());

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const storeForm = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema) as any,
    defaultValues: { name: store.name, description: store.description || "", whatsapp: store.whatsapp, bankName: store.bankName || "", bankAccountNumber: store.bankAccountNumber || "", bankAccountOwner: store.bankAccountOwner || "", isActive: store.isActive },
  });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { name: "", description: "", price: 0, category: "Makanan", imageUrl: "", isActive: true },
  });

  useEffect(() => { fetchData(); }, [store.id]);

  const fetchData = async () => {
    try {
      setLoadingProducts(true);
      const [resProducts, resStats] = await Promise.all([
        fetch(`/api/seller/products?storeId=${store.id}`).then((r) => r.json()),
        fetch(`/api/seller/stats?storeId=${store.id}`).then((r) => r.json()),
      ]);
      setProducts(resProducts);
      if (!resStats.error) setStats(resStats);
    } catch {
      toast.error("Gagal memuat data produk");
    } finally {
      setLoadingProducts(false);
    }
  };

  const onUpdateStore = async (values: StoreFormValues) => {
    try {
      setIsUpdatingStore(true);
      const res = await fetch(`/api/seller/stores/${store.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!res.ok) throw new Error();
      setStore({ ...store, ...values, description: values.description || null, bankName: values.bankName || null, bankAccountNumber: values.bankAccountNumber || null, bankAccountOwner: values.bankAccountOwner || null });
      toast.success("Profil toko berhasil diperbarui!");
    } catch {
      toast.error("Gagal mengupdate toko");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const onProductSubmit = async (values: ProductFormValues) => {
    try {
      setIsProductActionLoading(true);
      const isEditing = !!editingProduct;
      const url = isEditing ? `/api/seller/products/${editingProduct.id}` : `/api/seller/products`;
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing ? values : { ...values, storeId: store.id };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Produk diperbarui!" : "Produk berhasil ditambahkan!");
      setIsProductDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan produk.");
    } finally {
      setIsProductActionLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Produk dihapus");
      setProducts(products.filter((p) => p.id !== id));
      setStats({ ...stats, total: stats.total - 1 });
    } catch {
      toast.error("Gagal menghapus produk");
    }
  };

  const openProductDialog = (p?: ProductData) => {
    if (p) {
      setEditingProduct(p);
      productForm.reset({ name: p.name, description: p.description, price: Number(p.price), category: p.category, imageUrl: p.imageUrl || "", isActive: p.isActive });
    } else {
      setEditingProduct(null);
      productForm.reset({ name: "", description: "", price: 0, category: "Makanan", imageUrl: "", isActive: true });
    }
    setIsProductDialogOpen(true);
  };

  const setTab = (tab: string) => {
    const url = tab === "overview"
      ? `/dashboard/seller/${store.id}`
      : `/dashboard/seller/${store.id}?tab=${tab}`;
    router.push(url);
  };

  // Category breakdown for pie chart
  const categoryBreakdown = PRODUCT_CATEGORIES.map((cat) => ({
    name: cat,
    value: products.filter((p) => p.category === cat).length,
  })).filter((c) => c.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Store Header Banner ── */}
      <div className="rounded-2xl bg-linear-to-br from-orange-500 via-red-500 to-pink-600 p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-12" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/seller">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="h-14 w-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Store className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">{store.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full ${store.isActive ? "bg-green-300 shadow-[0_0_6px_rgba(134,239,172,0.8)]" : "bg-red-300"}`} />
                <p className="text-white/80 text-sm">maupesan.online/shop/{store.slug}</p>
              </div>
            </div>
          </div>
          <Button asChild className="rounded-xl gap-2 font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-lg">
            <Link href={`/shop/${store.slug}`} target="_blank">
              Lihat Toko <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex flex-wrap gap-2 bg-card border border-border rounded-2xl p-1.5 w-fit shadow-sm">
        {[
          { key: "overview", label: "Ringkasan", icon: BarChart3 },
          { key: "products", label: "Etalase Produk", icon: Package },
          { key: "orders", label: "Laporan", icon: ShoppingBag },
          { key: "settings", label: "Pengaturan", icon: Settings },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === key
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: OVERVIEW */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Produk" value={stats.total} icon={Package} color="blue" trend="up" trendValue="+2 baru" subtitle="Semua produk" />
            <StatCard title="Produk Aktif" value={stats.active} icon={CheckCircle} color="green" subtitle="Tampil di toko" />
            <StatCard title="Produk Nonaktif" value={stats.inactive} icon={AlertCircle} color="orange" subtitle="Tidak tampil" />
            <StatCard title="Status Toko" value={store.isActive ? "Buka" : "Tutup"} icon={Activity} color={store.isActive ? "green" : "orange"} subtitle={store.isActive ? "Menerima pesanan" : "Tidak menerima"} />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Area Chart - Weekly Activity */}
            <Card className="lg:col-span-2 border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">Aktivitas Minggu Ini</CardTitle>
                    <CardDescription className="text-xs">Estimasi tampilan & pesanan 7 hari terakhir</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs text-muted-foreground">Demo Data</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPesanan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProduk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                      labelStyle={{ fontWeight: "700" }}
                    />
                    <Area type="monotone" dataKey="produk" name="Tampilan" stroke="#3b82f6" strokeWidth={2} fill="url(#colorProduk)" dot={{ fill: "#3b82f6", r: 3 }} />
                    <Area type="monotone" dataKey="pesanan" name="Pesanan" stroke="#f97316" strokeWidth={2} fill="url(#colorPesanan)" dot={{ fill: "#f97316", r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Category Breakdown */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Kategori Produk</CardTitle>
                <CardDescription className="text-xs">Distribusi per kategori</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Package className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Belum ada produk</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart - Monthly */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Performa Bulanan</CardTitle>
                  <CardDescription className="text-xs">Estimasi tampilan toko per bulan {new Date().getFullYear()}</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">Demo Data</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Bar dataKey="views" name="Tampilan" fill="#f97316" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="orders" name="Pesanan" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Info Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Store Info */}
            <Card className="border border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Store className="h-4 w-4 text-orange-500" /> Informasi Toko
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Nama Toko</span>
                  <span className="text-sm font-semibold">{store.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={store.isActive ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" : "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"}>
                    {store.isActive ? "Buka" : "Tutup"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">WhatsApp</span>
                  <span className="text-sm font-mono font-semibold">+62{store.whatsapp}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">URL Toko</span>
                  <Link href={`/shop/${store.slug}`} target="_blank" className="text-sm text-orange-500 font-semibold hover:underline flex items-center gap-1">
                    /{store.slug} <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" /> Info Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {store.bankName ? (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Bank / E-Wallet</span>
                      <span className="text-sm font-semibold">{store.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Atas Nama</span>
                      <span className="text-sm font-semibold">{store.bankAccountOwner || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">No. Rekening</span>
                      <span className="text-sm font-mono font-bold tracking-wider">{store.bankAccountNumber || "-"}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
                    <Building2 className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Belum ada info rekening</p>
                    <button onClick={() => setTab("settings")} className="text-xs text-orange-500 font-semibold hover:underline">
                      + Tambah sekarang
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: PRODUCTS */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "products" && (
        <div className="bg-card rounded-2xl shadow-sm border border-border/60 p-6 min-h-[400px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold">Etalase Produk</h2>
              <p className="text-sm text-muted-foreground">Atur katalog dan ketersediaan produkmu di sini.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 text-xs">
                <span className="bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">{stats.active} Aktif</span>
                <span className="bg-muted text-muted-foreground font-semibold px-2.5 py-1 rounded-full">{stats.inactive} Nonaktif</span>
              </div>
              <Button onClick={() => openProductDialog()} className="rounded-xl gap-2 font-bold shadow-md bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4" /> Tambah Produk
              </Button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Memuat data produk...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/10">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="font-bold text-lg mb-1">Belum Ada Produk</h3>
              <p className="text-sm text-muted-foreground mb-6">Etalase toko masih kosong. Tambahkan menu jualan Anda sekarang.</p>
              <Button onClick={() => openProductDialog()} className="rounded-xl bg-orange-500 hover:bg-orange-600 gap-1.5">
                <Plus className="h-4 w-4" /> Buat Produk Pertama
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="relative rounded-2xl border border-border bg-card p-4 hover:border-orange-300/60 hover:shadow-md transition-all group overflow-hidden">
                  <div className="flex gap-3">
                    {p.imageUrl ? (
                      <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 border">
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl shrink-0 border bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-sm truncate mb-0.5">{p.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />{p.category}
                      </p>
                      <p className="text-base font-extrabold text-orange-600">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 bg-background/90 backdrop-blur-md rounded-lg shadow-sm border p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => openProductDialog(p)}>
                      <PenSquare className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50 rounded-lg" onClick={() => deleteProduct(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    {!p.isActive && (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">NONAKTIF</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: ORDERS (LAPORAN) */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Pesanan" value="—" icon={ShoppingBag} color="blue" subtitle="Fitur segera hadir" />
            <StatCard title="Pesanan Baru" value="—" icon={Clock} color="orange" subtitle="Fitur segera hadir" />
            <StatCard title="Pesanan Selesai" value="—" icon={CheckCircle} color="green" subtitle="Fitur segera hadir" />
            <StatCard title="Total Tampilan" value="—" icon={Eye} color="purple" subtitle="Fitur segera hadir" />
          </div>

          {/* Coming Soon */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardContent className="py-16 text-center">
              <div className="h-20 w-20 rounded-3xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-extrabold mb-2">Laporan Pesanan</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                Fitur laporan pesanan sedang dalam pengembangan. Segera hadir! Anda akan bisa melihat semua riwayat pesanan yang masuk melalui WhatsApp.
              </p>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 text-xs px-3 py-1">
                🚧 Segera Hadir
              </Badge>
            </CardContent>
          </Card>

          {/* Chart tetap ditampilkan */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Grafik Aktivitas</CardTitle>
                  <CardDescription className="text-xs">Estimasi performa berdasarkan jumlah produk & interaksi</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">Demo Data</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="views" name="Tampilan" stroke="#f97316" strokeWidth={2.5} fill="url(#colorViews)" dot={{ fill: "#f97316", r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: SETTINGS */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <Card className="rounded-2xl bg-card shadow-sm border border-border/60">
          <CardHeader className="border-b pb-5 space-y-1">
            <CardTitle className="text-xl flex items-center gap-2"><Settings className="h-5 w-5 text-muted-foreground" /> Pengaturan Toko</CardTitle>
            <CardDescription>Sesuaikan informasi bisnis agar pelanggan mudah menghubungi dan membayar Anda.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={storeForm.handleSubmit(onUpdateStore)} className="space-y-6 w-full pb-6">
              {/* Profil Dasar */}
              <div className="space-y-4 bg-muted/20 p-5 border border-border rounded-2xl">
                <h3 className="text-sm font-bold flex items-center gap-2"><Store className="h-4 w-4" /> Profil Toko</h3>
                <div className="space-y-2">
                  <Label className="font-semibold">Nama Toko *</Label>
                  <Input {...storeForm.register("name")} className="rounded-xl" />
                  {storeForm.formState.errors.name && <p className="text-xs text-destructive">{storeForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Deskripsi</Label>
                  <Textarea {...storeForm.register("description")} className="rounded-xl resize-none" placeholder="Deskripsikan tokomu..." rows={3} />
                </div>
              </div>

              {/* Kontak */}
              <div className="space-y-4 bg-green-50/50 border border-green-100 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-green-800 flex items-center gap-2"><Smartphone className="h-4 w-4" /> Kontak Pemesanan</h3>
                <div className="space-y-2">
                  <Label className="font-semibold">Nomor WhatsApp *</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm text-muted-foreground font-semibold">+62</span>
                    <Input {...storeForm.register("whatsapp")} type="tel" className="pl-10 rounded-xl" placeholder="8123xxx" />
                  </div>
                  {storeForm.formState.errors.whatsapp && <p className="text-xs text-destructive">{storeForm.formState.errors.whatsapp.message}</p>}
                </div>
              </div>

              {/* Rekening */}
              <div className="space-y-4 bg-orange-50/50 border border-orange-100 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2"><Building2 className="h-4 w-4" /> Informasi Bank (Opsional)</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Bank / E-Wallet</Label>
                    <Input {...storeForm.register("bankName")} placeholder="BCA / GoPay / DANA" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Atas Nama</Label>
                    <Input {...storeForm.register("bankAccountOwner")} placeholder="Budi Santoso" className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Nomor Rekening</Label>
                  <Input {...storeForm.register("bankAccountNumber")} className="rounded-xl font-mono" />
                </div>
              </div>

              {/* Status Toko */}
              <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl border">
                <input type="checkbox" id="isActive" {...storeForm.register("isActive")} className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500" />
                <div>
                  <Label htmlFor="isActive" className="font-semibold cursor-pointer">Toko Sedang Buka</Label>
                  <p className="text-xs text-muted-foreground">Centang agar toko menerima pesanan</p>
                </div>
              </div>

              <Button disabled={isUpdatingStore} type="submit" size="lg" className="rounded-xl px-8 gap-2 bg-orange-500 hover:bg-orange-600 font-bold shadow-md text-white">
                {isUpdatingStore ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MODAL: PRODUK */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-0 flex flex-col max-h-[90vh]">
          <div className={`p-6 pb-5 border-b rounded-t-2xl shrink-0 ${editingProduct ? "bg-linear-to-r from-blue-50 to-indigo-50" : "bg-linear-to-r from-orange-50 to-amber-50"}`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${editingProduct ? "bg-blue-100" : "bg-orange-100"}`}>
                {editingProduct ? <PenSquare className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-orange-600" />}
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {editingProduct ? `Editing: ${editingProduct.name}` : "Isi detail produk yang ingin dijual"}
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Nama Produk */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Nama Produk <span className="text-orange-500">*</span></Label>
                <Input {...productForm.register("name")} className="h-11 rounded-xl" placeholder="Contoh: Nasi Goreng Spesial" />
                {productForm.formState.errors.name && <p className="text-[11px] text-destructive">⚠ {productForm.formState.errors.name.message}</p>}
              </div>

              {/* Harga & Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Harga <span className="text-orange-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                    <Input type="number" {...productForm.register("price")} className="h-11 pl-8 rounded-xl font-mono" placeholder="15000" />
                  </div>
                  {productForm.formState.errors.price && <p className="text-[11px] text-destructive">⚠ {productForm.formState.errors.price.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Kategori <span className="text-orange-500">*</span></Label>
                  <Select value={productForm.watch("category")} onValueChange={(val) => productForm.setValue("category", val, { shouldValidate: true })}>
                    <SelectTrigger className="py-5 w-full rounded-xl"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {PRODUCT_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Deskripsi</Label>
                <Textarea {...productForm.register("description")} className="rounded-xl resize-none text-sm" rows={3} placeholder="Deskripsikan produk Anda..." />
              </div>

              {/* Upload Gambar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Foto Produk</Label>
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">Opsional • Maks. 512KB</Badge>
                </div>
                {productForm.watch("imageUrl") ? (
                  <div className="flex items-center gap-4 p-3 border rounded-xl bg-muted/10">
                    <img src={productForm.watch("imageUrl")} alt="Preview" className="h-20 w-20 object-cover rounded-xl border shadow-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold mb-0.5">Foto sudah diupload ✓</p>
                      <p className="text-[11px] text-muted-foreground truncate">{productForm.watch("imageUrl")}</p>
                      <Button type="button" variant="outline" size="sm" className="mt-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/5 rounded-lg h-7" onClick={() => productForm.setValue("imageUrl", "")}>
                        <X className="h-3 w-3 mr-1" /> Ganti Foto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/20 hover:bg-orange-50/30 hover:border-orange-300 transition-colors p-5 gap-2">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mb-1">
                      <Package className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">Upload foto produk</p>
                    <p className="text-[11px] text-muted-foreground/70 mb-2">JPG, PNG, WEBP • Maks. 512KB</p>
                    <UploadButton
                      endpoint="productImage"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]) { productForm.setValue("imageUrl", res[0].url); toast.success("Gambar berhasil diupload!"); }
                      }}
                      onUploadError={(error: Error) => { toast.error(`Upload gagal: ${error.message}`); }}
                      appearance={{
                        button: "bg-orange-500 hover:bg-orange-600 text-sm font-semibold text-white rounded-xl px-5 h-9 shadow-sm ut-uploading:bg-orange-400 after:bg-orange-600",
                        allowedContent: "hidden",
                      }}
                      content={{
                        button({ ready, isUploading }) {
                          if (isUploading) return <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Mengupload...</span>;
                          if (ready) return "Pilih Gambar";
                          return "Memuat...";
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status Aktif */}
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                <div>
                  <p className="text-sm font-semibold">Produk Tersedia</p>
                  <p className="text-[11px] text-muted-foreground">Tampil di halaman toko publik</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="p_isActive" {...productForm.register("isActive")} className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t bg-background rounded-b-2xl shrink-0 flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl font-semibold" onClick={() => setIsProductDialogOpen(false)}>
                Batal
              </Button>
              <Button
                disabled={isProductActionLoading}
                type="submit"
                className={`flex-1 h-11 rounded-xl font-bold shadow-md gap-2 text-white ${editingProduct ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"}`}
              >
                {isProductActionLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : editingProduct ? (
                  <><PenSquare className="h-4 w-4" /> Simpan Perubahan</>
                ) : (
                  <><Plus className="h-4 w-4" /> Tambah Produk</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
