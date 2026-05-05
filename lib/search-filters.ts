import { includesQuery } from "@/lib/search";

type CategoryValue = "all" | string;

type FilterOptions<T> = {
  items: T[];
  selectedCategory: CategoryValue;
  normalizedQuery: string;
  categoryMatches: (item: T, selectedCategory: CategoryValue) => boolean;
  queryFields: (item: T) => Array<string | undefined>;
};

export function filterByCategoryAndQuery<T>({
  items,
  selectedCategory,
  normalizedQuery,
  categoryMatches,
  queryFields,
}: FilterOptions<T>): T[] {
  return items.filter((item) => {
    const matchesCategory = categoryMatches(item, selectedCategory);
    const matchesQuery =
      !normalizedQuery ||
      queryFields(item).some((field) => includesQuery(field ?? "", normalizedQuery));

    return matchesCategory && matchesQuery;
  });
}

export function getCategoryFilterButtonClass(active: boolean): string {
  return `rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
    active
      ? "border-[#74cfc6] bg-[#81d8d0] text-text-base shadow-[0_0_18px_rgba(129,216,208,0.4)]"
      : "border-border-base bg-surface-strong text-text-sub hover:bg-surface-muted dark:border-border-sub dark:bg-surface-sub dark:text-text-sub dark:hover:bg-surface-strong"
  }`;
}