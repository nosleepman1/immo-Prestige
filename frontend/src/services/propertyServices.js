import API from "./api"
import axios from "axios";

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

const STORE_IMAGE = async (property_id, imageFile) => {
    const formData = new FormData()
    formData.append('image_path', imageFile)
    const response = await axios.post(`http://localhost:8000/api/properties/${property_id}/images`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}

const GET_PROPERTIES = async (token) => {
    const response = await API.get('/properties', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data
}


const GET_PROPERTY = async (id, token) => {
    const response = await API.get(`/properties/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data
}

const UPDATE_PROPERTY = async (id, data, token) => {
    const response = await API.put(`/properties/${id}`, data, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data
}

const DELETE_PROPERTY = async (id, token) => {
    const response = await API.delete(`/properties/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    console.log(response);
    return response.data
}


export {DEVISES, PROPERTIES_TYPES, STORE_PROPERTY, GET_PROPERTIES, STORE_IMAGE, GET_PROPERTY, UPDATE_PROPERTY, DELETE_PROPERTY}