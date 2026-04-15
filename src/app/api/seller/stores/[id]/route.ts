import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateStoreSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  whatsapp: z.string().min(8),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountOwner: z.string().optional().nullable(),
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
    const parsed = updateStoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input tidak valid", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Pastikan store ada dan punya user tersebut
    const existingStore = await db.query.stores.findFirst({
      where: and(eq(stores.id, id), eq(stores.userId, user.id)),
    });

    if (!existingStore) {
      return NextResponse.json({ error: "Toko tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    await db
      .update(stores)
      .set({
        name: parsed.data.name,
        description: parsed.data.description,
        whatsapp: parsed.data.whatsapp,
        bankName: parsed.data.bankName,
        bankAccountNumber: parsed.data.bankAccountNumber,
        bankAccountOwner: parsed.data.bankAccountOwner,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, id));

    return NextResponse.json({ success: "Info toko berhasil diupdate" });
  } catch (error) {
    console.error("[PUT /api/seller/stores/[id]]", error);
    return NextResponse.json({ error: "Gagal mengupdate toko" }, { status: 500 });
  }
}
