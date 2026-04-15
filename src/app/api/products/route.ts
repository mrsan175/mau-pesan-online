import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/products
 * Public — fetch all active products from active stores
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: products.id,
        storeId: products.storeId,
        name: products.name,
        description: products.description,
        price: products.price,
        category: products.category,
        imageUrl: products.imageUrl,
        badge: products.badge,
        createdAt: products.createdAt,
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .where(
        and(
          eq(products.isActive, true),
          eq(stores.isActive, true)
        )
      )
      .orderBy(products.createdAt);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Gagal memuat produk." }, { status: 500 });
  }
}
