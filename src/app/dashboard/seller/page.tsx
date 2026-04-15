import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stores, products } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { SellerOverviewDashboard } from "@/components/seller/SellerOverviewDashboard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function SellerDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") {
    redirect("/login");
  }

  // Fetch all stores milik user
  const userStores = await db.query.stores.findMany({
    where: eq(stores.userId, user.id),
    orderBy: (stores, { desc }) => [desc(stores.createdAt)],
  });

  // Fetch semua produk dari semua toko sekaligus
  const storeIds = userStores.map((s) => s.id);
  const allProducts =
    storeIds.length > 0
      ? await db
          .select()
          .from(products)
          .where(inArray(products.storeId, storeIds))
      : [];

  // Gabungkan produk ke masing-masing toko
  const storesWithProducts = userStores.map((store) => ({
    ...store,
    products: allProducts.filter((p) => p.storeId === store.id),
  }));

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Memuat dashboard...</span>
        </div>
      }
    >
      <SellerOverviewDashboard
        stores={storesWithProducts as any}
        userName={user.fullName || user.username || "Seller"}
      />
    </Suspense>
  );
}