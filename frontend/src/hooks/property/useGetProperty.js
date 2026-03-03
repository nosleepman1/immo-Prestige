import { AuthContext } from "@/context/AuthContext"
import { GET_PROPERTY } from "@/services/propertyServices"
import { useContext, useEffect, useState } from "react"




const useGetProperty = (id) => {
    const [property, setProperty] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { token } = useContext(AuthContext)

    useEffect(() => {
        const getProperty = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await GET_PROPERTY(id, token)
                setProperty(response.data)
            } catch (error) {
                if (error.response?.data?.message) {
                    setError(error.response.data.message)
                } else if (error.response?.data?.errors) {
                    setError(error.response.data.errors)
                } else {
                    setError('Une erreur est survenue lors de la récupération de la propriété')
                }
            } finally {
                setLoading(false)
            }
        }
        getProperty()
    }, [id])

    return { property, loading, error }
}   

export default useGetProperty
