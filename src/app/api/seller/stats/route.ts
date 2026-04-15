import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json({ error: "storeId diperlukan." }, { status: 400 });
  }

  // Verifikasi store ini milik user
  const storeDb = await db.query.stores.findFirst({
     where: and(eq(stores.id, storeId), eq(stores.userId, user.id))
  });

  if (!storeDb) {
    return NextResponse.json({ error: "Toko tidak ditemukan atau bukan milik Anda" }, { status: 403 });
  }

  const allProducts = await db
    .select({ isActive: products.isActive })
    .from(products)
    .where(eq(products.storeId, storeId));

  const total = allProducts.length;
  const active = allProducts.filter((p) => p.isActive).length;
  const inactive = total - active;

  return NextResponse.json({ total, active, inactive });
}
