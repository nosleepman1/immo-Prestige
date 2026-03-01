import { Loader } from "lucide-react"
import usePropertyTypes from "../../hooks/property/usePropertyTypes"
import { useEffect } from "react"


const PasDispo = () => {
  return (
    <div className="p-8 m-8">
      pas dispo
    </div>
  )
}
    

const PropertyForm = () => {
  const { propertyTypes, loading, errorType } = usePropertyTypes()
  
  
  useEffect(() => {
    propertyTypes
  }, [propertyTypes])
  

  return (
    <div className="p-8 m-8">
      {loading ? (
        <Loader className="animate-spin w-10 h-10" />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h1 className="text-2xl mb-4">TYPES LIST</h1>
            {errorType && <p className="text-red-500">{errorType}</p>}
            <ul>
              {(propertyTypes || []).length > 0 ? (
                propertyTypes.map((type) => (
                  <li key={type.id}>{type.name}</li>
                ))
              ) : (
                <PasDispo />  
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyForm