const LOCAL_AUTOS_BASE_URL = "http://localhost:8080/api/v1/automobiles"

export async function getAllAutos(prop = {}) {
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
    if (brandId !== undefined) {
        params.set('brandId', brandId);
    }

    const response = await fetch(`${LOCAL_AUTOS_BASE_URL}?${params.toString()}`);
    if(!response.ok){
        throw new Error("Unable to get the autos");
    }

    const data = await response.json();
    return data;
}

export async function getAutoById(id) {

    if(!id){
        throw new Error("Parameter id is missing!");
    }
    const response = await fetch(`${LOCAL_AUTOS_BASE_URL}/${id}`);
    if(!response.ok){
        throw new Error(`Unable to get auto with id ${id}`);
    }

    const data = await response.json();
    return data;
}

export async function getAllEnginesForAutoId(prop = {}) {
    const {
        autoId,
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
    if(!autoId){
        throw new Error("Parameter autoId is missing!");
    }
    const response = await fetch(`${LOCAL_AUTOS_BASE_URL}/${autoId}/engines?${params.toString()}`);
    
    if(!response.ok){
        throw new Error(`Unable to get the engines for autoId ${autoId}`);
    }

    const data = await response.json();
    return data;
}
