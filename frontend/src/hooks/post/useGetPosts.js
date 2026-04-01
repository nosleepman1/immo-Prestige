import { AuthContext } from "@/context/AuthContext"
import API from "@/services/api"
import { useContext, useEffect, useState, useCallback } from "react"

const useGetPosts = () => {
    const [posts, setPosts] = useState([])           // ✅ tableau plat maintenant
    const [meta, setMeta] = useState({})
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)  // ✅ chargement discret
    const [error, setError] = useState({})
    const { token } = useContext(AuthContext)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const refetch = () => {
        setPosts([])
        setPage(1)
        setRefreshTrigger(prev => prev + 1)
    }

    const fetchNextPage = useCallback(() => {
        if (meta.current_page < meta.last_page && !loadingMore) {
            setPage(prev => prev + 1)
        }
    }, [meta, loadingMore])

    useEffect(() => {
        const getPosts = async () => {
            page === 1 ? setLoading(true) : setLoadingMore(true)
            setError({})

            try {
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
                const response = await API.get(`/posts?page=${page}`, config)

                setPosts(prev =>
                    page === 1
                        ? response.data.data                    // reset (refetch)
                        : [...prev, ...response.data.data]      // ✅ accumulation
                )
                setMeta(response.data.meta)

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
                setLoadingMore(false)
            }
        }

        getPosts()
    }, [page, refreshTrigger, token])

    const hasNextPage = meta.current_page < meta.last_page

    return { posts, loading, loadingMore, error, refetch, fetchNextPage, hasNextPage }
}

export default useGetPosts