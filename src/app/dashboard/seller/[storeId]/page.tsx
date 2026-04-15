import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import StoreDashboardClient from "@/components/seller/StoreDashboardClient";
import { Loader2 } from "lucide-react";

export default async function SpecificStorePage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const user = await getCurrentUser();
  
  if (!user || user.role !== "seller") {
    redirect("/login");
  }

  // Verifikasi apakah store ini benar-benar milik user
  const storeDb = await db.query.stores.findFirst({
    where: and(eq(stores.id, storeId), eq(stores.userId, user.id)),
  });

  if (!storeDb) {
    redirect("/dashboard/seller");
  }

  const serializedStore = {
    ...storeDb,
    isActive: storeDb.isActive ?? true,
  };

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">Memuat dashboard...</span>
      </div>
    }>
      <StoreDashboardClient initialStore={serializedStore} />
    </Suspense>
  );
}
