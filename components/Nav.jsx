"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./Nav.module.css";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    function closeOutsideMenu(event) {
      if (!navRef.current?.contains(event.target)) setIsMenuOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutsideMenu);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutsideMenu);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 761px)");
    const closeAtDesktop = (event) => {
      if (event.matches) setIsMenuOpen(false);
    };

    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <nav className={styles.nav} aria-label="Primary navigation" ref={navRef}>
      <Link className={styles.brand} href="/" aria-label="Auto Scope home" onClick={closeMenu}>
        <Image
          className={styles.brandLogo}
          src="/Logo.png"
          alt=""
          width={2120}
          height={742}
          sizes="(max-width: 560px) 96px, 120px"
          loading="eager"
        />
      </Link>
      <button
        className={styles.menuToggle}
        ref={menuButtonRef}
        type="button"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation-links"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <div
        className={`${styles.links} ${isMenuOpen ? styles.menuOpen : ""}`}
        id="primary-navigation-links"
      >
        <Link href="/" onClick={closeMenu}>Home</Link>
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
        <Link className={styles.mobileOnly} href="/autos" onClick={closeMenu}>Cars</Link>
        <Link className={styles.mobileOnly} href="/models" onClick={closeMenu}>Models</Link>
        <Link className={styles.mobileOnly} href="/brands" onClick={closeMenu}>Brands</Link>
        <Link href="/compare" onClick={closeMenu}>Compare</Link>
        <Link href="/contact" onClick={closeMenu}>Contact</Link>
      </div>
    </nav>
  );
}
