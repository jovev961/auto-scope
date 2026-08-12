"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getModelFamily } from "@/lib/modelFamilies";
import BrandLogo from "@/components/brand/BrandLogo";
import useBrand from "@/components/brand/useBrand";
import styles from "./ModelFamilyDetails.module.css";

function formatYearRange(startYear, endYear) {
  if (!startYear) return endYear ? String(endYear) : null;
  if (!endYear || startYear === endYear) return String(startYear);
  return `${startYear}–${endYear}`;
}

export default function ModelFamilyDetails({ brandId, familyKey }) {
  const brand = useBrand(brandId);
  const [retryKey, setRetryKey] = useState(0);
  const [requestState, setRequestState] = useState({ key: null, family: null, error: null });

  useEffect(() => {
    let canceled = false;
    const requestKey = `${brandId}|${familyKey}|${retryKey}`;

    getModelFamily(brandId, familyKey)
      .then((response) => {
        if (!canceled) setRequestState({ key: requestKey, family: response, error: null });
      })
      .catch((requestError) => {
        if (!canceled) setRequestState({ key: requestKey, family: null, error: requestError });
      });

    return () => {
      canceled = true;
    };
  }, [brandId, familyKey, retryKey]);

  const currentRequestKey = `${brandId}|${familyKey}|${retryKey}`;
  const isLoading = requestState.key !== currentRequestKey;
  const family = !isLoading ? requestState.family : null;
  const error = !isLoading ? requestState.error : null;

  if (isLoading) {
    return (
      <p className={styles.state} role="status" aria-live="polite" aria-busy="true">
        Loading generations…
      </p>
    );
  }

  if (error) {
    return (
      <div className={`${styles.state} ${styles.error}`} role="alert">
        <p>{error.message}</p>
        <button type="button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button>
      </div>
    );
  }

  if (!family) return null;

  const generations = family.generations ?? [];
  const yearRange = formatYearRange(family.firstYear, family.latestYear);

  return (
    <section className={styles.details}>
      <header className={styles.hero}>
        <Link className={styles.backLink} href={`/brands/${brandId}`}>← Back to model families</Link>
        <div className={styles.brandRow}>
          {brand && <BrandLogo brand={brand} variant="hero" />}
          <div className={styles.brandCopy}>
            <p className={styles.eyebrow}>{family.brandDisplayName} model family</p>
            <div className={styles.titleRow}>
              <h1>{family.brandDisplayName} {family.name}</h1>
              {family.current && <span className={styles.currentBadge}>Current family</span>}
            </div>
          </div>
        </div>
        <p>
          {family.generationCount} {family.generationCount === 1 ? "generation" : "generations"}
          <span aria-hidden="true"> · </span>
          {family.automobileCount} {family.automobileCount === 1 ? "variant" : "variants"}
          {yearRange && <><span aria-hidden="true"> · </span>{yearRange}</>}
        </p>
      </header>

      {generations.length === 0 ? (
        <p className={styles.state}>No generations are available for this model family.</p>
      ) : (
        <div className={styles.generations}>
          {generations.map((generation) => (
            <section className={styles.generation} key={generation.key}>
              <div className={styles.generationHeading}>
                <p>Generation</p>
                <div className={styles.generationTitle}>
                  <h2>{generation.label}</h2>
                  {generation.current && <span className={styles.currentBadge}>Current</span>}
                </div>
                <span>{generation.variants?.length ?? 0} {generation.variants?.length === 1 ? "variant" : "variants"}</span>
              </div>

              {generation.variants?.length ? (
                <div className={styles.variantGrid}>
                  {generation.variants.map((variant) => {
                    const variantYears = formatYearRange(variant.startYear, variant.endYear);

                    return (
                      <article className={styles.variantCard} key={variant.id}>
                        <div className={styles.imageFrame}>
                          {variant.coverPhoto ? (
                            <Image
                              className={styles.image}
                              src={variant.coverPhoto}
                              alt={variant.variantName}
                              width={640}
                              height={400}
                              sizes="(max-width: 580px) calc(100vw - 28px), (max-width: 920px) 50vw, 33vw"
                            />
                          ) : (
                            <div className={styles.placeholder}>No image available</div>
                          )}
                        </div>
                        <div className={styles.variantContent}>
                          <p>Automobile variant</p>
                          <h3>{variant.variantName}</h3>
                          {variantYears && <span className={styles.variantYears}>{variantYears}</span>}
                          <Link href={`/autos/${variant.id}`}>
                            View specifications <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.emptyGeneration}>No variants are available for this generation.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
