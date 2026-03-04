import React, { useState } from 'react'
import {   ButtonDialog } from '@/components/utils/Dialog'
import { PropertyCard } from '@/components/properties/PropertyCard'
import useGetProperties from '@/hooks/property/useGetProperties'
import CostumLoader from '@/components/Loader'

export default function Home() {

  const [page, setPage] = useState(1)
  const {properties, loading, error} = useGetProperties(page)



  return (
    <div className='p-5 min-h-screen bg-background text-foreground'>

      <div className='text-center'>
        <h1 className='text-3xl font-bold'>Bienvenue sur Immo Prestige</h1>
        <p className='text-lg'>La plateforme de gestion des immobilier</p>
      </div>

      <div className='flex justify-center items-center flex-wrap gap-3'>
        {
          loading ? <CostumLoader /> : properties?.data?.map(property => (
              <div 
              key={property.id}
              className='w-full md:w-1/2 lg:w-1/3 xl:w-1/4'>
                <PropertyCard property={property} />
              </div>
          ))
        }
      </div>
        
    </div>
  )
}
