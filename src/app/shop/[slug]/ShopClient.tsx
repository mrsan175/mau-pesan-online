"use client";

import { useState, useMemo } from "react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/store/cart";
import { toast } from "sonner";
import { CART_TOASTS } from "@/lib/toasts/cart";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreFilterBar } from "@/components/store/StoreFilterBar";
import { StoreEmptyState } from "@/components/store/StoreEmptyState";
import { Store, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Interfaces
interface DBStore {
  id: string;
  name: string;
  description: string | null;
  whatsapp: string;
  slug: string;
}

interface DBProduct {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string | null;
  badge: unknown;
}

/** Mapping DBProduct -> Interface Keranjang */
function toCartProduct(p: DBProduct): Product & { rating: number; reviews: number; badge?: string } {
  return {
    id: p.id,
    storeId: p.storeId,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    category: p.category,
    image: p.imageUrl ?? `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80`,
    rating: 0,
    reviews: 0,
    badge: undefined,
  };
}

export default function ShopClient({
  store,
  initialProducts,
}: {
  store: DBStore;
  initialProducts: DBProduct[];
}) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [showFilters, setShowFilters] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const allProducts = useMemo(() => initialProducts.map(toCartProduct), [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (activeCategory !== "Semua") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [activeCategory, searchQuery, sortBy, allProducts]);

  const getCartQuantity = (productId: string) =>
    cartItems.find((i) => i.id === productId)?.quantity ?? 0;

  const handleAdd = (product: Product) => {
    // Note: logika limitasi keranjang hanya untuk 1 store sudah ditanam di addItem zustand store/cart.ts
    addItem(product);
    toast.success(CART_TOASTS.itemAdded(product.name));
  };

  const handleIncrease = (productId: string) => {
    const qty = getCartQuantity(productId);
    updateQuantity(productId, qty + 1);
  };

  const handleDecrease = (productId: string) => {
    const qty = getCartQuantity(productId);
    if (qty <= 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, qty - 1);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Tautan Toko Disalin!");
    }
  };

  return (
    <main className="min-h-screen bg-background pt-16 pb-16">

      {/* ── HEADER TOKO SPESIFIK ── */}
      <section className="relative overflow-hidden bg-linear-to-b from-orange-50 to-white pt-12 pb-8 border-b">
        <div className="absolute inset-0 bg-grid-zinc-100/[0.2] bg-size-[20px_20px]" />
        <div className="container relative z-10 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 bg-white shadow-xl border rounded-[2rem] flex items-center justify-center shrink-0">
              <span className="text-4xl font-extrabold text-orange-500">{store.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">
                {store.name}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4" /> Buka • Melayani Pengiriman & COD
              </p>
              {store.description && (
                <p className="text-zinc-600 mt-2 text-sm line-clamp-2 max-w-lg leading-relaxed">
                  {store.description}
                </p>
              )}
            </div>
          </div>

          <Button onClick={handleShare} variant="outline" className="rounded-xl shadow-sm gap-2 font-bold bg-white w-full sm:w-auto h-11">
            <Share2 className="h-4 w-4" /> Bagikan
          </Button>
        </div>
      </section>

      {/* ── DAFTAR PRODUK ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Store className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-bold">Katalog Produk</h2>
        </div>

        <StoreFilterBar
          searchQuery={searchQuery}
          sortBy={sortBy}
          activeCategory={activeCategory}
          showFilters={showFilters}
          filteredCount={filteredProducts.length}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onCategoryChange={setActiveCategory}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Product grid */}
        {filteredProducts.length === 0 && allProducts.length === 0 ? (
          <StoreEmptyState noProducts onReset={() => { setSearchQuery(""); setActiveCategory("Semua"); }} />
        ) : filteredProducts.length === 0 ? (
          <StoreEmptyState noProducts={false} onReset={() => { setSearchQuery(""); setActiveCategory("Semua"); }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const qty = getCartQuantity(product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={qty}
                  onAdd={() => handleAdd(product)}
                  onIncrease={() => handleIncrease(product.id)}
                  onDecrease={() => handleDecrease(product.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
