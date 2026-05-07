"use client";

import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import SearchBar from "./SearchBar";
import { filterByCategoryAndQuery, getCategoryFilterButtonClass } from "@/lib/search-filters";
import type { CategoryOption } from "@/types/posts";

type ItemCallback<TItem, TResult> = {
  bivarianceHack(item: TItem): TResult;
}["bivarianceHack"];

type CategoryMatchCallback<TItem, TCategory extends string> = {
  bivarianceHack(item: TItem, selectedCategory: "all" | TCategory): boolean;
}["bivarianceHack"];

type SearchableListSection<TItem, TCategory extends string> = {
  key: string;
  items: TItem[];
  emptyLabel: string;
  sectionClassName?: string;
  heading?: ReactNode;
  listClassName?: string;
  categoryMatches: CategoryMatchCallback<TItem, TCategory>;
  queryFields: ItemCallback<TItem, Array<string | undefined>>;
  renderItem: ItemCallback<TItem, ReactNode>;
};

type SearchableListProps<TCategory extends string, TSection extends SearchableListSection<unknown, TCategory>> = {
  rootClassName: string;
  searchPlaceholder: string;
  categoryOptions: CategoryOption<TCategory>[];
  sections: TSection[];
};

export default function SearchableList<
  TCategory extends string,
  TSection extends SearchableListSection<unknown, TCategory>,
>({
  rootClassName,
  searchPlaceholder,
  categoryOptions,
  sections,
}: SearchableListProps<TCategory, TSection>) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | TCategory>("all");
  const normalizedQuery = query.trim();

  const filteredSections = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      filteredItems: filterByCategoryAndQuery({
        items: section.items,
        selectedCategory,
        normalizedQuery,
        categoryMatches: (item, currentCategory) =>
          section.categoryMatches(item, currentCategory as "all" | TCategory),
        queryFields: section.queryFields,
      }),
    }));
  }, [normalizedQuery, sections, selectedCategory]);

  return (
    <div className={rootClassName}>
      <SearchBar value={query} onChange={setQuery} placeholder={searchPlaceholder} />

      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((option) => {
          const active = selectedCategory === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedCategory(option.value)}
              className={getCategoryFilterButtonClass(active)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filteredSections.map((section) => {
        const content =
          section.filteredItems.length === 0 ? (
            <p className="text-text-muted dark:text-text-subtle">{section.emptyLabel}</p>
          ) : section.listClassName ? (
            <div className={section.listClassName}>
              {section.filteredItems.map((item) => section.renderItem(item))}
            </div>
          ) : (
            section.filteredItems.map((item) => section.renderItem(item))
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
