import CompareDetails from "@/components/compare/CompareDetails";

export default async function page({searchParams}) {

  const {brandId, familyKey, autoId, engineId} = await searchParams
  const preSelectedAuto = {
        "brand": brandId,
        "model": familyKey,
        "auto": autoId,
        "engine": engineId,
  }

  return (
    <div>
        <CompareDetails preSelectedAuto={preSelectedAuto}/>
    </div>
  )
}

//localhost:3000/compare?brandId=10&familyKey=a3&autoId=298&engineId=736
