import {BASE_API, API_HOSTNAME, API_PORT, API_PROTOCOL} from "./properties"
const LOCAL_MODEL_FAMILIES_BASE_URL = `${API_PROTOCOL}://${API_HOSTNAME}:${API_PORT}${BASE_API}/model-families`
const LOCAL_BRAND_BASE_URL = `${API_PROTOCOL}://${API_HOSTNAME}:${API_PORT}${BASE_API}/brands`

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

export async function getAllModelFamilies(options = {}) {
  const {
    brandId,
    name,
    sort = "name,asc",
  } = options;

  const params = new URLSearchParams({ sort });

  if (brandId !== undefined) params.set("brandId", brandId);
  if (name !== undefined) params.set("name", name);

  const response = await fetch(`${LOCAL_MODEL_FAMILIES_BASE_URL}/all?${params}`);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, "Unable to get all model families"));
  }
  return response.json();
}

export async function getAllModelFamiliesForBrand(brandId, options = {}) {
  console.log(`api: ${brandId}`)
  if (!brandId) throw new Error("Brand is required");

  const {
    name,
    sort = "name,asc",
  } = options;

  const params = new URLSearchParams({ sort });

  if (name !== undefined) params.set("name", name);

  const response = await fetch(
    `${LOCAL_BRAND_BASE_URL}/${brandId}/model-families/all?${params}`,
  );
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, "Unable to get all model families for the brand"));
  }
  return response.json();
}

export async function getModelFamily(brandId, familyKey) {
  if (!brandId || !familyKey) throw new Error("Brand and model family are required");
  const response = await fetch(
    `${LOCAL_BRAND_BASE_URL}/${brandId}/model-families/${encodeURIComponent(familyKey)}`,
  );
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, "Unable to get the model family"));
  }
  return response.json();
}

export async function getAllAutosForBrandAndFamily(brandId, familyKey) {
  if (!brandId) throw new Error("Brand is required");
  if (!familyKey) throw new Error("Family is required");

  const response = await fetch(
    `${LOCAL_BRAND_BASE_URL}/${brandId}/model-families/${familyKey}/automobiles/all`,
  );
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, "Unable to get all Autos for the brand and family"));
  }
  return response.json();
}