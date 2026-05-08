"use client";

import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { filterByCategoryAndQuery, getCategoryFilterButtonClass } from "@/lib/search-filters";
import type { CategoryOption } from "@/types/posts";

type SearchableListSectionConfig<TItem, TCategory extends string> = {
  key: string;
  items: TItem[];
  emptyLabel: string;
  sectionClassName?: string;
  heading?: ReactNode;
  listClassName?: string;
  categoryMatches: (item: TItem, selectedCategory: "all" | TCategory) => boolean;
  queryFields: (item: TItem) => Array<string | undefined>;
  renderItem: (item: TItem) => ReactNode;
};

type SearchableListSection<TCategory extends string> = {
  key: string;
  emptyLabel: string;
  sectionClassName?: string;
  heading?: ReactNode;
  listClassName?: string;
  renderFilteredItems: (selectedCategory: "all" | TCategory, normalizedQuery: string) => ReactNode[];
};

export function createSearchableListSection<TItem, TCategory extends string>({
  key,
  items,
  emptyLabel,
  sectionClassName,
  heading,
  listClassName,
  categoryMatches,
  queryFields,
  renderItem,
}: SearchableListSectionConfig<TItem, TCategory>): SearchableListSection<TCategory> {
  return {
    key,
    emptyLabel,
    sectionClassName,
    heading,
    listClassName,
    renderFilteredItems: (selectedCategory, normalizedQuery) =>
      filterByCategoryAndQuery({
        items,
        selectedCategory,
        normalizedQuery,
        categoryMatches,
        queryFields,
      }).map(renderItem),
  };
}

type SearchableListProps<TCategory extends string> = {
  rootClassName: string;
  searchPlaceholder: string;
  categoryOptions: CategoryOption<TCategory>[];
  sections: SearchableListSection<TCategory>[];
};

export default function SearchableList<TCategory extends string>({
  rootClassName,
  searchPlaceholder,
  categoryOptions,
  sections,
}: SearchableListProps<TCategory>) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | TCategory>("all");
  const normalizedQuery = query.trim();

  const filteredSections = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      filteredItems: section.renderFilteredItems(selectedCategory, normalizedQuery),
    }));
  }, [normalizedQuery, sections, selectedCategory]);

  return (
    <div className={rootClassName}>
      <SearchBar value={query} onChange={setQuery} placeholder={searchPlaceholder} />

      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((option) => {
          const active = selectedCategory === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              onClick={() => setSelectedCategory(option.value)}
              className={getCategoryFilterButtonClass(active)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      {filteredSections.map((section) => {
        const content =
          section.filteredItems.length === 0 ? (
            <p className="text-text-muted dark:text-text-subtle">{section.emptyLabel}</p>
          ) : section.listClassName ? (
            <div className={section.listClassName}>{section.filteredItems}</div>
          ) : (
            section.filteredItems
          );

        if (!section.sectionClassName) {
          return <Fragment key={section.key}>{content}</Fragment>;
        }

        return (
          <div key={section.key} className={section.sectionClassName}>
            {section.heading}
            {content}
          </div>
        );
      })}
    </div>
  );
}
