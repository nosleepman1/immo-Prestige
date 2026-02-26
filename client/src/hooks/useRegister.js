import {useState} from 'react'
import {REGISTER} from '../services/authServices'


export const useRegister = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const register = async (userData) => {
        setLoading(true)
        setError(null)
        setSuccess(false)
        try {
            const response = await REGISTER(userData)
            setSuccess(true)
            return response
        } catch (err) {
            // Extraire les messages d'erreur du backend
            let errorMessage = "Registration failed"
            
            console.log('Full error object:', err)
            console.log('Error response:', err.response)
            console.log('Error response data:', err.response?.data)
            
            // Essayer de parser le JSON si la réponse est du HTML mélangé avec JSON
            let errorData = err.response?.data
            
            if (typeof errorData === 'string' && errorData.includes('{')) {
                // Extraire le JSON du milieu du HTML
                const jsonMatch = errorData.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    try {
                        errorData = JSON.parse(jsonMatch[0])
                    } catch (e) {
                        console.log('Could not parse JSON from response')
                    }
                }
            }
            
            if (errorData?.errors) {
                // Erreurs de validation Laravel
                const errors = errorData.errors
                errorMessage = Object.values(errors)
                    .flat()
                    .join(', ')
            } else if (errorData?.message) {
                // Message d'erreur générique du backend
                errorMessage = errorData.message
            } else if (err.message) {
                errorMessage = err.message
            }
            
            console.log('Final error message:', errorMessage)
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return { register, loading, error, success }
}