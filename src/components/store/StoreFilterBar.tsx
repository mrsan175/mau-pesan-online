"use client";

import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { categories } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoreFilterBarProps {
  searchQuery: string;
  sortBy: "default" | "price-asc" | "price-desc";
  activeCategory: string;
  showFilters: boolean;
  filteredCount: number;
  onSearchChange: (v: string) => void;
  onSortChange: (v: "default" | "price-asc" | "price-desc") => void;
  onCategoryChange: (v: string) => void;
  onToggleFilters: () => void;
}

export function StoreFilterBar({
  searchQuery,
  sortBy,
  activeCategory,
  showFilters,
  filteredCount,
  onSearchChange,
  onSortChange,
  onCategoryChange,
  onToggleFilters,
}: StoreFilterBarProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </span>
          <Input
            id="store-search-input"
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 bg-card focus-visible:ring-orange-500/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 h-full w-9 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <div className="w-[180px]">
            <Select value={sortBy} onValueChange={(v) => onSortChange(v as any)}>
              <SelectTrigger className="bg-card w-full focus:ring-orange-500/50">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Urutkan" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Terbaru (Default)</SelectItem>
                <SelectItem value="price-asc">Harga: Termurah</SelectItem>
                <SelectItem value="price-desc">Harga: Termahal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={onToggleFilters}
            className={showFilters ? "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white" : "bg-card"}
          >
            <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <Badge
            key={cat}
            id={`category-${cat.toLowerCase()}`}
            onClick={() => onCategoryChange(cat)}
            variant={activeCategory === cat ? "default" : "outline"}
            className={`cursor-pointer px-4 py-1.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
              activeCategory === cat
                ? "bg-linear-to-r from-orange-500 to-red-600 text-white border-transparent shadow-md shadow-orange-500/20"
                : "bg-card hover:border-orange-300/50 hover:bg-orange-500/5 text-muted-foreground"
            }`}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{filteredCount}</span> produk
          {searchQuery && (
            <span>
              {" "}untuk &ldquo;<span className="text-orange-600">{searchQuery}</span>&rdquo;
            </span>
          )}
        </p>
      </div>
    </>
  );
}
