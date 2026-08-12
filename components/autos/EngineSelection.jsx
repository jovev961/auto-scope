"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllEnginesForAutoId, getAutoById } from "@/lib/autos";
import BrandLogo from "@/components/brand/BrandLogo";
import useBrand from "@/components/brand/useBrand";
import styles from "./EngineSelection.module.css";

export default function EngineSelection({ autoId }) {
  const [retryKey, setRetryKey] = useState(0);
  const [requestState, setRequestState] = useState({
    key: null,
    auto: null,
    engines: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const requestKey = `${autoId}|${retryKey}`;

    Promise.all([
      getAutoById(autoId),
      getAllEnginesForAutoId({ autoId, page: 0, size: 100, sort: "id,asc" }),
    ])
      .then(([auto, engineResponse]) => {
        if (!cancelled) {
          setRequestState({
            key: requestKey,
            auto,
            engines: engineResponse.content ?? [],
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setRequestState({ key: requestKey, auto: null, engines: [], error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [autoId, retryKey]);

  const currentRequestKey = `${autoId}|${retryKey}`;
  const isLoading = requestState.key !== currentRequestKey;
  const auto = isLoading ? null : requestState.auto;
  const brand = useBrand(auto?.brandId);
  const engines = isLoading ? [] : requestState.engines;
  const error = isLoading ? null : requestState.error;

  if (isLoading) {
    return (
      <section className={styles.statePanel} role="status" aria-live="polite" aria-busy="true">
        <span className={styles.loadingIndicator} aria-hidden="true" />
        <p className={styles.eyebrow}>Engine selection</p>
        <h1>Loading available engines</h1>
        <p>Preparing the available configurations for this automobile.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.statePanel} role="alert">
        <p className={styles.eyebrow}>Unable to load</p>
        <h1>Engine choices are unavailable</h1>
        <p>{error.message || "An unexpected error occurred while loading the engines."}</p>
        <button
          className={styles.retryButton}
          type="button"
          onClick={() => setRetryKey((currentKey) => currentKey + 1)}
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className={styles.selection}>
      <header className={styles.hero}>
        <div className={styles.brandRow}>
          {brand && <BrandLogo brand={brand} variant="hero" />}
          <div>
            <p className={styles.eyebrow}>Choose your configuration</p>
            <h1>{auto?.displayName ?? auto?.name}</h1>
          </div>
        </div>
        <p>
          Select an engine to open the complete automobile profile, photo catalogue,
          editorial details, and specifications for that configuration.
        </p>
      </header>

      {engines.length > 0 ? (
        <div className={styles.engineGrid}>
          {engines.map((engine, index) => (
            <Link
              className={styles.engineCard}
              href={`/autos/${autoId}/engines/${engine.id}`}
              key={engine.id}
            >
              <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>Engine configuration</p>
                <h2>{engine.displayName ?? engine.name}</h2>
              </div>
              <span className={styles.cardArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h2>No engine configurations available</h2>
          <p>This automobile does not have any engine specifications in the catalogue yet.</p>
        </div>
      )}

      <p className={styles.summary}>
        {engines.length} {engines.length === 1 ? "engine configuration" : "engine configurations"}
      </p>
    </section>
  );
}
