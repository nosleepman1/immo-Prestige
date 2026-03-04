import { AuthContext } from "@/context/AuthContext"
import API from "@/services/api"
import { useContext, useEffect, useState } from "react"

const useGetProperties = (page = 1) => {
   
    const [properties, setProperties] = useState({ data: [], links: {}, meta: {} })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({})
    const { token } = useContext(AuthContext)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const refetch = () => setRefreshTrigger(prev => prev + 1)

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
                setProperties(response.data) 
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
    }, [page, refreshTrigger]) // ← re-fetch automatique quand page change ou appel de refetch()

    return { properties, loading, error, refetch }
}

export default useGetProperties