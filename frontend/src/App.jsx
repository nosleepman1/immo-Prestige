import Navbar from "./components/Navbar"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Profile from "./pages/auth/Profile"
import PrivateRoute from "./routes/PrivateRoutes"
import RegisterAgency from "./pages/auth/RegisterAgency"
import PropertyForm from "./pages/properties/AddProperty"
import PropertiesTable from "./pages/properties/PropertiesTable"
import Home from "./pages/Home"
import PropertyDetails from "./pages/properties/PropertyDetails"

function App() {


  return (
      <Router>
        <Navbar />
       
        <Routes>
          
          <Route path="/" element={< Home />} />

          
          <Route element={<PrivateRoute />}>

            <Route path="/properties" element={<PropertiesTable />} />
            <Route path="/properties/new" element={<PropertyForm />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/properties/:id/edit" element={<div className="p-4">Edit Property Page</div>} />

            <Route path="/contact" element={<div className="p-4">Contact Page</div>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<p>About Page</p>} />


          </Route>

            
          
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-agency" element={<RegisterAgency />} />
        
        </Routes>
      </Router>

  )
}

export default App
