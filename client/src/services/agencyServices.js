import API from "./api";


const CREATE = async (data) => {
    const response = await API.post('/agency/store', data)
    return response.data
}




export {CREATE}