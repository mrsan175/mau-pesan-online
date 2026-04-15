"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, ShoppingBag, Loader2 } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/zod-schemas";
import { loginAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginInput) => {
    startTransition(async () => {
      const result = await loginAction(values);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-orange-500 via-red-500 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 translate-x-1/3 translate-y-1/3 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        {/* Floating emojis matching store theme */}
        <span className="absolute text-5xl right-[10%] top-[15%] transform rotate-12 opacity-80 pointer-events-none animate-pulse">🍜</span>
        <span className="absolute text-5xl left-[15%] top-[55%] transform -rotate-12 opacity-80 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}>🥤</span>
        <span className="absolute text-5xl right-[20%] bottom-[20%] transform rotate-6 opacity-80 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}>🍰</span>

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg ring-1 ring-white/30">
            <span className="text-xl">🛍</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg text-white">Mau Pesan</span>
            <span className="font-bold text-lg text-orange-200">Online</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <blockquote className="text-3xl font-bold leading-tight tracking-tight">
            "Berbelanja dan berjualan kini lebih mudah, langsung ke WhatsApp!"
          </blockquote>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md ring-1 ring-white/20 border-0">
            <div className="h-12 w-12 rounded-full bg-linear-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-lg shadow-inner border border-white/20">B</div>
            <div>
              <p className="font-bold">Budi Santoso</p>
              <p className="text-white/80 text-sm font-medium">Penjual Sukses</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-white/70 text-sm font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">Syarat & Ketentuan</span>
          <span className="hover:text-white cursor-pointer transition-colors">Kebijakan Privasi</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 to-transparent pointer-events-none" />

        <div className="w-full max-w-sm space-y-8 relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-xl text-white">🛍</span>
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="font-bold text-lg text-foreground">Mau Pesan</span>
              <span className="font-bold text-lg bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Online</span>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">Selamat Datang</h1>
            <p className="text-muted-foreground text-sm font-medium">Silakan masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="font-semibold text-foreground/90">Username atau Email</Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="budisantoso atau budi@email.com"
                {...register("identifier")}
                className={`rounded-xl h-11 bg-muted/30 focus-visible:ring-orange-500/50 ${errors.identifier ? "border-destructive ring-destructive/20 focus-visible:ring-destructive/50" : ""}`}
              />
              {errors.identifier && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-foreground/90">Password</Label>
                <Link href="#" className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`pr-12 rounded-xl h-11 bg-muted/30 focus-visible:ring-orange-500/50 ${errors.password ? "border-destructive ring-destructive/20 focus-visible:ring-destructive/50" : ""}`}
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-1 px-3 flex items-center text-muted-foreground hover:text-orange-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              id="login-submit"
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl gap-2 font-bold bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses…</> : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-medium">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
