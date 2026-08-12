"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./BrandLogo.module.css";

function getBrandInitials(brandName) {
  const words = brandName?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function BrandLogo({ brand, variant = "card" }) {
  const [failedLogo, setFailedLogo] = useState(null);
  const brandName = brand?.displayName ?? brand?.name ?? "Brand";
  const logo = brand?.logo;
  const showLogo = Boolean(logo && failedLogo !== logo);

  return (
    <div className={`${styles.badge} ${styles[variant]}`} aria-hidden="true">
      {showLogo ? (
        <Image
          className={styles.image}
          src={logo}
          alt=""
          fill
          sizes={variant === "hero" ? "144px" : "104px"}
          onError={() => setFailedLogo(logo)}
        />
      ) : (
        <span className={styles.fallback}>{getBrandInitials(brandName)}</span>
      )}
    </div>
  );
}
