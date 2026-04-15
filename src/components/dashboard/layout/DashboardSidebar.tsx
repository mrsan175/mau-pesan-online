"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Store,
  ExternalLink,
  ShoppingBag,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  storeName: string;
  storeSlug: string;
  isActive: boolean;
  storeId: string;
  userName: string;
}

const menuItems = (storeId: string) => [
  {
    group: "Utama",
    items: [
      {
        href: `/dashboard/seller/${storeId}`,
        label: "Ringkasan",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: `/dashboard/seller/${storeId}?tab=products`,
        label: "Etalase Produk",
        icon: Package,
      },
      {
        href: `/dashboard/seller/${storeId}?tab=orders`,
        label: "Laporan Pesanan",
        icon: ShoppingBag,
      },
    ],
  },
  {
    group: "Toko",
    items: [
      {
        href: `/dashboard/seller/${storeId}?tab=settings`,
        label: "Pengaturan Toko",
        icon: Settings,
      },
    ],
  },
  {
    group: "Lainnya",
    items: [
      {
        href: "/dashboard/seller",
        label: "Ganti Toko",
        icon: RefreshCw,
      },
    ],
  },
];

export function DashboardSidebar({
  storeName,
  storeSlug,
  isActive,
  storeId,
  userName,
}: SidebarProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
  };

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href.split("?")[0];
    return pathname.includes(href.split("?")[0]);
  };

  return (
    <aside className="flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 overflow-hidden">
      {/* Logo / Brand */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5 group mb-4">
          <div className="h-8 w-8 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <span className="text-white text-base">🛍</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm text-sidebar-foreground">Mau Pesan</span>
            <span className="font-bold text-sm bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Online
            </span>
          </div>
        </Link>

        {/* Store Card */}
        <div className="bg-linear-to-br from-orange-500 to-red-600 rounded-2xl p-3.5 text-white shadow-lg shadow-orange-500/25">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{storeName}</p>
              <p className="text-white/70 text-[11px] truncate">/{storeSlug}</p>
            </div>
            <span className={`h-2 w-2 rounded-full shrink-0 ${isActive ? "bg-green-300 shadow-[0_0_6px_rgba(134,239,172,0.8)]" : "bg-red-300"}`} />
          </div>
          <Link
            href={`/shop/${storeSlug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-[11px] font-medium transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Lihat Halaman Toko
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {menuItems(storeId).map((group) => (
          <div key={group.group}>
            <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest px-2 mb-2">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                    isItemActive(href, exact)
                      ? "bg-orange-500/10 text-orange-600 shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isItemActive(href, exact) ? "text-orange-500" : ""
                    )}
                  />
                  {label}
                  {label === "Laporan Pesanan" && (
                    <Badge className="ml-auto text-[10px] h-4 px-1.5 bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/10">
                      Baru
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-sidebar-border space-y-1">
        <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all">
          <HelpCircle className="h-4 w-4" />
          Bantuan
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all font-medium"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Keluar..." : "Keluar Akun"}
        </button>
        <div className="px-3 py-2 mt-1">
          <p className="text-[11px] text-sidebar-foreground/40">Masuk sebagai</p>
          <p className="text-xs font-semibold text-sidebar-foreground/70 truncate">{userName}</p>
        </div>
      </div>
    </aside>
  );
}
