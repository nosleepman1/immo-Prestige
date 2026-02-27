import Navbar from "./components/Navbar"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import AddProperty from "./pages/properties/AddProperty"
import Loader from "./components/Loader"
import Profile from "./pages/auth/Profile"
import PrivateRoute from "./routes/PrivateRoutes"
import RegisterAgency from "./pages/auth/RegisterAgency"

function App() {
  

  return (
  
      <Router>
        <Navbar />

        <Routes>
          
          <Route path="/" element={<Loader />} />

          
            <Route path="/properties" element={
              <PrivateRoute>
                <div className="p-4">Properties Page</div>
              </PrivateRoute>
            } />
            
            
            <Route path="/agents" element={
              <PrivateRoute>
                <div className="p-4">Agents Page</div>
              </PrivateRoute>
            } />
            
            
            <Route path="/contact" element={<div className="p-4">Contact Page</div>} />
           
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
          
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-agency" element={<RegisterAgency />} />
        
        </Routes>
      </Router>

  )
}

export default App
