import ModelFamilyDetails from "@/components/models/ModelFamilyDetails";
import styles from "@/app/catalog.module.css";

export default async function ModelFamilyPage({ params }) {
  const { id, familyKey } = await params;

  return (
    <div className={styles.page}>
      <ModelFamilyDetails brandId={id} familyKey={familyKey} />
    </div>
  );
}
