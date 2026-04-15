"use client";

import { useState, useMemo, useEffect } from "react";

import { categories } from "@/lib/products";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/store/cart";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { STORE_TOASTS } from "@/lib/toasts/store";
import { CART_TOASTS } from "@/lib/toasts/cart";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreEmptyState } from "@/components/store/StoreEmptyState";
import { StoreFilterBar } from "@/components/store/StoreFilterBar";

interface DBProduct {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string | null;
  badge: string | null;
}

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
    badge: p.badge ?? undefined,
  };
}

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<ReturnType<typeof toCartProduct>[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const { addItem, updateQuantity, removeItem, items, toggleCart } = useCartStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error();
        const data: DBProduct[] = await res.json();
        setAllProducts(data.map(toCartProduct));
      } catch {
        toast.error(STORE_TOASTS.productsLoadFailed);
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

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
    items.find((i) => i.id === productId)?.quantity ?? 0;

  const handleAdd = (product: Product) => {
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

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <StoreHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8">
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
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-muted-foreground">Memuat produk...</p>
          </div>
        ) : filteredProducts.length === 0 && allProducts.length === 0 ? (
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

