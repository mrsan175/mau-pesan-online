"use client";

import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getTotalPrice, clearCart } =
    useCartStore();

  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-[420px] p-0 flex flex-col border-l border-border/40 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="px-5 py-4 border-b border-border/40 bg-linear-to-r from-orange-500/5 to-red-500/5 text-left flex flex-row items-center justify-between space-y-0 relative">
          <div className="flex items-center gap-3 space-y-0">
            <div className="h-9 w-9 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col space-y-0">
              <SheetTitle className="text-base font-bold">Keranjang Belanja</SheetTitle>
              <p className="text-xs text-muted-foreground m-0">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="h-24 w-24 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                <ShoppingBag className="h-12 w-12 text-orange-200" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg text-foreground">Keranjang kosong</p>
                <p className="text-sm text-muted-foreground">
                  Belum ada produk di keranjang. Yuk, mulai pilih produk favorit!
                </p>
              </div>
              <Button
                onClick={() => setCartOpen(false)}
                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md px-8"
              >
                Mulai Belanja
              </Button>
            </div>
          ) : (
            <ul className="p-4 flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-orange-300 shadow-sm transition-all group"
                >
                  {/* Item image */}
                  <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 border border-border/40">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                    <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.category}</p>
                    <p className="text-sm font-bold text-orange-600 mt-1.5">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-md"
                      title="Hapus item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/50">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded-md hover:text-orange-600 hover:bg-white text-muted-foreground shadow-none"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded-md hover:text-orange-600 hover:bg-white text-muted-foreground shadow-none"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="border-t border-border/40 p-5 bg-linear-to-b from-transparent to-muted/30 sm:flex-col items-stretch space-y-0">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Ongkos Kirim</span>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">Diinfokan penjual</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/40 mb-5">
              <span className="font-bold text-foreground">Total Keseluruhan</span>
              <span className="font-extrabold text-xl text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600">{formatPrice(totalPrice)}</span>
            </div>

            {/* Checkout button */}
            <Button
              asChild
              size="lg"
              onClick={() => setCartOpen(false)}
              className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/25 border-0"
            >
              <Link href="/cart" className="flex items-center justify-center gap-2">
                <span className="font-bold">Isi Form Pesanan</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-3 font-medium">
              Pesanan Anda akan dikirim ke WhatsApp penjual 💬
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="mt-1 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs h-9 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Kosongkan Keranjang
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
