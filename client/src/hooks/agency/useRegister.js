import { useState } from "react"
import { CREATE } from "../../services/agencyServices"
import { useNavigate } from "react-router-dom"

export const useAgencyRegister = () => {

    const [load, setLoad] = useState(false)
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()



    const registerAgency = async (agencyData) => {
        setLoad(true)
        setErrors({})
        setSuccess(false)

        await CREATE(agencyData)

            .then(response => {
                setSuccess(true)
                navigate('/login')
                return { success: true, ...response }
            })

            .catch(err => {
                console.log(err);
                
                if (err.response && err.response.status === 422) {
                    console.log(err.response.data);
                    
                    setErrors(err.response.data.errors || {})
                }
                return { success: false }
            })

            .finally(() => {
                setLoad(false)
            });
    }
    return { registerAgency, load, errors, success }
}