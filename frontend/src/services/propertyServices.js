import API from "./api"

const DEVISES = async () => {
    const response = await API.get('/devises');
    return response.data
}

const PROPERTIES_TYPES = async() => {
    const response = await API.get('/property-types');
    return response.data
}


const STORE_PROPERTY = async (data, token) => {
    const response = await API.post('/properties', data, {
        
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    )
    return response.data
}


export {DEVISES, PROPERTIES_TYPES, STORE_PROPERTY}