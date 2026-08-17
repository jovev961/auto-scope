import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import BrandLogo from "@/components/brand/BrandLogo";
import { getAllAutosList, getAutoById } from "@/lib/autos";
import { getAllBrandsList } from "@/lib/brands";
import { getAllModelFamilies } from "@/lib/modelFamilies";
import styles from "./page.module.css";

const SHOWCASE_COUNT = 5;

function sampleItems(items, count = SHOWCASE_COUNT) {
  const pool = Array.isArray(items) ? [...items] : [];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}

function getResultData(result) {
  return result.status === "fulfilled" && Array.isArray(result.value)
    ? result.value
    : [];
}

function getAutoPhoto(auto) {
  return auto?.photos?.[0] ?? auto?.coverPhoto ?? null;
}

function getFamilyYears(family) {
  if (!family.firstYear) return "Years unavailable";
  if (family.latestYear && family.latestYear !== family.firstYear) {
    return `${family.firstYear}–${family.latestYear}`;
  }
  return String(family.firstYear);
}

function SectionState({ children }) {
  return <p className={styles.sectionState}>{children}</p>;
}

export default async function Home() {
  await connection();

  const [autosResult, modelsResult, brandsResult] = await Promise.allSettled([
    getAllAutosList(),
    getAllModelFamilies(),
    getAllBrandsList(),
  ]);

  const autos = getResultData(autosResult);
  const models = getResultData(modelsResult);
  const brands = getResultData(brandsResult);
  const selectedAutos = sampleItems(
    autos,
    autos.length > SHOWCASE_COUNT ? SHOWCASE_COUNT + 1 : SHOWCASE_COUNT,
  );
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
  const showcaseAutos = autos.length > SHOWCASE_COUNT
    ? enrichedAutos.slice(1, SHOWCASE_COUNT + 1)
    : enrichedAutos.slice(0, SHOWCASE_COUNT);
  const randomModels = sampleItems(models);
  const randomBrands = sampleItems(brands);
  const featuredPhoto = getAutoPhoto(featuredAuto);

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="featured-heading">
        <div className={styles.heroMedia}>
          {featuredPhoto ? (
            <Image
              className={styles.heroImage}
              src={featuredPhoto}
              alt={featuredAuto.displayName ?? featuredAuto.name ?? "Featured automobile"}
              width={1400}
              height={875}
              sizes="(max-width: 680px) calc(100vw - 28px), (max-width: 1180px) calc(100vw - 40px), 1180px"
              preload
            />
          ) : (
            <div className={styles.heroPlaceholder} aria-hidden="true">
              <span>AS</span>
            </div>
          )}
          <div className={styles.heroShade} />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Featured automobile</p>
            <h1 id="featured-heading">
              {featuredAuto?.displayName ?? featuredAuto?.name ?? "Discover the world of automobiles"}
            </h1>
            <p>
              {featuredAuto
                ? "A fresh highlight from the Auto Scope catalogue, selected for this visit."
                : "Explore manufacturers, model families, generations, engines, and detailed specifications."}
            </p>
            <Link className={styles.primaryAction} href={featuredAuto ? `/autos/${featuredAuto.id}` : "/autos"}>
              {featuredAuto ? "Explore this car" : "Explore all cars"}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.about} aria-labelledby="about-heading">
        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>About Auto Scope</p>
          <h2 id="about-heading">One catalogue, every route into the automotive world.</h2>
          <p>
            Start with a manufacturer, move through a model family, or browse individual automobiles.
            Auto Scope brings generations, variants, photos, engines, and specifications into one focused experience.
          </p>
        </div>
        <dl className={styles.metrics}>
          <div>
            <dt>Brands</dt>
            <dd>{brandsResult.status === "fulfilled" ? brands.length : "—"}</dd>
          </div>
          <div>
            <dt>Model families</dt>
            <dd>{modelsResult.status === "fulfilled" ? models.length : "—"}</dd>
          </div>
          <div>
            <dt>Automobiles</dt>
            <dd>{autosResult.status === "fulfilled" ? autos.length : "—"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.catalogueSection} aria-labelledby="brands-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Manufacturers</p>
            <h2 id="brands-heading">Explore brands</h2>
          </div>
          <Link href="/brands">View all brands <span aria-hidden="true">→</span></Link>
        </div>
        {brandsResult.status === "rejected" ? (
          <SectionState>Brands are temporarily unavailable.</SectionState>
        ) : randomBrands.length === 0 ? (
          <SectionState>No brands are available yet.</SectionState>
        ) : (
          <div className={styles.brandGrid}>
            {randomBrands.map((brand) => (
              <article className={styles.brandCard} key={brand.id}>
                <BrandLogo brand={brand} />
                <p>Manufacturer</p>
                <h3>{brand.displayName ?? brand.name}</h3>
                <Link href={`/brands/${brand.id}`}>
                  View model families <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.catalogueSection} aria-labelledby="models-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Generations and variants</p>
            <h2 id="models-heading">Discover model families</h2>
          </div>
          <Link href="/models">View all models <span aria-hidden="true">→</span></Link>
        </div>
        {modelsResult.status === "rejected" ? (
          <SectionState>Model families are temporarily unavailable.</SectionState>
        ) : randomModels.length === 0 ? (
          <SectionState>No model families are available yet.</SectionState>
        ) : (
          <div className={styles.showcaseGrid}>
            {randomModels.map((model) => (
              <article className={styles.showcaseCard} key={`${model.brandId}-${model.familyKey}`}>
                <div className={styles.cardMedia}>
                  {model.coverPhoto ? (
                    <Image
                      src={model.coverPhoto}
                      alt={`${model.brandDisplayName ?? ""} ${model.name}`.trim()}
                      width={720}
                      height={450}
                      sizes="(max-width: 680px) calc(100vw - 28px), (max-width: 980px) 50vw, 33vw"
                    />
                  ) : (
                    <div className={styles.cardPlaceholder} aria-hidden="true">
                      <span>{model.name}</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <p>{model.brandDisplayName ?? "Model family"}</p>
                  <h3>{model.name}</h3>
                  <span className={styles.cardMeta}>
                    {getFamilyYears(model)} · {model.automobileCount ?? 0} variants
                  </span>
                  <Link href={`/brands/${model.brandId}/models/${encodeURIComponent(model.familyKey)}`}>
                    Explore generations <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.catalogueSection} aria-labelledby="cars-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Individual automobiles</p>
            <h2 id="cars-heading">Browse selected cars</h2>
          </div>
          <Link href="/autos">View all cars <span aria-hidden="true">→</span></Link>
        </div>
        {autosResult.status === "rejected" ? (
          <SectionState>Automobiles are temporarily unavailable.</SectionState>
        ) : showcaseAutos.length === 0 ? (
          <SectionState>No automobiles are available yet.</SectionState>
        ) : (
          <div className={styles.showcaseGrid}>
            {showcaseAutos.map((auto) => {
              const photo = getAutoPhoto(auto);

              return (
                <article className={styles.showcaseCard} key={auto.id}>
                  <div className={styles.cardMedia}>
                    {photo ? (
                      <Image
                        src={photo}
                        alt={auto.displayName ?? auto.name ?? "Automobile"}
                        width={720}
                        height={405}
                        sizes="(max-width: 680px) calc(100vw - 28px), (max-width: 980px) 50vw, 33vw"
                      />
                    ) : (
                      <div className={styles.cardPlaceholder} aria-hidden="true">
                        <span>Photo unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <p>Automobile</p>
                    <h3>{auto.displayName ?? auto.name}</h3>
                    <Link href={`/autos/${auto.id}`}>
                      See engines and details <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
