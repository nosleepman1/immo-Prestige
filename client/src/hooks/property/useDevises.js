import { useEffect, useState } from "react"
import { DEVISES } from "../../services/propertyServices"




const useDevises = () => {

    const [devises, setDevises] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorDevise, setError] = useState({})


    useEffect(() => {
        
        const getDevises = async () => {

            try {
                const response = await DEVISES()
                setDevises(response.data)
            } catch (error) {
                if(error.response?.data?.message){
                    setError(error.response.data.message)
                }else{
                    setError('Une erreur est survenue lors de la récupération des devises')
                }   
            } finally {
                setLoading(false)
            }
        }
        getDevises()

    }, [])

    return {devises, loading, errorDevise}

}

export default useDevises;