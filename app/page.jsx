import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Automotive catalogue</p>
          <h1>Every machine has a story worth exploring.</h1>
          <p className={styles.intro}>
            Browse celebrated manufacturers, move through model families and
            generations, and dig into every automobile variant.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/autos">
              Explore all cars <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.secondaryAction} href="/brands">
              Browse brands
            </Link>
          </div>
        </div>

        <div className={styles.instrument} aria-hidden="true">
          <div className={styles.instrumentTop}>
            <span>Auto Scope</span>
            <span className={styles.status}>Catalogue online</span>
          </div>
          <div className={styles.dial}>
            <span className={styles.dialValue}>360°</span>
            <span className={styles.dialLabel}>Automotive detail</span>
          </div>
          <div className={styles.instrumentGrid}>
            <span>Brands</span>
            <span>Families</span>
            <span>Engines</span>
          </div>
        </div>
      </section>

      <section className={styles.destinations} aria-labelledby="explore-heading">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Start exploring</p>
          <h2 id="explore-heading">Choose your route</h2>
        </div>
        <div className={styles.cardGrid}>
          <Link className={styles.destinationCard} href="/brands">
            <span className={styles.cardIndex}>01</span>
            <div>
              <h3>Browse by brand</h3>
              <p>Start with a manufacturer, then explore its model families and generations.</p>
            </div>
            <span className={styles.cardArrow} aria-hidden="true">↗</span>
          </Link>
          <Link className={styles.destinationCard} href="/autos">
            <span className={styles.cardIndex}>02</span>
            <div>
              <h3>Explore all cars</h3>
              <p>Search every automobile variant and open its photos, engines, and full specifications.</p>
            </div>
            <span className={styles.cardArrow} aria-hidden="true">↗</span>
          </Link>
          <Link className={styles.destinationCard} href="/models">
            <span className={styles.cardIndex}>03</span>
            <div>
              <h3>Explore model families</h3>
              <p>Search every family, compare generations, and open detailed variant specifications.</p>
            </div>
            <span className={styles.cardArrow} aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
