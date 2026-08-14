const LOCAL_ENGINE_BASE_URL = "http://localhost:8080/api/v1/engines"

export async function getAllEngines(prop = {}) {
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
    if (autoId !== undefined) {
        params.set('brandId', autoId);
    }

    const response = await fetch(`${LOCAL_ENGINE_BASE_URL}?${params.toString()}`);
    if(!response.ok){
        throw new Error("Unable to get the engines");
    }

    const data = await response.json();
    return data;
}

export async function getAllEnginesList(prop = {}) {
    const {
        autoId,
        name,
        sort = 'id,asc',
    } = prop;

    const params = new URLSearchParams({ sort });

    if (name !== undefined) {
        params.set('name', name);
    }
    if (autoId !== undefined) {
        params.set('automobileId', autoId);
    }

    const response = await fetch(`${LOCAL_ENGINE_BASE_URL}/all?${params.toString()}`);
    if(!response.ok){
        throw new Error("Unable to get all engines");
    }

    const data = await response.json();
    return data;
}

export async function getEngineById(id) {

    if(!id){
        throw new Error("Parameter id is missing!");
    }
    const response = await fetch(`${LOCAL_ENGINE_BASE_URL}/${id}`);
    if(!response.ok){
        throw new Error(`Unable to get engine with id ${id}`);
    }

    const data = await response.json();
    return data;
}
