import BrandList from "@/components/brand/BrandList";
import styles from "@/app/catalog.module.css";

export default function BrandsPage() {
  return (
    <div className={styles.page}>
      <BrandList />
    </div>
  );
}
