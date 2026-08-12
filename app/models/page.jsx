import ModelFamilyList from "@/components/models/ModelFamilyList";
import styles from "@/app/catalog.module.css";

export default function ModelsPage() {
  return (
    <div className={styles.page}>
      <ModelFamilyList />
    </div>
  );
}
