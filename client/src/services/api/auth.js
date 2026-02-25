//endpoints call

//Auth endpoints
const URL = "http://localhost:8000/api"

const REGISTER = async (userData) => {
    try {
        const response = await fetch(`${URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })
        return await response.json()
    } catch (error) {
        console.error("Registration error:", error)
        throw error
    }
}

const LOGIN = async (credentials) => {
    try {
        const response = await fetch(`${URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        })
        return await response.json()
    } catch (error) {
        console.error("Login error:", error)
        throw error
    }
}

const LOGOUT = async () => {
    try {
        const response = await fetch(`${URL}/users/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        return await response.json()
    } catch (error) {
        console.error("Logout error:", error)
        throw error
    }
}

const CURRENT_USER = async (id) => {
    try {
        const response = await fetch(`${URL}/users/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        return await response.json()
    } catch (error) {
        console.error("Fetch current user error:", error)
        throw error
    }
}

const VERIFY_EMAIL = async (id, token) => {
    try {
        const response = await fetch(`${URL}/verify/${id}/${token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        return await response.json()
    } catch (error) {
        console.error("Email verification error:", error)
        throw error
    }
}


export { REGISTER, LOGIN, LOGOUT, CURRENT_USER, VERIFY_EMAIL }