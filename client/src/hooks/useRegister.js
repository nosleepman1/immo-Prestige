import {useState} from 'react'
import {REGISTER} from '../services/authServices'
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const register = async (userData) => {
        setLoading(true)
        setErrors({})
        setSuccess(false)
      
        await REGISTER(userData)
        
            .then(response => {
                setSuccess(true)
                navigate('/login')
                return { success: true, ...response }
            })
            .catch(err => {

                if(err.response && err.response.status === 422) {
                    setErrors(err.response.data.errors || {})
                }
                return { success: false }
            })
            .finally(() => {
                setLoading(false)
            });
    }   

    return { register, loading, errors, success }
}