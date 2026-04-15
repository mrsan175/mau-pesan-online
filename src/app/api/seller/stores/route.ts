import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const storeSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9\-]+$/),
  description: z.string().optional().nullable(),
  whatsapp: z.string().min(8),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountOwner: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userStores = await db.query.stores.findMany({
      where: eq(stores.userId, user.id),
      orderBy: (stores, { desc }) => [desc(stores.createdAt)],
    });
    return NextResponse.json(userStores);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat daftar toko." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = storeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input tidak valid", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Cek slug unik
    const existingSlug = await db.query.stores.findFirst({
       where: eq(stores.slug, parsed.data.slug)
    });

    if (existingSlug) {
       return NextResponse.json({ error: "Slug URL toko sudah dipakai." }, { status: 400 });
    }

    const [newStore] = await db.insert(stores).values({
      userId: user.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      whatsapp: parsed.data.whatsapp,
      bankName: parsed.data.bankName,
      bankAccountNumber: parsed.data.bankAccountNumber,
      bankAccountOwner: parsed.data.bankAccountOwner,
      isActive: parsed.data.isActive,
    }).returning();

    return NextResponse.json(newStore, { status: 201 });
  } catch (error) {
    console.error("[POST /api/seller/stores]", error);
    return NextResponse.json({ error: "Gagal membuat toko baru." }, { status: 500 });
  }
}
