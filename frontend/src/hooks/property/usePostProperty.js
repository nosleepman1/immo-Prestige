import { STORE_PROPERTY } from "@/services/propertyServices"
import { useState } from "react"



const usePostProperty = () => {

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})


    const newProperty = async (formData, token) => {
        setErrors({})
        setLoading(true)

        try {
            const response = await STORE_PROPERTY(formData, token)
            console.log(response);
            return response.data.id
            
            
            
        } catch (error) {
            if(error.response?.data?.message){
                console.log(error.response.data.message);
                setErrors(error.response.data.message)
            }else if(error.response?.data?.errors){
                console.log(error.response.data.errors);
                setErrors(error.response.data.errors)
            }else{
                console.log(error);
                setErrors('Une erreur est survenue lors de la création de la propriété')
            }
        } finally {
            setLoading(false)
        }
    }

    return {newProperty, loading, errors}

}

export default usePostProperty;