import EngineSelection from "@/components/autos/EngineSelection";
import styles from "@/app/catalog.module.css";

export default async function AutoEngineSelectionPage({params}) {

    const {id} = await params;

  return (
    <div className={styles.page}>
      <EngineSelection autoId={id} />
    </div>
  );
}
