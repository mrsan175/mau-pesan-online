"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Package, Plus, PenSquare, Trash2, Loader2, X,
  Search, Filter, Store, CheckCircle, XCircle, ChevronDown,
} from "lucide-react";
import { UploadButton } from "@/lib/uploadthing-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type StoreType = { id: string; name: string; slug: string };
type Product = {
  id: string; storeId: string; name: string; description: string;
  price: string; category: string; imageUrl: string | null; isActive: boolean;
};

const CATEGORIES = ["Makanan", "Minuman", "Camilan", "Dessert", "Paket Hemat", "Lainnya"];

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  price: z.coerce.number().positive(),
  category: z.string().min(1),
  imageUrl: z.string().url().or(z.literal("")),
  isActive: z.boolean(),
  storeId: z.string().min(1, "Pilih toko terlebih dahulu"),
});
type ProductForm = z.infer<typeof productSchema>;

export function AllProductsManager({ stores }: { stores: StoreType[] }) {
  const [products, setProducts] = useState<(Product & { storeName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStore, setFilterStore] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { name: "", description: "", price: 0, category: "Makanan", imageUrl: "", isActive: true, storeId: stores[0]?.id || "" },
  });

  // Fetch all products from all stores
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        stores.map((s) =>
          fetch(`/api/seller/products?storeId=${s.id}`)
            .then((r) => r.json())
            .then((ps: Product[]) => ps.map((p) => ({ ...p, storeName: s.name })))
        )
      );
      setProducts(results.flat());
    } catch {
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    form.reset({ name: "", description: "", price: 0, category: "Makanan", imageUrl: "", isActive: true, storeId: stores[0]?.id || "" });
    setIsDialogOpen(true);
  };

  const openEdit = (p: Product & { storeName: string }) => {
    setEditingProduct(p);
    form.reset({ name: p.name, description: p.description, price: Number(p.price), category: p.category, imageUrl: p.imageUrl || "", isActive: p.isActive, storeId: p.storeId });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: ProductForm) => {
    setSaving(true);
    try {
      const isEditing = !!editingProduct;
      const url = isEditing ? `/api/seller/products/${editingProduct!.id}` : `/api/seller/products`;
      const body = isEditing ? { name: values.name, description: values.description, price: values.price, category: values.category, imageUrl: values.imageUrl, isActive: values.isActive } : values;
      const res = await fetch(url, { method: isEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Produk diperbarui!" : "Produk ditambahkan!");
      setIsDialogOpen(false);
      fetchAll();
    } catch {
      toast.error("Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Yakin hapus produk ini?")) return;
    try {
      await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
      toast.success("Produk dihapus");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  // Filtered products
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.storeName.toLowerCase().includes(search.toLowerCase());
    const matchStore = filterStore === "all" || p.storeId === filterStore;
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? p.isActive : !p.isActive);
    return matchSearch && matchStore && matchCat && matchStatus;
  });

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.length - activeCount;

  return (
    <div className="space-y-5">
      {/* Stat bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border/60 rounded-xl text-sm">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="font-semibold">{products.length}</span>
          <span className="text-muted-foreground">Total Produk</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border/60 rounded-xl text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="font-semibold text-green-600">{activeCount}</span>
          <span className="text-muted-foreground">Aktif</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border/60 rounded-xl text-sm">
          <XCircle className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{inactiveCount}</span>
          <span className="text-muted-foreground">Nonaktif</span>
        </div>
        <Button onClick={openAdd} disabled={stores.length === 0} className="ml-auto rounded-xl gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md">
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama produk atau toko..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-10"
          />
        </div>
        {/* Filter Toko */}
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="w-[150px] rounded-xl h-10">
            <Store className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Semua Toko" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Semua Toko</SelectItem>
            {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {/* Filter Kategori */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px] rounded-xl h-10">
            <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Semua Kategori</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {/* Filter Status */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] rounded-xl h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product List */}
      <Card className="border border-border/60 shadow-sm bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Memuat semua produk...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="font-bold text-base">{products.length === 0 ? "Belum ada produk" : "Tidak ada hasil"}</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {products.length === 0 ? "Klik tombol \"Tambah Produk\" untuk menambahkan produk pertama Anda." : "Coba ubah filter pencarian Anda."}
            </p>
            {products.length === 0 && (
              <Button onClick={openAdd} className="mt-2 rounded-xl gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4" /> Tambah Produk
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Produk</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-32">Toko</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-28">Kategori</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-36">Harga</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p, i) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                    {/* Index */}
                    <td className="px-5 py-3.5 text-xs text-muted-foreground text-center">{i + 1}</td>
                    {/* Produk */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-9 w-9 rounded-lg object-cover border shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                            <Package className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold truncate max-w-[200px]">{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${p.isActive ? "bg-green-500" : "bg-zinc-300"}`} />
                            <span className={`text-[10px] font-medium ${p.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                              {p.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Toko */}
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className="text-[10px] font-semibold whitespace-nowrap border-border/60">
                        {p.storeName}
                      </Badge>
                    </td>
                    {/* Kategori */}
                    <td className="px-4 py-3.5">
                      <Badge className="bg-muted text-muted-foreground text-[10px] font-medium hover:bg-muted border-0 whitespace-nowrap">
                        {p.category}
                      </Badge>
                    </td>
                    {/* Harga */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-extrabold text-orange-600 whitespace-nowrap">
                        Rp {Number(p.price).toLocaleString("id-ID")}
                      </span>
                    </td>
                    {/* Aksi */}
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:bg-blue-50 rounded-lg" onClick={() => openEdit(p)}>
                          <PenSquare className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 rounded-lg" onClick={() => deleteProduct(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Menampilkan <strong>{filtered.length}</strong> dari <strong>{products.length}</strong> produk
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Dialog Tambah / Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-0 flex flex-col max-h-[90vh]">
          <div className={`p-6 pb-5 border-b rounded-t-2xl shrink-0 ${editingProduct ? "bg-linear-to-r from-blue-50 to-indigo-50" : "bg-linear-to-r from-orange-50 to-amber-50"}`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${editingProduct ? "bg-blue-100" : "bg-orange-100"}`}>
                {editingProduct ? <PenSquare className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-orange-600" />}
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {editingProduct ? `Editing: ${editingProduct.name}` : "Isi detail produk"}
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Pilih Toko (hanya saat tambah baru) */}
              {!editingProduct && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Toko <span className="text-orange-500">*</span></Label>
                  <Select value={form.watch("storeId")} onValueChange={(v) => form.setValue("storeId", v, { shouldValidate: true })}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Pilih toko" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.storeId && <p className="text-[11px] text-destructive">⚠ {form.formState.errors.storeId.message}</p>}
                </div>
              )}
              {/* Nama */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Nama Produk <span className="text-orange-500">*</span></Label>
                <Input {...form.register("name")} className="h-11 rounded-xl" placeholder="Nasi Goreng Spesial" />
                {form.formState.errors.name && <p className="text-[11px] text-destructive">⚠ {form.formState.errors.name.message}</p>}
              </div>
              {/* Harga & Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Harga <span className="text-orange-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                    <Input type="number" {...form.register("price")} className="h-11 pl-8 rounded-xl font-mono" placeholder="15000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Kategori <span className="text-orange-500">*</span></Label>
                  <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Deskripsi</Label>
                <Textarea {...form.register("description")} className="rounded-xl resize-none text-sm" rows={2} placeholder="Deskripsi singkat produk..." />
              </div>
              {/* Gambar */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Foto Produk</Label>
                {form.watch("imageUrl") ? (
                  <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/10">
                    <img src={form.watch("imageUrl")} alt="Preview" className="h-16 w-16 object-cover rounded-lg border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-1">Foto diupload ✓</p>
                      <Button type="button" variant="outline" size="sm" className="text-xs text-destructive h-7 rounded-lg" onClick={() => form.setValue("imageUrl", "")}>
                        <X className="h-3 w-3 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-orange-300 transition-colors">
                    <UploadButton
                      endpoint="productImage"
                      onClientUploadComplete={(res) => { if (res?.[0]) { form.setValue("imageUrl", res[0].url); toast.success("Gambar diupload!"); } }}
                      onUploadError={(e: Error) => { toast.error(`Upload gagal: ${e.message}`); }}
                      appearance={{
                        button: "bg-orange-500 hover:bg-orange-600 text-sm font-semibold text-white rounded-xl px-5 h-9 shadow-sm ut-uploading:bg-orange-400 after:bg-orange-600",
                        allowedContent: "hidden",
                      }}
                      content={{
                        button({ ready, isUploading }) {
                          if (isUploading) return <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" />Mengupload...</span>;
                          if (ready) return "Pilih Gambar";
                          return "Memuat...";
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              {/* Status */}
              <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-xl border">
                <div>
                  <p className="text-sm font-semibold">Produk Tersedia</p>
                  <p className="text-[11px] text-muted-foreground">Tampil di halaman toko</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...form.register("isActive")} className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
            </div>

            <div className="p-5 pt-4 border-t bg-background rounded-b-2xl shrink-0 flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl font-semibold" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button
                disabled={saving} type="submit"
                className={`flex-1 h-11 rounded-xl font-bold gap-2 text-white ${editingProduct ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"}`}
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : editingProduct ? <><PenSquare className="h-4 w-4" /> Simpan</> : <><Plus className="h-4 w-4" /> Tambah</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
