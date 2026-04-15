"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle2, ShoppingBag } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/zod-schemas";
import { registerAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = (values: RegisterInput) => {
    startTransition(async () => {
      const result = await registerAction(values);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.success);
        router.push("/login");
      }
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — form */}
      <div className="flex items-center justify-center p-8 bg-background order-2 lg:order-1 relative">
        <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 to-transparent pointer-events-none z-0" />
        
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
            <h1 className="text-3xl font-extrabold tracking-tight">Buat Akun</h1>
            <p className="text-muted-foreground text-sm font-medium">Mulai belanja atau buka tokomu sendiri</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-semibold text-foreground/90">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Budi Santoso"
                {...register("fullName")}
                className={`rounded-xl bg-muted/30 focus-visible:ring-orange-500/50 ${errors.fullName ? "border-destructive ring-destructive/20 focus-visible:ring-destructive/50" : ""}`}
              />
              {errors.fullName && <p className="text-xs text-destructive font-medium">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username" className="font-semibold text-foreground/90">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="budisantoso"
                onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                {...register("username")}
                className={`rounded-xl bg-muted/30 focus-visible:ring-orange-500/50 ${errors.username ? "border-destructive ring-destructive/20 focus-visible:ring-destructive/50" : ""}`}
              />
              {errors.username && <p className="text-xs text-destructive font-medium">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="font-semibold text-foreground/90">Alamat Email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="budi@example.com"
                {...register("email")}
                className={`rounded-xl bg-muted/30 focus-visible:ring-orange-500/50 ${errors.email ? "border-destructive ring-destructive/20 focus-visible:ring-destructive/50" : ""}`}
              />
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="font-semibold text-foreground/90">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 6 karakter"
                  {...register("password")}
                  className={`pr-12 rounded-xl bg-muted/30 focus-visible:ring-orange-500/50 ${errors.password ? "border-destructive ring-destructive/20 focus-visible:ring-destructive/50" : ""}`}
                />
                <button
                  type="button"
                  id="toggle-reg-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-1 px-3 flex items-center text-muted-foreground hover:text-orange-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1 h-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-300 ${i < passwordStrength.score
                          ? passwordStrength.score <= 1 ? "bg-red-500"
                            : passwordStrength.score <= 2 ? "bg-yellow-500"
                              : passwordStrength.score <= 3 ? "bg-emerald-400"
                                : "bg-emerald-500"
                          : "bg-muted"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground">{passwordStrength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>

            <Button 
               id="register-submit" 
               type="submit" 
               disabled={isPending} 
               className="w-full h-11 mt-6 rounded-xl gap-2 font-bold bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses…</> : "Daftar Sekarang"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground font-medium">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link href="#" className="text-orange-600 hover:text-orange-700 hover:underline">Syarat Ketentuan</Link> dan{" "}
            <Link href="#" className="text-orange-600 hover:text-orange-700 hover:underline">Kebijakan Privasi</Link>.
          </p>

          <p className="text-center text-sm text-muted-foreground font-medium">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-red-600 via-orange-500 to-yellow-500 text-white relative overflow-hidden order-1 lg:order-2">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 translate-x-1/3 translate-y-1/3 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        {/* Floating emojis matching store theme */}
        <span className="absolute text-5xl right-[15%] top-[10%] transform -rotate-12 opacity-80 pointer-events-none animate-pulse">🍗</span>
        <span className="absolute text-5xl left-[10%] top-[45%] transform rotate-12 opacity-80 pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}>☕</span>
        <span className="absolute text-5xl right-[25%] bottom-[15%] transform -rotate-6 opacity-80 pointer-events-none animate-pulse" style={{ animationDelay: '0.8s' }}>🍡</span>

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg ring-1 ring-white/30">
            <span className="text-xl">🛍</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg text-white">Mau Pesan</span>
            <span className="font-bold text-lg text-yellow-200">Online</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Bergabunglah dengan ribuan pembeli dan penjual lainnya.
          </h2>
          <ul className="space-y-4 pt-2">
            {perks.map((perk) => (
               <li key={perk} className="flex items-center gap-3 text-white">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                     <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-base font-medium">{perk}</span>
               </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex gap-6 text-white/70 text-sm font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">Syarat & Ketentuan</span>
          <span className="hover:text-white cursor-pointer transition-colors">Bantuan</span>
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Kosong", "Lemah", "Lumayan", "Bagus", "Sangat Kuat"];
  return { score, label: password.length > 0 ? labels[score] : "" };
}

const perks = [
  "Pesan makanan dan minuman favorit langsung.",
  "Kirim order tanpa ribet lewat WhatsApp.",
  "Buka tokomu secara instan dan gratis.",
  "Keamanan terjamin dan transaksi 100% aman.",
];
