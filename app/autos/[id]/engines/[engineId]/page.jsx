import AutosDetails from "@/components/autos/AutosDetails";
import styles from "@/app/catalog.module.css";

export default async function AutoEngineDetailsPage({ params }) {
  const { id, engineId } = await params;

  return (
    <div className={styles.page}>
      <AutosDetails autoId={id} engineId={engineId} />
    </div>
  );
}
