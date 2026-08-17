"use client";

import { getAutoById } from "@/lib/autos";
import { getEngineById } from "@/lib/engines";
import BrandLogo from "@/components/brand/BrandLogo";
import useBrand from "@/components/brand/useBrand";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import styles from "./AutosDetails.module.css";

function ExpandableHtml({ title, html, contentId }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (expanded || !contentRef.current) {
      return;
    }

    const content = contentRef.current;
    const measureOverflow = () => {
      setIsOverflowing(content.scrollHeight > content.clientHeight + 2);
    };
    const animationFrame = requestAnimationFrame(measureOverflow);
    const resizeObserver = new ResizeObserver(measureOverflow);

    resizeObserver.observe(content);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [expanded, html]);

  if (!html) {
    return null;
  }

  return (
    <section className={styles.editorialSection} aria-labelledby={`${contentId}-heading`}>
      <h2 id={`${contentId}-heading`}>{title}</h2>
      <div
        ref={contentRef}
        id={contentId}
        className={`${styles.editorialContent} ${expanded ? styles.expanded : styles.collapsed} ${isOverflowing && !expanded ? styles.hasOverflow : ""}`}
      >
        <div
          className={styles.richText}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {isOverflowing && (
        <button
          className={styles.expandButton}
          type="button"
          aria-controls={contentId}
          aria-expanded={expanded}
          onClick={() => setExpanded((currentValue) => !currentValue)}
        >
          {expanded ? "Show less" : "See more"}
          <span aria-hidden="true">{expanded ? "↑" : "↓"}</span>
        </button>
      )}
    </section>
  );
}

