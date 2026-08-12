import ModelFamilyList from "@/components/models/ModelFamilyList";
import styles from "@/app/catalog.module.css";


export default async function BrandAutosPage({params}) {

    const {id} = await params;

  return (
    <div className={styles.page}>
      <ModelFamilyList brandId={id} />
    </div>
  );
}
