import { AuthContext } from "@/context/AuthContext"
import API from "@/services/api"
import { useContext, useEffect, useState } from "react"



const useGetProperties = () => {

    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({})
    const {token} = useContext(AuthContext)

    useEffect(() =>{

        const getProperties = async () => {
        setLoading(true)
        setError({})

        try {
            const response = await API.get('/properties', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setProperties(response.data)
        } catch (error) {
            if(error.response?.data?.message){
                setError(error.response.data.message)

            } else if(error.response?.data?.errors){
                setError(error.response.data.errors)
            } else{
                setError('Une erreur est survenue lors de la récupération des propriétés')
            }
        } finally {
            setLoading(false)
        }
    }
        getProperties()

    }, [])

    return {properties, loading, error}
}

export default useGetProperties;