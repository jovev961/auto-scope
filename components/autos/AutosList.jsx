"use client";

import { getAllAutos } from "@/lib/autos";
import AutosCard from "./AutosCard";
import { useState, useEffect } from "react";
import styles from "./AutosList.module.css";
import { CATALOG_SORT_OPTIONS, DEFAULT_CATALOG_SORT } from "@/lib/catalogSortOptions";

export default function AutosList({brandId}) {

    const [autos, setAutos] = useState([]);

    const [size, setSize] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sort, setSort] = useState(DEFAULT_CATALOG_SORT);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const visibleButtonCount = 10;
    const half = Math.floor(visibleButtonCount / 2);

    const maxStartPage = Math.max(
        0,
        totalPages - visibleButtonCount
    );

    const firstVisiblePage = Math.min(
        Math.max(0, page - half),
        maxStartPage
    );

    const visiblePages = Array.from(
        {
            length: Math.min(visibleButtonCount, totalPages),
        },
        (_, index) => firstVisiblePage + index
    );

    useEffect(() => {
        let canceled = false;

        const fetchBrands = async () => {
            try {
                const response = await getAllAutos({
                    name: search || undefined,
                    brandId: brandId,
                    page,
                    size,
                    sort,
                });
                
                if(!canceled){
                    setAutos(response.content);
                    setTotalElements(response.totalElements);
                    setTotalPages(response.totalPages);
                }
            } catch (error) {
                if(!canceled){
                    console.error(error);
                }
            }
        };
    
        fetchBrands();

        return () => {
            canceled = true;
        }

    }, [page, size, sort, search, brandId]);

    return (
        <section className={styles.list}>
            <div className={styles.heading}>
                <p className={styles.eyebrow}>Automobile directory</p>
                <h1>Explore autos</h1>
                <p>Search the catalogue and open a model to explore its details and engine specifications.</p>
            </div>

            <div className={styles.controls}>
                <label className={styles.searchLabel}>
                    <span>Search autos</span>
                    <input
                        className={styles.searchInput}
                        type="text"
                        suppressHydrationWarning
                        value={search}
                        placeholder="Search by automobile name"
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
                        suppressHydrationWarning
                        value={sort}
                        onChange={(event) => {
                            setSort(event.target.value);
                            setPage(0);
                        }}
                    >
                        {CATALOG_SORT_OPTIONS.map((option) => (
                            <option value={option.value} key={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className={styles.grid}>
                {autos.map((auto) => (
                    <AutosCard key={auto.id} auto={auto} />
                ))}
            </div>

            <div className={styles.pagination} aria-label="Automobile pages">
                <button
                    className={styles.pageButton}
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((current) => current - 1)}
                >
                    Previous
                </button>

                {visiblePages.map((pageIndex) => (
                    <button
                        className={styles.pageButton}
                        type="button"
                        key={pageIndex}
                        disabled={page === pageIndex}
                        onClick={() => setPage(pageIndex)}
                    >
                        {pageIndex + 1}
                    </button>
                ))}

                <button
                    className={styles.pageButton}
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((current) => current + 1)}
                >
                    Next
                </button>
            </div>

            <p className={styles.summary}>
                Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                {" · "}
                {totalElements} autos
            </p>
        </section>
    )
}
