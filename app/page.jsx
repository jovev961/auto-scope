import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import AutosCard from "@/components/autos/AutosCard";
import BrandCard from "@/components/brand/BrandCard";
import ModelFamilyCard from "@/components/models/ModelFamilyCard";
import { getAllAutosList, getAutoById } from "@/lib/autos";
import { getAllBrandsList } from "@/lib/brands";
import { getAllModelFamilies } from "@/lib/modelFamilies";
import styles from "./page.module.css";

const FEATURED_AUTOMOBILE_COUNT = 4;
const FEATURED_MODEL_COUNT = 3;
const FEATURED_BRAND_COUNT = 4;

function getResultData(result) {
  return result.status === "fulfilled" && Array.isArray(result.value)
    ? result.value
    : [];
}

function getAutoPhoto(auto) {
  return auto?.photos?.[0] ?? auto?.coverPhoto ?? null;
}

function getAutoPhotos(auto) {
  if (Array.isArray(auto?.photos)) return auto.photos;
  return auto?.coverPhoto ? [auto.coverPhoto] : [];
}

function SectionState({ children }) {
  return <p className={styles.sectionState}>{children}</p>;
}

export default async function Home() {
  await connection();

  const [autosResult, modelsResult, brandsResult] = await Promise.allSettled([
    getAllAutosList({ sort: "createdAt,desc" }),
    getAllModelFamilies({ sort: "automobileCount,desc" }),
    getAllBrandsList({ sort: "name,asc" }),
  ]);

  const autos = getResultData(autosResult);
  const models = getResultData(modelsResult);
  const brands = getResultData(brandsResult);
  const selectedAutos = autos.slice(0, FEATURED_AUTOMOBILE_COUNT);
  const selectedAutoDetails = await Promise.allSettled(
    selectedAutos.map((auto) => getAutoById(auto.id)),
  );
  const enrichedAutos = selectedAutos.map((auto, index) => {
    const detailResult = selectedAutoDetails[index];
    return detailResult?.status === "fulfilled"
      ? { ...auto, ...detailResult.value }
      : auto;
  });
  const featuredAuto = enrichedAutos[0] ?? null;
  const showcaseAutos = enrichedAutos.slice(1);
  const featuredModels = models.slice(0, FEATURED_MODEL_COUNT);
  const featuredBrands = brands.slice(0, FEATURED_BRAND_COUNT);
  const featuredPhoto = getAutoPhoto(featuredAuto);

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-heading">
        {featuredPhoto ? (
          <Image
            className={styles.heroImage}
            src={featuredPhoto}
            alt={featuredAuto.displayName ?? featuredAuto.name ?? "Featured automobile"}
            width={1400}
            height={875}
            sizes="(max-width: 820px) calc(100vw - 28px), (max-width: 1180px) calc(100vw - 40px), 1180px"
            preload
          />
        ) : (
          <div className={styles.heroPlaceholder} aria-hidden="true">
            <span>AS</span>
          </div>
        )}
        <div className={styles.heroShade} />
        {featuredAuto ? (
          <div className={styles.featuredCaption}>
            <span>Newest addition</span>
            <Link href={`/autos/${featuredAuto.id}`}>
              {featuredAuto.displayName ?? featuredAuto.name}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        ) : null}

        <div className={styles.heroContent}>
          <div>
            <p className={styles.eyebrow}>About Auto Scope</p>
            <h1 id="home-heading">The automotive catalogue, brought into focus.</h1>
            <p className={styles.heroDescription}>
              Explore manufacturers, model families, generations, engines, and detailed
              specifications through one carefully organized automotive archive.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/autos">
                Explore cars <span aria-hidden="true">→</span>
              </Link>
              <Link className={styles.secondaryAction} href="/compare">
                Compare vehicles
              </Link>
            </div>
          </div>

          <dl className={styles.metrics} aria-label="Catalogue totals">
            <div>
              <dt>Brands</dt>
              <dd>{brandsResult.status === "fulfilled" ? brands.length : "—"}</dd>
            </div>
            <div>
              <dt>Model families</dt>
              <dd>{modelsResult.status === "fulfilled" ? models.length : "—"}</dd>
            </div>
            <div>
              <dt>Cars</dt>
              <dd>{autosResult.status === "fulfilled" ? autos.length : "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={`${styles.catalogueSection} ${styles.brandSection}`} aria-labelledby="brands-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Start with a manufacturer</p>
            <h2 id="brands-heading">Explore brands</h2>
          </div>
          <Link href="/brands">All brands <span aria-hidden="true">→</span></Link>
        </div>
        {brandsResult.status === "rejected" ? (
          <SectionState>Brands are temporarily unavailable.</SectionState>
        ) : featuredBrands.length === 0 ? (
          <SectionState>No brands are available yet.</SectionState>
        ) : (
          <div className={styles.brandGrid}>
            {featuredBrands.map((brand) => (
              <BrandCard brand={brand} key={brand.id} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.catalogueSection} aria-labelledby="models-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Generations and variants</p>
            <h2 id="models-heading">Popular model families</h2>
          </div>
          <Link href="/models">All model families <span aria-hidden="true">→</span></Link>
        </div>
        {modelsResult.status === "rejected" ? (
          <SectionState>Model families are temporarily unavailable.</SectionState>
        ) : featuredModels.length === 0 ? (
          <SectionState>No model families are available yet.</SectionState>
        ) : (
          <div className={styles.showcaseGrid}>
            {featuredModels.map((model) => (
              <ModelFamilyCard
                family={model}
                key={`${model.brandId}-${model.familyKey}`}
                showBrand
              />
            ))}
          </div>
        )}
      </section>

      <section className={styles.catalogueSection} aria-labelledby="cars-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Recently catalogued</p>
            <h2 id="cars-heading">Latest additions</h2>
          </div>
          <Link href="/autos">All cars <span aria-hidden="true">→</span></Link>
        </div>
        {autosResult.status === "rejected" ? (
          <SectionState>Automobiles are temporarily unavailable.</SectionState>
        ) : showcaseAutos.length === 0 ? (
          <SectionState>No additional automobiles are available yet.</SectionState>
        ) : (
          <div className={styles.showcaseGrid}>
            {showcaseAutos.map((auto) => (
              <AutosCard auto={auto} initialPhotos={getAutoPhotos(auto)} key={auto.id} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.compareCallout} aria-labelledby="compare-heading">
        <div>
          <p className={styles.eyebrow}>Side by side</p>
          <h2 id="compare-heading">See how your shortlist compares.</h2>
          <p>Choose two automobiles and review their specifications in one focused view.</p>
        </div>
        <Link href="/compare">
          Start comparing <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
