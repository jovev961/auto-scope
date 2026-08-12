import AutosList from "@/components/autos/AutosList";
import styles from "@/app/catalog.module.css";

export default function AutosPage() {
  return (
    <div className={styles.page}>
      <AutosList />
    </div>
  );
}
