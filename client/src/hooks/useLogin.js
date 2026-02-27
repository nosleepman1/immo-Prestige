import { useContext, useState } from "react";
import { LOGIN } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const useLogin = () => {

    const navigate = useNavigate()
    
    const {login} = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleLogin = async (credentials) => {

        try {

            setLoading(true)
            setErrors({})

            const response = await LOGIN(credentials)
            login(response.access_token)
            navigate('/profile')

        } catch (err) {

            setErrors(err.response?.data?.errors)
    
        } finally {
            setLoading(false)
        }
    }

    return {handleLogin, loading, errors }
}

export default useLogin