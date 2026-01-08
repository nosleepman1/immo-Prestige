
import { useContext } from 'react'
import './App.css'
import NavbarImmobilier from './components/static/navbar'
import { AppContext } from './context/AppContext'
import { ThemeProvider } from './context/themeProvider'
import AuthComponent from './pages/auth/register'
// import RealEstateCard from './components/common/card'
// import { ThemeProvider } from './context/themeProvider'
// import { ModeToggle } from './components/common/themeButton'
// import NavbarImmobilier from './components/static/navbar'
// import AuthComponent from './pages/auth/register'
// import PropertyForm from './pages/admin/addBien'
// import PropertyList from './pages/admin/showProperties'


function App() {

    const {name} = useContext(AppContext);

  

  return (

    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      < NavbarImmobilier />
      <div className='bloc mb-10 mt-10 flex justify-center'>
        <h1 className='text-3xl'>Bienvenue {name}</h1>
        <AuthComponent />
      </div>
    </ThemeProvider>

  )
}

export default App
