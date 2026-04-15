import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { Loader2, Package } from "lucide-react";
import { AllProductsManager } from "@/components/seller/AllProductsManager";

export default async function SellerProductPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") {
    redirect("/login");
  }

  const userStores = await db.query.stores.findMany({
    where: eq(stores.userId, user.id),
    orderBy: (stores, { asc }) => [asc(stores.name)],
  });

  const storeList = userStores.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-500" /> Semua Produk
        </h2>
        <p className="text-sm text-muted-foreground">
          Kelola seluruh produk dari semua toko Anda dalam satu tampilan.
        </p>
      </div>

      {userStores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-bold">Buka Toko Dulu</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Anda belum memiliki toko. Buka toko di menu{" "}
            <a href="/dashboard/seller/shop" className="text-orange-500 font-semibold underline">Toko Saya</a>{" "}
            untuk mulai menambahkan produk.
          </p>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="flex items-center gap-3 text-muted-foreground py-12 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Memuat produk...</span>
            </div>
          }
        >
          <AllProductsManager stores={storeList} />
        </Suspense>
      )}
    </div>
  );
}
