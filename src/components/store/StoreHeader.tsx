import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

const EMOJIS = ["🍜", "🍗", "☕", "🍰", "🥤", "🍡"] as const;
const POSITIONS = [
  { top: "15%", left: "5%" },
  { top: "55%", left: "15%" },
  { top: "10%", left: "85%" },
  { top: "70%", left: "90%" },
  { top: "80%", left: "40%" },
  { top: "20%", left: "50%" },
];

export function StoreHeader() {
  return (
    <Card className="bg-linear-to-r from-orange-500 via-red-500 to-pink-600 py-12 px-4 sm:px-6 relative overflow-hidden border-0 rounded-3xl shadow-lg mb-8">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        {EMOJIS.map((e, i) => (
          <span
            key={i}
            className="absolute text-5xl transform -rotate-12"
            style={{ ...POSITIONS[i] }}
          >
            {e}
          </span>
        ))}
      </div>
      <div className="mx-auto max-w-6xl relative z-10 text-center flex flex-col items-center justify-center">
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md mb-4 shadow-lg ring-1 ring-white/30">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
          Pusat Belanja
        </h1>
        <p className="text-white/90 text-sm sm:text-base max-w-lg mx-auto font-medium">
          Temukan produk unggulan dan pesan langsung dengan cepat. Pelayanan eksklusif khusus untuk Anda.
        </p>
      </div>
    </Card>
  );
}
