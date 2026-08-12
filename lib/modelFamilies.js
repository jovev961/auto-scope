const LOCAL_MODEL_FAMILIES_BASE_URL = "http://localhost:8080/api/v1/model-families";

function getApiErrorMessage(response, fallbackMessage) {
  return `${fallbackMessage} (HTTP ${response.status})`;
}

export async function getModelFamilies(options = {}) {
  const {
    brandId,
    name,
    page = 0,
    size = 20,
    sort = "name,asc",
  } = options;

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });

  if (brandId !== undefined) params.set("brandId", brandId);
  if (name !== undefined) params.set("name", name);

  const response = await fetch(`${LOCAL_MODEL_FAMILIES_BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, "Unable to get model families"));
  }
  return response.json();
}

export async function getModelFamily(brandId, familyKey) {
  if (!brandId || !familyKey) throw new Error("Brand and model family are required");
  const response = await fetch(
    `http://localhost:8080/api/v1/brands/${brandId}/model-families/${encodeURIComponent(familyKey)}`,
  );
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, "Unable to get the model family"));
  }
  return response.json();
}
