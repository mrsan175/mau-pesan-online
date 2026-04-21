"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package, Eye, ShoppingBag, Plus, ArrowUpRight,
  CalendarDays, Flame, Lightbulb, Store, CheckCircle,
  Clock, TrendingUp, ExternalLink, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type StoreProduct = {
  id: string; storeId: string; name: string; category: string;
  price: string; isActive: boolean; imageUrl: string | null;
  createdAt: Date | null;
};
type StoreWithProducts = {
  id: string; name: string; slug: string; isActive: boolean;
  whatsapp: string; createdAt: Date | null;
  products: StoreProduct[];
};

interface Props {
  stores: StoreWithProducts[];
  userName: string;
}

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const generateWeekly = () =>
  DAYS.map((day, i) => ({
    day,
    Tampilan: Math.floor(20 + Math.random() * 90 + (i >= 4 ? 25 : 0)),
    WA_Diklik: Math.floor(5 + Math.random() * 35 + (i >= 4 ? 10 : 0)),
  }));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border/60 rounded-xl shadow-lg px-4 py-3 text-sm min-w-[140px]">
      <p className="font-bold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground text-xs">{p.name.replace("_", " ")}</span>
          </div>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function StockBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={`text-[10px] font-bold px-2 py-0.5 pointer-events-none ${isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-orange-100 text-orange-700 hover:bg-orange-100"
        }`}
    >
      {isActive ? "IN STOCK" : "NON-AKTIF"}
    </Badge>
  );
}

