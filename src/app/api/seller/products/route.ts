import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createProductSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().min(3),
  description: z.string(),
  price: z.coerce.number().positive(),
  category: z.string().min(1),
  imageUrl: z.string().url().or(z.literal("")),
  badge: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json({ error: "storeId diperlukan" }, { status: 400 });
  }

  // Verify ownership
  const storeDb = await db.query.stores.findFirst({
    where: and(eq(stores.id, storeId), eq(stores.userId, user.id))
  });

  if (!storeDb) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const rows = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(products.createdAt);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Input tidak valid", details: parsed.error.format() }, { status: 400 });
    }

    // Verify store ownership
    const storeDb = await db.query.stores.findFirst({
      where: and(eq(stores.id, parsed.data.storeId), eq(stores.userId, user.id))
    });

    if (!storeDb) {
      return NextResponse.json({ error: "Akses ditolak ke toko ini" }, { status: 403 });
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        storeId: parsed.data.storeId,
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price.toString(),
        category: parsed.data.category,
        imageUrl: parsed.data.imageUrl || null,
        badge: parsed.data.badge || null,
        isActive: parsed.data.isActive,
      })
      .returning();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("[POST /api/seller/products]", error);
    return NextResponse.json({ error: "Gagal menyimpan produk" }, { status: 500 });
  }
}
