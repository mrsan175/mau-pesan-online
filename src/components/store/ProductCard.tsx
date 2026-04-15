import { Star, ShoppingCart, Plus, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/store/cart";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface StoreProduct extends Product {
  rating: number;
  reviews: number;
  badge?: string;
}

interface ProductCardProps {
  product: StoreProduct;
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function ProductCard({ product, quantity, onAdd, onIncrease, onDecrease }: ProductCardProps) {
  const inCart = quantity > 0;

  return (
    <Card className="group overflow-hidden hover:border-orange-300/50 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full bg-card">
      <div className="relative h-44 overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-linear-to-r from-orange-500 to-red-600 text-white font-bold px-2 py-0.5 shadow-lg border-0 hover:from-orange-600 hover:to-red-700">
              {product.badge}
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-black/60 hover:bg-black/70 backdrop-blur-md text-white border-0 font-medium rounded-full">
            {product.category}
          </Badge>
        </div>
        {inCart && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 shadow-md border-0">
              {quantity} di keranjang
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
          {product.description}
        </p>

        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews} ulasan)</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-border/10 mt-auto bg-card rounded-b-xl">
        <p className="text-base font-extrabold text-orange-600 leading-none pt-3">
          {formatPrice(product.price)}
        </p>

        <div className="pt-3">
          {inCart ? (
            <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl border border-border/50">
              <Button
                variant="ghost"
                size="icon"
                onClick={onDecrease}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-orange-600 hover:bg-orange-500/10 active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-5 text-center text-sm font-extrabold text-foreground tabular-nums">
                {quantity}
              </span>
              <Button
                variant="default"
                size="icon"
                onClick={onIncrease}
                className="h-7 w-7 rounded-lg bg-linear-to-br from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 active:scale-90 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onAdd}
              size="sm"
              className="gap-1.5 rounded-lg text-xs font-bold bg-linear-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-red-700 hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Tambah
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
