import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  price: z.coerce.number().positive(),
  category: z.string().min(1),
  imageUrl: z.string().url().or(z.literal("")),
  badge: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input tidak valid", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Pastikan produk yang ingin diupdate ada dan belongs to a store owned by user
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const storeDb = await db.query.stores.findFirst({
      where: and(eq(stores.id, existingProduct.storeId), eq(stores.userId, user.id))
    });

    if (!storeDb) {
         return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await db
      .update(products)
      .set({
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price.toString(),
        category: parsed.data.category,
        imageUrl: parsed.data.imageUrl || null,
        badge: parsed.data.badge || null,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    return NextResponse.json({ success: "Produk berhasil diupdate" });
  } catch (error) {
    console.error("[PUT /api/seller/products/[id]]", error);
    return NextResponse.json({ error: "Gagal mengupdate produk" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const storeDb = await db.query.stores.findFirst({
      where: and(eq(stores.id, existingProduct.storeId), eq(stores.userId, user.id))
    });

    if (!storeDb) {
         return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/seller/products/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
