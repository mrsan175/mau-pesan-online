"use client";

import { useState, Suspense } from "react";
import { X, ArrowLeft } from "lucide-react";
import { DashboardNavbar } from "./DashboardNavbar";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3, Package, Settings, LogOut,
  Store, ExternalLink, ShoppingBag, HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";

// Route segments yang BUKAN storeId
const STATIC_SEGMENTS = ["shop", "product"];

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}

export function DashboardLayoutClient({
  children,
  userName,
  userEmail,
}: DashboardLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Extract storeId — exclude static segments
  const storeIdMatch = pathname.match(/\/dashboard\/seller\/([^/]+)/);
  const potentialId = storeIdMatch?.[1] ?? null;
  const storeId = potentialId && !STATIC_SEGMENTS.includes(potentialId) ? potentialId : null;

  return (
    <div className="flex min-h-screen bg-[#f9f9fb]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border/60 bg-background fixed top-0 bottom-0 left-0 overflow-hidden z-20">
        <Suspense fallback={<div className="flex-1 animate-pulse bg-muted/20" />}>
          <SidebarContent storeId={storeId} userName={userName} pathname={pathname} />
        </Suspense>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-border bg-background shadow-2xl transition-transform duration-300 md:hidden",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        <Suspense fallback={<div className="flex-1 animate-pulse bg-muted/20" />}>
          <SidebarContent storeId={storeId} userName={userName} pathname={pathname} />
        </Suspense>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <DashboardNavbar
          userName={userName}
          userEmail={userEmail}
          onMobileSidebarToggle={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({
  storeId,
  userName,
  pathname,
}: {
  storeId: string | null;
  userName: string;
  pathname: string;
}) {
  const [loggingOut, setLoggingOut] = useState(false);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
  };

  // Main nav (no store selected)
  const mainNav = [
    { href: "/dashboard/seller", label: "Dashboard", icon: BarChart3, tab: null, exact: true },
    { href: "/dashboard/seller/shop", label: "Toko Saya", icon: Store, tab: null, exact: true },
    { href: "/dashboard/seller/product", label: "Semua Produk", icon: Package, tab: null, exact: true },
  ];

  // Store-specific nav
  const storeNav = [
    { href: `/dashboard/seller/${storeId}`, label: "Overview", icon: BarChart3, tab: null, exact: true },
    { href: `/dashboard/seller/${storeId}?tab=products`, label: "Etalase Produk", icon: Package, tab: "products", exact: false, badge: "" },
    { href: `/dashboard/seller/${storeId}?tab=orders`, label: "Pesanan", icon: ShoppingBag, tab: "orders", exact: false, badge: "Baru" },
    { href: `/dashboard/seller/${storeId}?tab=settings`, label: "Pengaturan", icon: Settings, tab: "settings", exact: false },
  ];

  const navItems = storeId ? storeNav : mainNav;

  const isActive = (href: string, tab: string | null, exact?: boolean) => {
    const base = href.split("?")[0];
    if (tab !== null) return pathname === base && activeTab === tab;
    if (exact) return pathname === base && !activeTab;
    return pathname.startsWith(base);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0">
            <span className="text-lg">🛍</span>
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-sm text-foreground leading-tight truncate">Mau Pesan Online</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {storeId ? "Dashboard Toko" : "Seller Panel"}
            </p>
          </div>
        </Link>
      </div>

      {/* Back button (store nav only) */}
      {storeId && (
        <div className="px-3 pt-3">
          <Link
            href="/dashboard/seller"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, tab, exact, badge }: any) => {
          const active = isActive(href, tab, exact);
          return (
            <Link
              key={`${href}-${tab}`}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full",
                active
                  ? "bg-orange-50 text-orange-700"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {/* Icon box — matches reference style */}
              <div className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all",
                active
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "bg-muted/70 text-muted-foreground group-hover:bg-muted"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn("flex-1", active && "font-semibold")}>{label}</span>
              {badge && (
                <Badge className="text-[10px] h-4 px-1.5 bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-100">
                  {badge}
                </Badge>
              )}
            </Link>
          );
        })}

        {/* Settings & Help — always shown */}
        <div className="pt-4 mt-2 border-t border-border/50 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-3 mb-2">Lainnya</p>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group"
          >
            <div className="h-8 w-8 rounded-xl bg-muted/70 flex items-center justify-center group-hover:bg-muted">
              <ExternalLink className="h-4 w-4" />
            </div>
            Lihat Website
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group"
          >
            <div className="h-8 w-8 rounded-xl bg-muted/70 flex items-center justify-center group-hover:bg-muted">
              <HelpCircle className="h-4 w-4" />
            </div>
            Bantuan
          </Link>
        </div>
      </nav>

      {/* Bottom — Plan Card + User */}
      <div className="px-3 pb-4 space-y-3">
        {/* Plan card — like PRO PLAN in reference */}
        <div className="bg-linear-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">Starter Plan</span>
          </div>
          <p className="text-[11px] text-orange-800/70 leading-relaxed mb-2.5">
            Buka lebih banyak fitur dengan upgrade ke Premium.
          </p>
          <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-linear-to-r from-orange-500 to-red-500 rounded-full" />
          </div>
          <p className="text-[10px] text-orange-600/60 mt-1">60% kapasitas terpakai</p>
        </div>

        {/* User + logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-all text-sm font-medium group"
        >
          <div className="h-8 w-8 rounded-xl bg-muted/70 flex items-center justify-center group-hover:bg-red-100">
            <LogOut className="h-4 w-4" />
          </div>
          {loggingOut ? "Keluar..." : "Keluar Akun"}
        </button>
      </div>
    </div>
  );
}
