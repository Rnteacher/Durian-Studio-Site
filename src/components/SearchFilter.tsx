"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useServices } from "@/hooks/useServices";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

const SearchFilter = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  onClearFilters,
}: SearchFilterProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { data: services = [] } = useServices();

  // Derive categories from services
  const categoryMap = new Map<string, { title: string; id: string }[]>();
  services.forEach((s) => {
    const cat = s.category || "ללא קטגוריה";
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push({ title: s.title, id: s.id });
  });

  const categoryNames = [...categoryMap.keys()];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חפשו שירות, תחום או שם חניך/ה..."
            className="pr-10 h-12 text-base bg-card border-border rounded-xl"
          />
        </div>

        {/* Main Categories */}
        {categoryNames.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setExpandedCategory(expandedCategory === cat ? null : cat)
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  expandedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-tag text-foreground hover:bg-primary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Sub Tags (services in category) */}
        {expandedCategory && categoryMap.has(expandedCategory) && (
          <div className="flex flex-wrap justify-center gap-2 mb-4 animate-fade-in">
            {categoryMap.get(expandedCategory)!.map((svc) => (
              <button
                key={svc.id}
                onClick={() => onTagToggle(svc.title)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTags.includes(svc.title)
                    ? "bg-heading text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {svc.title}
              </button>
            ))}
          </div>
        )}

        {/* Active Filters */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">סינון פעיל:</span>
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="cursor-pointer gap-1"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <button
              onClick={onClearFilters}
              className="text-xs text-primary hover:underline mr-2"
            >
              נקה הכל
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchFilter;
