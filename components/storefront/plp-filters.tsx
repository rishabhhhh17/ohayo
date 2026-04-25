'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export const CATEGORIES = [
  'Casual Bamboo',
  'Casual Cotton',
  'Corporate Bamboo',
  'Corporate Cotton',
  'Compression Therapy',
  'Diabetic Care',
  'Athletic Care',
  'Foot Alignment',
] as const;

export const GENDERS = [
  { label: 'All', value: '' },
  { label: 'Mens', value: 'mens' },
  { label: 'Womens', value: 'womens' },
  { label: 'Unisex', value: 'unisex' },
  { label: 'Kids', value: 'kids' },
] as const;

export const SIZES = ['S', 'M', 'L', 'XL'] as const;

type PlpFiltersProps = {
  availableColors: string[];
  searchParams: { [key: string]: string | string[] | undefined };
};

function parseMulti(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(',').filter(Boolean);
}

function FiltersPanel({
  availableColors,
  searchParams,
  onChange,
}: PlpFiltersProps & { onChange: (key: string, value: string | string[]) => void }) {
  const selectedCategories = parseMulti(searchParams.category);
  const selectedGender = (searchParams.gender as string) ?? '';
  const selectedSizes = parseMulti(searchParams.size);
  const selectedColors = parseMulti(searchParams.color);
  const priceMin = searchParams.priceMin as string | undefined;
  const priceMax = searchParams.priceMax as string | undefined;

  const toggleMulti = (current: string[], value: string, key: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(key, next.join(','));
  };

  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-medium text-sm text-foreground mb-3">Category</h3>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleMulti(selectedCategories, cat, 'category')}
              className={cn(
                'w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors',
                selectedCategories.includes(cat)
                  ? 'bg-primary/10 text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <h3 className="font-medium text-sm text-foreground mb-3">Gender</h3>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => onChange('gender', g.value)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-colors',
                selectedGender === g.value
                  ? 'bg-primary border-primary text-primary-foreground font-medium'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="font-medium text-sm text-foreground mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleMulti(selectedSizes, size, 'size')}
              className={cn(
                'w-10 h-10 text-sm rounded-md border transition-colors font-medium',
                selectedSizes.includes(size)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-foreground mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => toggleMulti(selectedColors, color, 'color')}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-colors',
                  selectedColors.includes(color)
                    ? 'bg-primary border-primary text-primary-foreground font-medium'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-medium text-sm text-foreground mb-3">Price (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={priceMin ? String(Math.round(Number(priceMin) / 100)) : ''}
            onBlur={(e) => onChange('priceMin', e.target.value ? String(Number(e.target.value) * 100) : '')}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            min={0}
          />
          <span className="text-muted-foreground text-sm shrink-0">to</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={priceMax ? String(Math.round(Number(priceMax) / 100)) : ''}
            onBlur={(e) => onChange('priceMax', e.target.value ? String(Number(e.target.value) * 100) : '')}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}

export function PlpFilters({ availableColors, searchParams }: PlpFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string | string[]) => {
      const params = new URLSearchParams();

      // Carry over existing params
      Object.entries(searchParams).forEach(([k, v]) => {
        if (k !== key && v) {
          if (Array.isArray(v)) {
            params.set(k, v.join(','));
          } else {
            params.set(k, v);
          }
        }
      });

      // Set the new value (skip if empty)
      const strVal = Array.isArray(value) ? value.join(',') : value;
      if (strVal) {
        params.set(key, strVal);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const hasActiveFilters =
    searchParams.category ||
    searchParams.gender ||
    searchParams.size ||
    searchParams.color ||
    searchParams.priceMin ||
    searchParams.priceMax;

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.sort) {
      params.set('sort', searchParams.sort as string);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentSort = (searchParams.sort as string) || 'featured';

  return (
    <>
      {/* Sort bar — always visible */}
      <div className="flex items-center justify-between gap-3 mb-6">
        {/* Mobile: filter sheet trigger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden gap-2"
              aria-label="Open filters"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FiltersPanel
              availableColors={availableColors}
              searchParams={searchParams}
              onChange={(key, val) => {
                updateParam(key, val);
              }}
            />
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="mt-6 w-full gap-1 text-muted-foreground"
              >
                <X size={14} />
                Clear all filters
              </Button>
            )}
          </SheetContent>
        </Sheet>

        {/* Result label — hidden on mobile */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={12} />
            Clear filters
          </button>
        )}

        <div className="flex-1" />

        {/* Sort select */}
        <Select
          value={currentSort}
          onValueChange={(val) => updateParam('sort', val)}
        >
          <SelectTrigger className="w-[160px] h-9 text-sm" aria-label="Sort products">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

export function PlpSidebar({ availableColors, searchParams }: PlpFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateParam = useCallback(
    (key: string, value: string | string[]) => {
      const params = new URLSearchParams();

      Object.entries(searchParams).forEach(([k, v]) => {
        if (k !== key && v) {
          if (Array.isArray(v)) {
            params.set(k, v.join(','));
          } else {
            params.set(k, v);
          }
        }
      });

      const strVal = Array.isArray(value) ? value.join(',') : value;
      if (strVal) {
        params.set(key, strVal);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const hasActiveFilters =
    searchParams.category ||
    searchParams.gender ||
    searchParams.size ||
    searchParams.color ||
    searchParams.priceMin ||
    searchParams.priceMax;

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.sort) {
      params.set('sort', searchParams.sort as string);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <div className="sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-sm text-foreground">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
        <FiltersPanel
          availableColors={availableColors}
          searchParams={searchParams}
          onChange={updateParam}
        />
      </div>
    </aside>
  );
}
