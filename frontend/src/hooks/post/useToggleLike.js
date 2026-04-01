import { useState, useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import API from '@/services/api'

export default function useToggleLike() {
  const [loading, setLoading] = useState(false)
  const { token, isAuthenticated } = useContext(AuthContext)

  const toggleLike = async (postId) => {
    if (!isAuthenticated) {
      return { error: 'unauthenticated' }
    }

    setLoading(true)
    try {
      const response = await API.post(`/posts/${postId}/like`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setLoading(false)
      return { success: true, data: response.data }
    } catch (error) {
      setLoading(false)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du like' }
    }
  }

  return { toggleLike, loading }
}
