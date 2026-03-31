import { AuthContext } from "@/context/AuthContext"
import API from "@/services/api"
import { useContext, useEffect, useState } from "react"

const useGetPosts = (page = 1) => {
   
    const [posts, setPosts] = useState({ data: [], links: {}, meta: {} })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({})
    const { token } = useContext(AuthContext)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const refetch = () => setRefreshTrigger(prev => prev + 1)

    useEffect(() => {
        
        const getPosts = async () => {
            setLoading(true)
            setError({})

            try {
                
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
                
                const response = await API.get(`/posts?page=${page}`, config)

                setPosts(response.data) 
                
            } catch (error) {
                if (error.response?.data?.message) {
                    setError(error.response.data.message)
                } else if (error.response?.data?.errors) {
                    setError(error.response.data.errors)
                } else {
                    setError('Une erreur est survenue lors de la récupération des posts')
                }
            } finally {
                setLoading(false)
            }
        }
        getPosts()
    }, [page, refreshTrigger, token])

    return { posts, loading, error, refetch }
}

export default useGetPosts
