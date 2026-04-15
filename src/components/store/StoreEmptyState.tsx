import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchX, ShoppingBag } from "lucide-react";

interface StoreEmptyStateProps {
  noProducts: boolean;
  onReset: () => void;
}

export function StoreEmptyState({ noProducts, onReset }: StoreEmptyStateProps) {
  if (noProducts) {
    return (
      <Card className="border-dashed border-2 bg-muted/10 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Belum ada produk</h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">
            Penjual belum menambahkan produk. Cek lagi nanti ya!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 bg-muted/10 shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">Produk tidak ditemukan</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
          Coba kata kunci lain atau pilih kategori berbeda
        </p>
        <Button
          onClick={onReset}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md px-8"
        >
          Reset Filter
        </Button>
      </CardContent>
    </Card>
  );
}
