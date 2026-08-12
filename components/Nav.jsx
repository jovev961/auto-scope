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
        <Link href="/brands">Brands</Link>
        <Link href="/models">Models</Link>
        <Link href="/autos">All cars</Link>
      </div>
    </nav>
  );
}
