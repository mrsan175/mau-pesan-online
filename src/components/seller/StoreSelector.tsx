"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Store as StoreIcon, Plus, ExternalLink, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

// Data type (simplified)
type StoreData = {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  isActive: boolean;
};

const createStoreSchema = z.object({
  name: z.string().min(3, "Nama toko minimal 3 karakter"),
  slug: z.string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9\-]+$/, "Hanya boleh huruf kecil, angka, dan strip (-)"),
  whatsapp: z.string().min(9, "Nomor WhatsApp tidak valid"),
});

type CreateStoreInput = z.infer<typeof createStoreSchema>;

export function StoreSelector({ initialStores = [] }: { initialStores: StoreData[] }) {
  const router = useRouter();
  const [stores, setStores] = useState<StoreData[]>(initialStores);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
  });

  const slugPreview = watch("slug");

  const onSubmit = async (values: CreateStoreInput) => {
    try {
      setIsCreating(true);
      const res = await fetch("/api/seller/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal membuat toko");
        return;
      }

      toast.success("Toko berhasil dibuat!");
      setStores([data, ...stores]);
      setIsDialogOpen(false);
      reset();
      router.push(`/dashboard/seller/${data.id}`);
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <StoreIcon className="w-5 h-5 text-orange-500" />
          Daftar Toko Anda ({stores.length})
        </h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-md border-0 gap-2">
              <Plus className="h-4 w-4 shadow-sm" />
              Buka Toko Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl p-0 flex flex-col max-h-[90vh]">
            <div className="p-6 pb-5 border-b rounded-t-2xl shrink-0 bg-linear-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-orange-100">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-extrabold leading-none mb-0.5">
                    Buka Toko Baru
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mr-0 mb-0 pr-0">
                    Isi data dasar toko Anda. Produk dan rekening dapat diatur nanti.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold text-sm">Nama Toko <span className="text-orange-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Misal: Kopi Kenangan Mantan"
                    {...register("name")}
                    className={`h-11 rounded-xl ${errors.name ? "border-destructive" : "border-zinc-200"}`}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug" className="font-semibold text-sm">Slug URL <span className="text-orange-500">*</span></Label>
                  </div>
                  <Input
                    id="slug"
                    placeholder="Misal: kopi-kenangan-mantan"
                    {...register("slug")}
                    className={`h-11 rounded-xl ${errors.slug ? "border-destructive" : "border-zinc-200"}`}
                  />
                  <p className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-lg font-mono flex items-center gap-1.5 overflow-hidden">
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">maupesan.online/shop/{slugPreview || "..."}</span>
                  </p>
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="font-semibold text-sm">WhatsApp Admin / CS <span className="text-orange-500">*</span></Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">+62</span>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="81234567890"
                      {...register("whatsapp")}
                      className={`h-11 pl-10 rounded-xl ${errors.whatsapp ? "border-destructive" : "border-zinc-200"}`}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Order akan dikirim otomatis ke nomor ini.</p>
                  {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
                </div>
              </div>

              <div className="p-6 pt-4 border-t bg-white rounded-b-2xl shrink-0 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl font-semibold"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 h-11 rounded-xl gap-2 font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md border-0"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <StoreIcon className="h-4 w-4" />}
                  Buat Toko
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {stores.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 px-6 text-center border-dashed border-2 bg-muted/10 rounded-3xl">
          <div className="h-20 w-20 bg-orange-100 rounded-full flex flex-col items-center justify-center mb-6">
            <StoreIcon className="h-10 w-10 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Anda Belum Memiliki Toko</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Buka toko pertama Anda sekarang untuk memamerkan produk dan menerima pesanan via WhatsApp.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} size="lg" className="rounded-xl bg-orange-500 hover:bg-orange-600 gap-2">
            <Plus className="h-5 w-5" /> Buka Toko Perdana
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="group relative rounded-3xl overflow-hidden hover:shadow-xl transition-all border border-border/60 hover:border-orange-300">
              <div className="absolute top-0 right-0 p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${store.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-700"}`}>
                  {store.isActive ? "Aktif" : "Non-aktif"}
                </span>
              </div>

              <div className="p-6 pt-10 flex flex-col items-center text-center pb-8 border-b border-border/40 bg-linear-to-b from-orange-50/50 to-transparent">
                <div className="h-16 w-16 bg-white border shadow-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-orange-500">
                    {store.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1 truncate w-full">{store.name}</h3>
                <p className="text-sm text-muted-foreground">+{store.whatsapp}</p>
              </div>

              <div className="p-4 bg-muted/10 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="w-full rounded-xl hover:bg-white bg-white/50 text-xs gap-1.5 h-10 border-border/80 text-muted-foreground hover:text-foreground">
                  <Link href={`/shop/${store.slug}`}>
                    <ExternalLink className="h-3.5 w-3.5" /> Publik
                  </Link>
                </Button>
                <Button asChild className="w-full rounded-xl gap-1.5 shadow-none bg-zinc-900 text-white hover:bg-orange-600 h-10 text-xs">
                  <Link href={`/dashboard/seller/${store.id}`}>
                    Kelola <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
