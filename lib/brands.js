const LOCAL_BRANDS_BASE_URL = "http://localhost:8080/api/v1/brands"

export async function getAllBrands(prop = {}) {
    const {
        name,
        page = 0,
        size = 20,
        sort = 'id,asc',
    } = prop;

    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort,
    });

    if (name !== undefined) {
        params.set('name', name);
    }

    const response = await fetch(`${LOCAL_BRANDS_BASE_URL}?${params.toString()}`);
    if(!response.ok){
        throw new Error("Unable to get the brands");
    }

    const data = await response.json();
    return data;
}

export async function getAllBrandsList(prop = {}) {
    const {
        name,
        sort = 'id,asc',
    } = prop;

    const params = new URLSearchParams({ sort });

    if (name !== undefined) {
        params.set('name', name);
    }

    const response = await fetch(`${LOCAL_BRANDS_BASE_URL}/all?${params.toString()}`);
    if(!response.ok){
        throw new Error("Unable to get all brands");
    }

    const data = await response.json();
    return data;
}

export async function getBrandById(id) {

    if(!id){
        throw new Error("Parameter id is missing!");
    }
    const response = await fetch(`${LOCAL_BRANDS_BASE_URL}/${id}`);
    if(!response.ok){
        throw new Error(`Unable to get brand with id ${id}`);
    }

    const data = await response.json();
    return data;
}

export async function getAllAutosFromBrandId(prop = {}) {
    const {
        brandId,
        name,
        page = 0,
        size = 20,
        sort = 'id,asc',
    } = prop;

    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort,
    });

    if (name !== undefined) {
        params.set('name', name);
    }
    if(!brandId){
        throw new Error("Parameter brandId is missing!");
    }
    const response = await fetch(`${LOCAL_BRANDS_BASE_URL}/${brandId}/automobiles?${params.toString()}`);

    if(!response.ok){
        throw new Error(`Unable to get the autos for brandId ${brandId}`);
    }

    const data = await response.json();
    return data;
}

export async function getAllAutosFromBrandIdList(prop = {}) {
    const {
        brandId,
        name,
        sort = 'id,asc',
    } = prop;

    const params = new URLSearchParams({ sort });

    if (name !== undefined) {
        params.set('name', name);
    }
    if(!brandId){
        throw new Error("Parameter brandId is missing!");
    }

    const response = await fetch(
        `${LOCAL_BRANDS_BASE_URL}/${brandId}/automobiles/all?${params.toString()}`
    );

    if(!response.ok){
        throw new Error(`Unable to get all autos for brandId ${brandId}`);
    }

    const data = await response.json();
    return data;
}
