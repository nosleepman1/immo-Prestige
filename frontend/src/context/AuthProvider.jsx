import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { CURRENT_USER } from "../services/authServices";

export const AuthProvider = ({ children }) => {

    
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)



    const login = async (newToken) => {
        try {
            localStorage.setItem('token', newToken)
            setToken(newToken)

            const currentUser = await CURRENT_USER(newToken)
            setUser(currentUser.data)

        } catch (err) {
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
            throw err
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }


    useEffect(() => {
        const loadUser = async () => {
            if(token) {
                try {
                    const currentUser = await CURRENT_USER(token)
                    setUser(currentUser.data)
                } catch {
                    logout()
                }
            }
            setLoading(false)
        }

        loadUser()
    }, [token])



    const isAuthenticated = !!token


    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated, user , loading}}>
            {children}
        </AuthContext.Provider>
    )
}
