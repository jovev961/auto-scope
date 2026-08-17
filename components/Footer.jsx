import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

const footerLinks = [
  { href: "/brands", label: "Brands" },
  { href: "/models", label: "Models" },
  { href: "/autos", label: "Cars" },
  { href: "/compare", label: "Compare" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.grid}>
          <section className={styles.column} aria-labelledby="footer-about-heading">
            <h2 id="footer-about-heading">About Auto Scope</h2>
            <p>
              Auto Scope is an automotive catalogue for exploring manufacturers,
              model families, generations, automobile variants, engines, and
              detailed specifications in one place.
            </p>
          </section>

          <section className={styles.column} aria-labelledby="footer-mission-heading">
            <h2 id="footer-mission-heading">Our mission</h2>
            <p>
              Make automotive information easier to discover, navigate, and
              compare, with a focused path from each brand to the details that
              define every vehicle.
            </p>
          </section>

          <nav className={styles.column} aria-labelledby="footer-explore-heading">
            <h2 id="footer-explore-heading">Explore</h2>
            <div className={styles.links}>
              {footerLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className={styles.brandColumn}>
            <Link className={styles.brand} href="/" aria-label="Auto Scope home">
              <Image
                className={styles.logo}
                src="/Logo.png"
                alt=""
                width={2120}
                height={742}
                sizes="(max-width: 600px) 180px, 200px"
              />
            </Link>
            <p>Every machine has a story worth exploring.</p>
          </div>
        </div>
      </div>

      <div className={styles.legal}>
        <p>© 2026 Auto Scope</p>
      </div>
    </footer>
  );
}