function relativeTime(date: Date | null): string {
  if (!date) return "Baru saja";
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Baru saja";
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Kemarin";
  return `${d} hari lalu`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export function SellerOverviewDashboard({ stores, userName }: Props) {
  const [weeklyData] = useState(generateWeekly);

  const allProducts = stores.flatMap((s) => s.products);
  const totalProducts = allProducts.length;
  const activeProducts = allProducts.filter((p) => p.isActive).length;
  const activeStores = stores.filter((s) => s.isActive).length;

  const recentProducts = [...allProducts]
    .sort((a, b) => {
      const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bT - aT;
    })
    .slice(0, 5)
    .map((p) => ({
      ...p,
      storeName: stores.find((s) => s.id === p.storeId)?.name ?? "",
      storeSlug: stores.find((s) => s.id === p.storeId)?.slug ?? "",
    }));


  const categoryMap: Record<string, number> = {};
  allProducts.forEach((p) => { categoryMap[p.category] = (categoryMap[p.category] || 0) + 1; });
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Makanan";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Performa Akun</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {greeting()}, <strong>{userName}</strong>. Berikut performa tokomu hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="outline" className="gap-2 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors h-10">
            <CalendarDays className="h-4 w-4" />
            30 Hari Terakhir
          </Button>
          <Link href="/dashboard/seller/product">
            <Button className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/25 transition-colors h-10">
              <Plus className="h-4 w-4" />
              Produk Baru
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="px-3 flex flex-col md:flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
              <Store className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1 items-center min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Total Toko</p>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <p className="text-3xl font-extrabold text-foreground leading-none">{stores.length}</p>
                <Badge variant="outline" className="text-[10px] font-bold text-green-600 bg-green-100 border-transparent hover:bg-green-100 mb-0.5 pointer-events-none">
                  {activeStores} Aktif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="px-3 flex flex-col md:flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
              <Package className="h-6 w-6 text-violet-600" />
            </div>
            <div className="flex-1 items-center min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Total Produk</p>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <p className="text-3xl font-extrabold text-foreground leading-none">{totalProducts}</p>
                <Badge variant="outline" className="text-[10px] font-bold text-green-600 bg-green-100 border-transparent hover:bg-green-100 mb-0.5 pointer-events-none">
                  {activeProducts} Aktif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="px-3 flex flex-col md:flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <Eye className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 items-center min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Total Tampilan</p>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <p className="text-3xl font-extrabold text-foreground leading-none">—</p>
                <span className="text-[11px] font-medium text-muted-foreground mb-0.5">Segera hadir</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WA Clicks */}
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="px-3 flex flex-col md:flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1 items-center min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">WA Diklik</p>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <p className="text-3xl font-extrabold text-foreground leading-none">—</p>
                <span className="text-[11px] font-medium text-muted-foreground mb-0.5">Segera hadir</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main 2-col layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* LEFT: Chart + Stores */}
        <div className="space-y-5">
          {/* Chart Card */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">Aktivitas Mingguan</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Estimasi tampilan & klik WhatsApp 7 hari terakhir</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-medium border rounded-full px-3 py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">Tampilan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span className="text-muted-foreground">WA Diklik</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={weeklyData} margin={{ top: 15, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gTampilan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gWA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Tampilan" stroke="#f97316" strokeWidth={2.5} fill="url(#gTampilan)" dot={false} activeDot={{ r: 5, fill: "#f97316", strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="WA_Diklik" stroke="#60a5fa" strokeWidth={2.5} fill="url(#gWA)" dot={false} activeDot={{ r: 5, fill: "#60a5fa", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stores List */}
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
              <div className="space-y-1">
                <CardTitle className="text-base">Toko Aktif</CardTitle>
                <CardDescription className="text-xs">{activeStores} dari {stores.length} toko sedang berjalan</CardDescription>
              </div>
              <Button asChild variant="ghost" className="text-xs font-semibold text-orange-500 hover:text-orange-600 hover:bg-orange-50 gap-1 h-8 rounded-lg px-2">
                <Link href="/dashboard/seller/shop">
                  Kelola Semua <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {stores.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Store className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">Belum ada toko</p>
                  <Button asChild variant="link" className="mt-3 text-xs text-orange-500 font-semibold h-auto p-0">
                    <Link href="/dashboard/seller/shop">+ Buka Toko Baru</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {stores.slice(0, 4).map((store) => (
                    <div key={store.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/20 transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 font-extrabold text-orange-500 text-base">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{store.name}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${store.isActive ? "bg-green-500" : "bg-zinc-300"}`} />
                          {store.products.length} produk · /{store.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                          <Link href={`/shop/${store.slug}`} target="_blank">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="h-8 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-orange-500 transition-colors">
                          <Link href={`/dashboard/seller/${store.id}`}>
                            Kelola
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Recently Added + Tip */}
        <div className="space-y-4">
          {/* Recently Added */}
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 py-4">
              <CardTitle className="text-sm">Recently Added</CardTitle>
              <Button asChild variant="ghost" className="text-xs font-semibold text-orange-500 hover:text-orange-600 hover:bg-orange-50 h-auto py-1 px-2 rounded-lg">
                <Link href="/dashboard/seller/product">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentProducts.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Package className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Belum ada produk</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {recentProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                      {/* Thumbnail */}
                      <div className="h-12 w-12 rounded-xl border border-border/50 overflow-hidden bg-muted shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {p.category} · Added {relativeTime(p.createdAt)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-extrabold text-orange-600">
                            Rp {Number(p.price).toLocaleString("id-ID")}
                          </span>
                          <StockBadge isActive={p.isActive} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tip Card — matches reference "Curator's Tip" */}
          <Card className="bg-violet-50 border-violet-200/60 rounded-2xl shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-violet-600" />
                </div>
                <p className="text-sm font-bold text-violet-800">Tips Penjualan</p>
              </div>
              <p className="text-[12px] text-violet-700/80 leading-relaxed mb-3">
                Kategori <strong className="text-violet-800">"{topCategory}"</strong> adalah yang paling banyak produknya.
                Tambahkan foto menarik untuk meningkatkan daya tarik pembeli hingga <strong className="text-violet-800">3x lebih tinggi!</strong>
              </p>
              <Button asChild className="text-[11px] font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 h-8 rounded-lg">
                <Link href="/dashboard/seller/product">Kelola Produk →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-widest">Status Cepat</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Store className="h-4 w-4 text-orange-400" />
                  <span className="text-muted-foreground">Toko Aktif</span>
                </div>
                <span className="text-sm font-bold">{activeStores} <span className="text-muted-foreground font-normal text-xs">/ {stores.length}</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-muted-foreground">Produk Aktif</span>
                </div>
                <span className="text-sm font-bold">{activeProducts} <span className="text-muted-foreground font-normal text-xs">/ {totalProducts}</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-muted-foreground">Performa</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-green-600 bg-green-100 border-transparent pointer-events-none">Aktif</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
