import { useEffect, useState } from "react";
import { getBrandById } from "@/lib/brands";

export default function useBrand(brandId) {
  const [requestState, setRequestState] = useState({ key: null, brand: null });
  const requestKey = brandId ? String(brandId) : null;

  useEffect(() => {
    if (!requestKey) return;

    let canceled = false;

    getBrandById(brandId)
      .then((brand) => {
        if (!canceled) setRequestState({ key: requestKey, brand });
      })
      .catch(() => {
        if (!canceled) setRequestState({ key: requestKey, brand: null });
      });

    return () => {
      canceled = true;
    };
  }, [brandId, requestKey]);

  return requestState.key === requestKey ? requestState.brand : null;
}
