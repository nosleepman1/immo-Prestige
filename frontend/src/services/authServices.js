import API from './api'


const REGISTER = async (userData) => {
    const response = await API.post('/auth/register', userData)
    return response.data
}

const LOGIN = async (credentials) => {
    const response = await API.post('/auth/login', credentials)
    return response.data
}

    const LOGOUT = async () => {
        localStorage.removeItem('token')
    }

const CURRENT_USER = async (token) => {
  
    const response = await API.get(`/user`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    return response.data
}


export {REGISTER, LOGIN, LOGOUT, CURRENT_USER}