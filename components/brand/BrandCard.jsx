import Link from "next/link";
import styles from "./BrandCard.module.css";

export default function BrandCard({brand}) {
    return (
    <article className={styles.card}>
        <span className={styles.label}>Manufacturer</span>
        <h2>{brand.displayName}</h2>
        <Link href={`/brands/${brand.id}`}>
            View model families <span aria-hidden="true">→</span>
        </Link>
    </article>
  );
}
