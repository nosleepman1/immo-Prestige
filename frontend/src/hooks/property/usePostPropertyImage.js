import { STORE_IMAGE } from "@/services/propertyServices";
import { useState } from "react";



const usePostPropertyImage = () => {

    const [loadingImage, setLoading] = useState(false)
    const [errorsImage, setErrors] = useState({})
   
    
    const storeImage = async (property_id, imageFile) => {
        setErrors({})
        setLoading(true)
        try {
            const response = await STORE_IMAGE(property_id,imageFile)
            return response.message
        } catch (error) {

            if(error.response?.data?.message){
                console.log(error.response.data.message);
                setErrors(error.response.data.message)
            }else if(error.response?.data?.errors){
                console.log(error.response.data.errors);
                setErrors(error.response.data.errors)
            }else{
                console.log(error);
                setErrors('Une erreur est survenue lors de la création de l\'image')
            }
        } finally {
            setLoading(false)
        }
    }


     return {storeImage, loadingImage, errorsImage}
}

   

export default usePostPropertyImage;

