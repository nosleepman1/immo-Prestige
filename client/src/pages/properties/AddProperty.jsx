import { Loader } from "lucide-react"
import usePropertyTypes from "../../hooks/property/usePropertyTypes"
import useDevises from "../../hooks/property/useDevises"


const inputClass = "w-full px-3.5 py-2.5 rounded-xl input bg-transparent border border-border text-foreground text-sm"

const labelClass = "block text-sm font-medium mb-1.5 text-foreground"
    

const PropertyForm = () => {
  const { propertyTypes, loading } = usePropertyTypes()
  const {devises, loadingDevises} = useDevises()
  
  
  return (

    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background transition-colors duration-300">
      <div className="w-full max-w-2xl bg-background border border-border rounded-2xl shadow-xl dark:shadow-slate-900/60 overflow-hidden">
        
        <form className="m-4">
        
            <div>
                <label htmlFor="" className={labelClass} >Champ no1</label>
                <input type="text" className={inputClass}/>
            </div>
            <div>
                <label htmlFor="" className={labelClass} >Champ no1</label>
                <input type="text" className={inputClass}/>
            </div>
            <div>
                <label htmlFor="" className={labelClass} >Champ no1</label>
                <input type="text" className={inputClass}/>
            </div>

            <div className="py-3">
                <button className="w-full text-center btn btn-primary border-0 rounded-xl ">Enregistrer Bien</button>
            </div>
        </form>
      </div>
    </div>
  )
  
  

}

export default PropertyForm