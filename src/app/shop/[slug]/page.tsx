import { db } from "@/lib/db";
import { stores, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import ShopClient from "./ShopClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await db.query.stores.findFirst({
    where: eq(stores.slug, slug),
  });

  if (!store) return { title: "Toko Tidak Ditemukan" };

  return {
    title: `${store.name} | Mau Pesan Online`,
    description: store.description || `Beli menu terbaik dari ${store.name} sekarang!`,
  };
}

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Ambil Data Toko (Hanya yang aktif)
  const storeDb = await db.query.stores.findFirst({
    where: and(eq(stores.slug, slug), eq(stores.isActive, true)),
  });

  if (!storeDb) {
    notFound();
  }

  // 2. Ambil Semua Produk Aktif milik Toko ini
  const storeProducts = await db.query.products.findMany({
    where: and(eq(products.storeId, storeDb.id), eq(products.isActive, true)),
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  return (
    <ShopClient 
      store={storeDb} 
      initialProducts={storeProducts} 
    />
  );
}
