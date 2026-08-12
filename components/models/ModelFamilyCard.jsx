import Image from "next/image";
import Link from "next/link";
import styles from "./ModelFamilyCard.module.css";

export default function ModelFamilyCard({ family, showBrand }) {
  const yearRange = family.firstYear
    ? family.latestYear && family.latestYear !== family.firstYear
      ? `${family.firstYear}–${family.latestYear}`
      : String(family.firstYear)
    : "Years unavailable";

  return (
    <article className={styles.card}>
      <div className={styles.imageFrame}>
        {family.coverPhoto ? (
          <Image
            className={styles.image}
            src={family.coverPhoto}
            alt={`${family.brandDisplayName} ${family.name}`}
            width={640}
            height={400}
            sizes="(max-width: 580px) calc(100vw - 28px), (max-width: 920px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <span>{family.name}</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {showBrand && <p className={styles.brand}>{family.brandDisplayName}</p>}
        <div className={styles.titleRow}>
          <h2>{family.name}</h2>
          {family.current && <span className={styles.currentBadge}>Current</span>}
        </div>
        <p className={styles.meta}>
          {yearRange}
          <span aria-hidden="true"> · </span>
          {family.generationCount} {family.generationCount === 1 ? "generation" : "generations"}
          <span aria-hidden="true"> · </span>
          {family.automobileCount} {family.automobileCount === 1 ? "variant" : "variants"}
        </p>
        <Link href={`/brands/${family.brandId}/models/${encodeURIComponent(family.familyKey)}`}>
          Explore generations <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
