
import { useContext, useState, useEffect } from 'react'
import './App.css'
import NavbarImmobilier from './components/static/navbar'
import { AppContext } from './context/AppContext'
import { ThemeProvider } from './context/themeProvider'
import PropertyForm from './pages/admin/addBien'
// import RealEstateCard from './components/common/card'
// import { ThemeProvider } from './context/themeProvider'
// import { ModeToggle } from './components/common/themeButton'
// import NavbarImmobilier from './components/static/navbar'
// import AuthComponent from './pages/auth/register'

// import PropertyList from './pages/admin/showProperties'


function App() {

    //const {name} = useContext(AppContext);

  

  return (

    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      < NavbarImmobilier />
      <div className='bloc mb-10 mt-10 flex justify-center items-center mx-auto'>
    
        <div className='mt-10'>
            <PropertyForm/>
        </div>



      </div>
    </ThemeProvider>

  )
}

export default App
