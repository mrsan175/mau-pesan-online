import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StoreSelector } from "@/components/seller/StoreSelector";
import { Store, Plus } from "lucide-react";

export default async function SellerShopPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") {
    redirect("/login");
  }

  const userStores = await db.query.stores.findMany({
    where: eq(stores.userId, user.id),
    orderBy: (stores, { desc }) => [desc(stores.createdAt)],
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Store className="h-6 w-6 text-orange-500" /> Toko Saya
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola semua tokomu — buka toko baru atau masuk ke dashboard toko.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-orange-100 text-orange-700 font-semibold px-3 py-1.5 rounded-full">
            {userStores.length} Toko
          </span>
          <span className="bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-full">
            {userStores.filter((s) => s.isActive).length} Aktif
          </span>
        </div>
      </div>

      <StoreSelector initialStores={userStores as any[]} />
    </div>
  );
}
