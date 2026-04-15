"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Store,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Menu
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useState, useEffect } from "react";
import { logoutAction } from "@/lib/actions/auth";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";

interface UserInfo {
  fullName: string | null;
  email: string | null;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { getTotalItems, toggleCart } = useCartStore();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch user info (replaces useSession)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, [pathname]); // Refresh when user navigates (e.g. from /login to /dashboard)

  const handleLogout = async () => {
    setUser(null); // Instant optimistic update
    setSheetOpen(false);
    await logoutAction();
  };

  useEffect(() => {
    setTotalItems(getTotalItems());
  }, [getTotalItems]);

  useEffect(() => {
    const unsub = useCartStore.subscribe((state) => {
      setTotalItems(state.getTotalItems());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (
    pathname.startsWith("/dashboard/seller") ||
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  const role = user?.role;
  const isLoggedIn = !!user;

  const navLinks = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/store", label: "Toko", icon: Store },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/95 backdrop-blur-xl border-b shadow-sm"
        : "bg-background/80 backdrop-blur-md border-b border-border/50"
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-8 w-8 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <span className="text-white text-base">🛍</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm text-foreground">Mau Pesan</span>
            <span className="font-bold text-sm bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Online
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              variant={isActive(href) ? "secondary" : "ghost"}
              asChild
              className={`gap-1.5 ${isActive(href) ? "text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20" : ""}`}
            >
              <Link href={href}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <Button
            onClick={toggleCart}
            size="sm"
            className="relative gap-2 bg-linear-to-r from-orange-500 to-red-600 text-white rounded-full h-9 px-4 hover:from-orange-600 hover:to-red-700 shadow-md shadow-orange-500/25 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 bg-white hover:bg-white text-orange-600 rounded-full text-[10px] font-bold shadow-sm border border-orange-200">
                {totalItems > 9 ? "9+" : totalItems}
              </Badge>
            )}
          </Button>
          {/* Auth Dropdown */}
          {!authLoading && (
            <>
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 overflow-hidden bg-background">
                        <Avatar className="h-full w-full">
                          <AvatarFallback className="bg-orange-500/10 text-orange-600 text-[13px] font-bold">
                            {user?.fullName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {role === "seller" && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/seller" className="cursor-pointer font-medium text-orange-600 focus:text-orange-700">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard Toko
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {(role === "admin" || role === "superAdmin") && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/admin" className="cursor-pointer font-medium text-violet-600 focus:text-violet-700">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard Admin
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {(role === "admin" || role === "superAdmin" || role === "seller") && <DropdownMenuSeparator />}

                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar Akun
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild className="hidden sm:flex h-9 rounded-full px-4 gap-2 border-border shadow-sm text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </Link>
                </Button>
              )}
            </>
          )}



          {/* Mobile menu toggle (Sheet) */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:bg-muted/60 hover:text-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col border-r bg-background/95 backdrop-blur-xl">
              <SheetHeader className="p-4 border-b text-left flex flex-row items-center justify-between">
                <Link href="/" className="flex items-center gap-2" onClick={() => setSheetOpen(false)}>
                  <div className="h-8 w-8 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-white text-base">🛍</span>
                  </div>
                  <SheetTitle className="font-bold flex gap-1">
                    Mau Pesan <span className="text-orange-500 bg-linear-to-r from-orange-500 to-red-600 bg-clip-text">Online</span>
                  </SheetTitle>
                </Link>
              </SheetHeader>

              <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-2">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Button
                    key={href}
                    variant={isActive(href) ? "secondary" : "ghost"}
                    asChild
                    className={`justify-start gap-3 h-11 ${isActive(href) ? "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" : ""}`}
                    onClick={() => setSheetOpen(false)}
                  >
                    <Link href={href}>
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  </Button>
                ))}

                {/* Role Dashboards Drop */}
                {(isLoggedIn && role === "seller") && (
                  <Button asChild variant="secondary" className="justify-start gap-3 mt-4 h-11 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20 shadow-sm" onClick={() => setSheetOpen(false)}>
                    <Link href="/dashboard/seller">
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard Toko
                    </Link>
                  </Button>
                )}
                {isLoggedIn && (role === "admin" || role === "superAdmin") && (
                  <Button asChild variant="secondary" className="justify-start gap-3 mt-4 h-11 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 border-violet-500/20 shadow-sm" onClick={() => setSheetOpen(false)}>
                    <Link href="/dashboard/admin">
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard Admin
                    </Link>
                  </Button>
                )}
              </div>

              <SheetFooter className="p-4 border-t flex-col sm:flex-col items-stretch gap-2 bg-linear-to-t from-muted/30 to-transparent">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-background border border-border p-3 rounded-lg shadow-sm">
                      <Avatar>
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {user?.fullName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-sm font-medium truncate">{user?.fullName}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                      </div>
                      <Badge variant="outline" className="ml-auto uppercase text-[10px] py-0 h-5 border-orange-200 text-orange-600 bg-orange-50">{role}</Badge>
                    </div>
                    <Button variant="destructive" className="w-full gap-2 bg-destructive/90 hover:bg-destructive shadow-sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Keluar Akun
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full gap-2 bg-linear-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/25" onClick={() => setSheetOpen(false)}>
                    <Link href="/login">
                      <LogIn className="h-4 w-4" />
                      Masuk / Daftar
                    </Link>
                  </Button>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
