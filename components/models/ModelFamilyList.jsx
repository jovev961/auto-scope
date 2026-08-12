"use client";

import { useEffect, useState } from "react";
import { getModelFamilies } from "@/lib/modelFamilies";
import ModelFamilyCard from "./ModelFamilyCard";
import BrandLogo from "@/components/brand/BrandLogo";
import useBrand from "@/components/brand/useBrand";
import styles from "./ModelFamilyList.module.css";

const SORT_OPTIONS = [
  { value: "name,asc", label: "Name A–Z" },
  { value: "name,desc", label: "Name Z–A" },
  { value: "firstYear,desc", label: "Newest first" },
  { value: "firstYear,asc", label: "Oldest first" },
  { value: "automobileCount,desc", label: "Most variants" },
];

export default function ModelFamilyList({ brandId }) {
  const brand = useBrand(brandId);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("name,asc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [requestState, setRequestState] = useState({ key: null, response: null, error: null });

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let canceled = false;
    const requestKey = `${brandId ?? "all"}|${debouncedSearch}|${page}|${sort}|${retryKey}`;

    getModelFamilies({
      brandId,
      name: debouncedSearch || undefined,
      page,
      size: 20,
      sort,
    })
      .then((response) => {
        if (!canceled) setRequestState({ key: requestKey, response, error: null });
      })
      .catch((requestError) => {
        if (!canceled) setRequestState({ key: requestKey, response: null, error: requestError });
      });

    return () => {
      canceled = true;
    };
  }, [brandId, debouncedSearch, page, retryKey, sort]);

  const currentRequestKey = `${brandId ?? "all"}|${debouncedSearch}|${page}|${sort}|${retryKey}`;
  const isLoading = requestState.key !== currentRequestKey;
  const response = !isLoading ? requestState.response : null;
  const error = !isLoading ? requestState.error : null;
  const families = response?.content ?? [];
  const totalElements = response?.totalElements ?? 0;
  const totalPages = response?.totalPages ?? 0;

  const visibleButtonCount = 10;
  const firstVisiblePage = Math.min(
    Math.max(0, page - Math.floor(visibleButtonCount / 2)),
    Math.max(0, totalPages - visibleButtonCount),
  );
  const visiblePages = Array.from(
    { length: Math.min(visibleButtonCount, totalPages) },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <section className={styles.list}>
      <div className={styles.heading}>
        <div className={styles.headingRow}>
          {brand && <BrandLogo brand={brand} variant="hero" />}
          <div>
            <p className={styles.eyebrow}>{brandId ? "Brand catalogue" : "Family directory"}</p>
            <h1>{brandId ? "Explore model families" : "Explore all model families"}</h1>
          </div>
        </div>
        <p>
          Browse one card per model family, then open it to compare its generations, years, and body variants.
        </p>
      </div>

      <div className={styles.controls}>
        <label className={styles.searchLabel}>
          <span>Search model families</span>
          <input
            className={styles.searchInput}
            type="search"
            value={search}
            placeholder={brandId ? "Search this brand, for example A3" : "Search all brands and families"}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </label>

        <label className={styles.sortLabel}>
          <span>Sort by</span>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(0);
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && (
        <p className={styles.state} role="status" aria-live="polite" aria-busy="true">
          Loading model families…
        </p>
      )}
      {error && (
        <div className={`${styles.state} ${styles.error}`} role="alert">
          <p>{error.message}</p>
          <button type="button" onClick={() => setRetryKey((current) => current + 1)}>
            Try again
          </button>
        </div>
      )}
      {!isLoading && !error && families.length === 0 && (
        <p className={styles.state}>No model families match your search.</p>
      )}

      {!isLoading && !error && families.length > 0 && (
        <div className={styles.grid}>
          {families.map((family) => (
            <ModelFamilyCard key={`${family.brandId}-${family.familyKey}`} family={family} showBrand={!brandId} />
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Model family pages">
          <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button>
          {visiblePages.map((pageIndex) => (
            <button type="button" key={pageIndex} disabled={page === pageIndex} onClick={() => setPage(pageIndex)}>
              {pageIndex + 1}
            </button>
          ))}
          <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>Next</button>
        </nav>
      )}

      {!isLoading && !error && (
        <p className={styles.summary}>
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages} · {totalElements} model families
        </p>
      )}
    </section>
  );
}
