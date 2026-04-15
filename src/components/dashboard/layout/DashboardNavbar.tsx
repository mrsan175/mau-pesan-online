"use client";

import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/actions/auth";
import { useState } from "react";
import Link from "next/link";

interface DashboardNavbarProps {
  userName: string;
  userEmail: string;
  storeName?: string;
  pageTitle?: string;
  onMobileSidebarToggle?: () => void;
}

export function DashboardNavbar({
  userName,
  userEmail,
  storeName,
  onMobileSidebarToggle,
}: DashboardNavbarProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 gap-4 border-b border-border/60 bg-background/95 backdrop-blur-md px-4 md:px-6">
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-muted-foreground shrink-0"
        onClick={onMobileSidebarToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Cari produk, pesanan, atau toko..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-muted/40 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        {/* Bell */}
        <Button variant="ghost" size="icon" className="relative w-9 h-9 rounded-xl text-muted-foreground hover:bg-muted/60">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 border-2 border-background" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-muted-foreground hover:bg-muted/60">
          <HelpCircle className="h-4.5 w-4.5" />
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border/60 mx-1" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-muted/60 transition-colors outline-none">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-orange-500/10 text-orange-600 text-[13px] font-bold">
                  {userName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loggingOut}
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg"
            >
              {loggingOut ? "Keluar..." : "Keluar Akun"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
