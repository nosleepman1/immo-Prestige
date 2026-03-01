import { useEffect, useState } from 'react'
import { PROPERTIES_TYPES } from '../../services/propertyServices'



const usePropertyTypes = () => {

    const [propertyTypes, setPropertyTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorType, setError] = useState({})


    useEffect(() => {

        const getPropertyTypes = async () => {
        
        try {
            setLoading(true)
            setError({})

            const response = await PROPERTIES_TYPES()
            setPropertyTypes(response.data)
            setLoading(false)      
            
        } catch (error) {
            if(error.response?.data?.message){
                setError(error.response.data.message)
            }else{
                setError('Une erreur est survenue lors de la récupération des types de propriétés')
            
            }
        }

    }
        getPropertyTypes()

    }, [])


    return {propertyTypes, loading, errorType}

}


export default usePropertyTypes;