import Link from "next/link";
import styles from "./Nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      <Link className={styles.brand} href="/">
        <span className={styles.brandMark} aria-hidden="true">AS</span>
        <span>Auto Scope</span>
      </Link>
      <div className={styles.links}>
        <Link href="/">Home</Link>
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownTrigger}
            type="button"
            aria-haspopup="true"
            aria-controls="catalogue-navigation"
          >
            Catalogue
            <span className={styles.chevron} aria-hidden="true">⌄</span>
          </button>
          <div className={styles.dropdownMenu} id="catalogue-navigation">
            <Link href="/autos">Cars</Link>
            <Link href="/models">Models</Link>
            <Link href="/brands">Brands</Link>
          </div>
        </div>
        <Link href="/compare">Compare</Link>
      </div>
    </nav>
  );
}
