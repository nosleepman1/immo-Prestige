import { useState, useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import API from '@/services/api'

export default function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [addingComment, setAddingComment] = useState(false)
  const { token, isAuthenticated } = useContext(AuthContext)

  const getComments = async () => {
    setLoading(true)
    try {
        // Optionnel : Passer le token si l'utilisateur est connecté, pour certaines vérifications
        const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
        const response = await API.get(`/posts/${postId}/comments`, config)
        setComments(response.data?.data || [])
    } catch (error) {
        if(error.response?.status !== 404){
            console.error('Erreur fetching comments:', error)
        }
        setComments([])
    } finally {
        setLoading(false)
    }
  }

  const addComment = async (content) => {
    if (!isAuthenticated) return { error: 'unauthenticated' }
    
    setAddingComment(true)
    try {
        const response = await API.post(`/posts/${postId}/comment`, { content }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Ajouter le commentaire avec la bonne structure (souvent response.data.data)
        const newComment = response.data?.data || response.data
        setComments(prev => [newComment, ...prev])
        
        setAddingComment(false)
        return { success: true, data: newComment }
    } catch (error) {
        setAddingComment(false)
        return { success: false, error: 'Erreur lors de l\'ajout du commentaire' }
    }
  }

  return { comments, getComments, addComment, loading, addingComment }
}
