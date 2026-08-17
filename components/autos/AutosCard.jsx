"use client";

import { getAutoById } from "@/lib/autos";
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react";
import styles from "./AutosCard.module.css";

export default function AutosCard({auto, initialPhotos}) {

  const [autoPhotos, setAutoPhotos] = useState(() =>
    Array.isArray(initialPhotos) ? initialPhotos : [],
  );
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    if (Array.isArray(initialPhotos)) {
      return undefined;
    }

    let canceled = false;
    async function fetchPhotos() {
      try{
        const response = await getAutoById(auto.id);
        if(!response.photos || response.photos.length == 0){
          console.log(auto.name, auto.id)
        }
        if(!canceled){
          setActivePhotoIndex(0);
          setAutoPhotos(response.photos ?? []);
        }
      }catch(error){
        if(!canceled){
          console.log(error);
        }
      }
    }
    fetchPhotos();
    return () => {
      canceled = true;
    };
  },[auto, initialPhotos])

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

  return (
    <article className={styles.card}>
        <div className={styles.imageFrame}>
        {autoPhotos && autoPhotos.length > 0 ? (
                <Image
                    className={styles.image}
                    src={autoPhotos[activePhotoIndex]}
                    alt={`${auto.displayName} photo ${activePhotoIndex + 1} of ${autoPhotos.length}`}
                    width={640}
                    height={360}
                    sizes="(max-width: 580px) calc(100vw - 28px), (max-width: 920px) 50vw, 33vw"
                />
            ) : (
                <p className={styles.placeholder}>No image available</p>
            )}
            {autoPhotos.length > 1 && (
              <>
                <button
                  className={`${styles.photoButton} ${styles.previousButton}`}
                  type="button"
                  aria-label={`Show previous photo of ${auto.displayName}`}
                  onClick={showPreviousPhoto}
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  className={`${styles.photoButton} ${styles.nextButton}`}
                  type="button"
                  aria-label={`Show next photo of ${auto.displayName}`}
                  onClick={showNextPhoto}
                >
                  <span aria-hidden="true">→</span>
                </button>
                <span className={styles.photoCounter}>
                  {activePhotoIndex + 1} / {autoPhotos.length}
                </span>
              </>
            )}
        </div>

        <div className={styles.content}>
          <span className={styles.label}>Automobile</span>
          <h2>{auto.displayName}</h2>
          <Link href={`/autos/${auto.id}`}>
            See auto details <span aria-hidden="true">→</span>
          </Link>
        </div>
    </article>
  )
}
