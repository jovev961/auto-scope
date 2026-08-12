"use client";

import { useState, useEffect } from "react";
import BrandCard from "./BrandCard"
import { getAllBrands } from "@/lib/brands";
import styles from "./BrandList.module.css";
import { CATALOG_SORT_OPTIONS, DEFAULT_CATALOG_SORT } from "@/lib/catalogSortOptions";

export default function BrandList() {
const [brands, setBrands] = useState([]);

    const [size, setSize] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sort, setSort] = useState(DEFAULT_CATALOG_SORT);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let canceled = false;
        const fetchBrands = async () => {
            try {
                const response = await getAllBrands({
                    name: search || undefined,
                    page,
                    size,
                    sort,
                });
                if(!canceled){
                    setBrands(response.content);
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
    }, [page, size, sort, search]);

    return (
        <section className={styles.list}>
            <div className={styles.heading}>
                <p className={styles.eyebrow}>Manufacturer directory</p>
                <h1>Explore brands</h1>
                <p>Choose a manufacturer to explore its model families, generations, and variants.</p>
            </div>

            <div className={styles.controls}>
                <label className={styles.searchLabel}>
                    <span>Search brands</span>
                    <input
                        className={styles.searchInput}
                        type="text"
                        value={search}
                        placeholder="Search by brand name"
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
                        {CATALOG_SORT_OPTIONS.map((option) => (
                            <option value={option.value} key={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className={styles.grid}>
                {brands.map((brand) => (
                    <BrandCard key={brand.id} brand={brand} />
                ))}
            </div>

            <div className={styles.pagination} aria-label="Brand pages">
                <button
                    className={styles.pageButton}
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        className={styles.pageButton}
                        type="button"
                        key={index}
                        disabled={page === index}
                        onClick={() => setPage(index)}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    className={styles.pageButton}
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                    Next
                </button>
            </div>

            <p className={styles.summary}>
                Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                {" · "}
                {totalElements} brands
            </p>
        </section>
    );
}
