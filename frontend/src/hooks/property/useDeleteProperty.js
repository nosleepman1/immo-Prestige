import { AuthContext } from "@/context/AuthContext"
import { DELETE_PROPERTY } from "@/services/propertyServices"
import { useContext, useState } from "react"


const useDeleteProperty = () => {

    const { token } = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({})

    const deleteProperty = async (id) => {
        setLoading(true)
        setError({})

        try {
            const response = await DELETE_PROPERTY(id, token)
            return response.message

        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message)
            } else {
                setError('Une erreur est survenue lors de la suppression de la propriété')
            }
        } finally {
            setLoading(false)
        }
    }

    return { deleteProperty, loading, error }  
    
}

export default useDeleteProperty
