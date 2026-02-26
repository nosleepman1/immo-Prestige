import API from './api'


const REGISTER = async (userData) => {
    try {
        const response = await API.post('/users/register', userData)

        
        return response.data

    }catch (error) {
        console.error("Registration error:   ", error)
        throw error
    }
}

const LOGIN = async (credentials) => {
    try {
        const response = await API.post('/users/login', credentials)
        return response.data

    }catch (error) {
        console.error("Login error:   ", error)
        throw error
    }
}

const LOGOUT = async () => {
    try {
        const response = await API.post('/users/logout')
        return response.data

    }catch (error) {
        console.error("Logout error:   ", error)
        throw error
    }
}

const CURRENT_USER = async (id) => {
    try {
        const response = await API.get(`/users/${id}`)
        return response.data

    }catch (error) {
        console.error("Fetch current user error:   ", error)
        throw error
    }
}


export {REGISTER, LOGIN, LOGOUT, CURRENT_USER}