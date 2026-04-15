import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface SellerInfo {
  storeName: string | null;
  sellerWhatsapp: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountOwner: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
       return NextResponse.json({ error: "storeId parameter dibutuhkan." }, { status: 400 });
    }

    const storeDb = await db.query.stores.findFirst({
       where: eq(stores.id, storeId)
    });

    if (!storeDb) {
      return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
       storeName: storeDb.name,
       sellerWhatsapp: storeDb.whatsapp,
       bankName: storeDb.bankName,
       bankAccountNumber: storeDb.bankAccountNumber,
       bankAccountOwner: storeDb.bankAccountOwner,
    });
  } catch (error) {
    console.error("[GET /api/seller]", error);
    return NextResponse.json({ error: "Gagal memuat info toko." }, { status: 500 });
  }
}
