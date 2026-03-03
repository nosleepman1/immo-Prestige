import { AuthContext } from "@/context/AuthContext"
import API from "@/services/api"
import { useContext, useEffect, useState } from "react"

const useGetProperties = (page = 1) => {
    // On initialise avec la bonne forme { data, links, meta }
    const [properties, setProperties] = useState({ data: [], links: {}, meta: {} })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({})
    const { token } = useContext(AuthContext)

    useEffect(() => {
        const getProperties = async () => {
            setLoading(true)
            setError({})

            try {
                const response = await API.get(`/properties?page=${page}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                setProperties(response.data) // stocke { data, links, meta }
            } catch (error) {
                if (error.response?.data?.message) {
                    setError(error.response.data.message)
                } else if (error.response?.data?.errors) {
                    setError(error.response.data.errors)
                } else {
                    setError('Une erreur est survenue lors de la récupération des propriétés')
                }
            } finally {
                setLoading(false)
            }
        }
        getProperties()
    }, [page]) // ← re-fetch automatique quand page change

    return { properties, loading, error }
}

export default useGetProperties