export default function AutosDetails({ autoId, engineId }) {

  const [auto, setAuto] = useState({});
  const [engine, setEngine] = useState(null);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  //*codex
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const thumbnailRailRef = useRef(null);
  const thumbnailRefs = useRef([]);

useEffect(() => {
  let cancelled = false;

  async function fetchAuto() {
    try {
      setIsLoading(true);
      setError(undefined);

      const [autoResponse, engineResponse] = await Promise.all([
        getAutoById(autoId),
        getEngineById(engineId),
      ]);

      if (String(engineResponse.automobileId) !== String(autoId)) {
        throw new Error("The selected engine does not belong to this automobile.");
      }

        if (!cancelled) {
          setActivePhotoIndex(0);
          setAuto(autoResponse);
          setEngine(engineResponse);
        }
        } catch (error) {
          if (!cancelled) {
            setError(error);
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
    }

    fetchAuto();

    return () => {
        cancelled = true;
    };
}, [autoId, engineId, retryKey]);

  const autoPhotos = auto.photos ?? [];
  const brand = useBrand(auto.brandId);
  const engineSpecs = engine?.specs ?? {};

  useEffect(() => {
    const thumbnailRail = thumbnailRailRef.current;
    const activeThumbnail = thumbnailRefs.current[activePhotoIndex];

    if (!thumbnailRail || !activeThumbnail) {
      return;
    }

    thumbnailRail.scrollTo({
      left: activeThumbnail.offsetLeft -
        (thumbnailRail.clientWidth - activeThumbnail.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [activePhotoIndex]);

  const showPreviousPhoto = () => {
    setActivePhotoIndex((currentIndex) =>
      (currentIndex - 1 + autoPhotos.length) % autoPhotos.length
    );
  };

  const showNextPhoto = () => {
    setActivePhotoIndex((currentIndex) =>
      (currentIndex + 1) % autoPhotos.length
    );
  };

  if (isLoading) {
    return (
      <div className={styles.details}>
        <section
          className={styles.statePanel}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className={styles.loadingIndicator} aria-hidden="true" />
          <p className={styles.stateEyebrow}>Selected automobile</p>
          <h1>Loading automobile details</h1>
          <p>Fetching photos, editorial content, and the selected engine specifications.</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.details}>
        <section className={styles.statePanel} role="alert">
          <p className={styles.stateEyebrow}>Unable to load</p>
          <h1>Automobile details are unavailable</h1>
          <p>{error.message || "An unexpected error occurred while loading this automobile."}</p>
          <button
            className={styles.retryButton}
            type="button"
            onClick={() => {
              setError(undefined);
              setIsLoading(true);
              setRetryKey((currentKey) => currentKey + 1);
            }}
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.details}>
      <nav className={styles.detailActions} aria-label="Automobile actions">
        <Link className={styles.backLink} href={`/autos/${autoId}`}>
          ← Choose another engine
        </Link>
        <Link className={styles.compareLink} href={`/compare?brandId=${auto.brandId}&familyKey=${auto.familyKey}&autoId=${auto.id}&engineId=${engine.id}`}>
          Compare
        </Link>
      </nav>
      <div className={styles.brandRow}>
        {brand && <BrandLogo brand={brand} variant="hero" />}
        <div>
          <p className={styles.title}>Selected automobile</p>
          <h1 className={styles.autoName}>{auto.displayName ?? auto.name}</h1>
        </div>
      </div>
      <div className={styles.selectionMeta}>
        <span className={styles.identifier}>Automobile {auto.id}</span>
        <span className={styles.selectedEngineName}>{engine?.displayName ?? engine?.name}</span>
      </div>

      <section className={styles.gallery} aria-label={`${auto.displayName ?? "Automobile"} photo catalogue`}>
        <div className={styles.galleryStage}>
          {autoPhotos.length > 0 ? (
            <Image
              className={styles.galleryImage}
              src={autoPhotos[activePhotoIndex]}
              alt={`${auto.displayName ?? "Automobile"} photo ${activePhotoIndex + 1} of ${autoPhotos.length}`}
              width={1200}
              height={675}
              sizes="(max-width: 1080px) calc(100vw - 40px), 1040px"
            />
          ) : (
            <p className={styles.galleryPlaceholder}>No photos available</p>
          )}

          {autoPhotos.length > 1 && (
            <>
              <button
                className={`${styles.galleryArrow} ${styles.galleryPrevious}`}
                type="button"
                aria-label="Show previous automobile photo"
                onClick={showPreviousPhoto}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                className={`${styles.galleryArrow} ${styles.galleryNext}`}
                type="button"
                aria-label="Show next automobile photo"
                onClick={showNextPhoto}
              >
                <span aria-hidden="true">→</span>
              </button>
              <span className={styles.galleryCounter} aria-live="polite">
                {activePhotoIndex + 1} / {autoPhotos.length}
              </span>
            </>
          )}
        </div>

        {autoPhotos.length > 1 && (
          <div
            className={styles.thumbnails}
            ref={thumbnailRailRef}
            aria-label="Choose an automobile photo"
          >
            {autoPhotos.map((photo, photoIndex) => (
              <button
                className={`${styles.thumbnail} ${activePhotoIndex === photoIndex ? styles.activeThumbnail : ""}`}
                type="button"
                key={`${photo}-${photoIndex}`}
                ref={(node) => {
                  thumbnailRefs.current[photoIndex] = node;
                }}
                aria-label={`Show photo ${photoIndex + 1} of ${autoPhotos.length}`}
                aria-pressed={activePhotoIndex === photoIndex}
                onClick={() => setActivePhotoIndex(photoIndex)}
              >
                <Image
                  src={photo}
                  alt=""
                  width={160}
                  height={90}
                  sizes="112px"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {engine && (
        <section className={styles.engineCard} aria-labelledby="selected-engine-heading">
          <p className={styles.engineEyebrow}>Selected engine</p>
          <h2 className={styles.engineName} id="selected-engine-heading">
            {engine.displayName ?? engine.name}
          </h2>
          <div className={styles.specGrid}>
            <h3 className={styles.specTitle}>Specifications</h3>
            {engineSpecs["Engine Specs"] && (
              <div className={styles.specGroup}>
                <h2>Engine Specs</h2>
                <p>Cylinders: {engineSpecs["Engine Specs"]["Cylinders:"] || "No data"}</p>
                <p>Displacement: {engineSpecs["Engine Specs"]["Displacement:"] || "No data"}</p>
                <p>Power: {engineSpecs["Engine Specs"]["Power:"] || "No data"}</p>
                <p>Torque: {engineSpecs["Engine Specs"]["Torque:"] || "No data"}</p>
                <p>Fuel System: {engineSpecs["Engine Specs"]["Fuel System:"] || "No data"}</p>
                <p>Fuel: {engineSpecs["Engine Specs"]["Fuel:"] || "No data"}</p>
              </div>
            )}
            {engineSpecs["Transmission Specs"] && (
              <div className={styles.specGroup}>
                <h2>Transmission Specs</h2>
                <p>Drive Type: {engineSpecs["Transmission Specs"]["Drive Type:"] || "No data"}</p>
                <p>Gearbox: {engineSpecs["Transmission Specs"]["Gearbox:"] || "No data"}</p>
              </div>
            )}
            {engineSpecs["Brakes Specs"] && (
              <div className={styles.specGroup}>
                <h2>Brakes Specs</h2>
                <p>Front: {engineSpecs["Brakes Specs"]["Front:"] || "No data"}</p>
                <p>Rear: {engineSpecs["Brakes Specs"]["Rear:"] || "No data"}</p>
              </div>
            )}
            {engineSpecs.Dimensions && (
              <div className={styles.specGroup}>
                <h2>Dimensions</h2>
                <p>Length: {engineSpecs.Dimensions["Length:"] || "No data"}</p>
                <p>Width: {engineSpecs.Dimensions["Width:"] || "No data"}</p>
                <p>Height: {engineSpecs.Dimensions["Height:"] || "No data"}</p>
                <p>Front/Rear Track: {engineSpecs.Dimensions["Front/Rear Track:"] || "No data"}</p>
                <p>Wheelbase: {engineSpecs.Dimensions["Wheelbase:"] || "No data"}</p>
                <p>Ground Clearance: {engineSpecs.Dimensions["Ground Clearance:"] || "No data"}</p>
              </div>
            )}
            {engineSpecs["Weight Specs"] && (
              <div className={styles.specGroup}>
                <h2>Weight Specs</h2>
                <p>Unladen Weight: {engineSpecs["Weight Specs"]["Unladen Weight:"] || "No data"}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <div className={styles.editorial}>
        <ExpandableHtml
          key={`${autoId}-description`}
          title="Description"
          html={auto.descriptionHtml}
          contentId="automobile-description"
        />
        <ExpandableHtml
          key={`${autoId}-press-release`}
          title="Press release"
          html={auto.pressReleaseHtml}
          contentId="automobile-press-release"
        />
      </div>

      <p className={styles.timestamp}>Created at: {auto.createdAt}</p>
      <p className={styles.timestamp}>Updated at: {auto.updatedAt}</p>
    </div>
  )
}
