import Navbar from "./components/Navbar"
import { ThemeProvider } from "./context/ThemeContext"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"

function App() {
  

  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<div className="p-4">Welcome to Immo Prestige</div>} />
          <Route path="/properties" element={<div className="p-4">Properties Page</div>} />
          <Route path="/agents" element={<div className="p-4">Agents Page</div>} />
          <Route path="/contact" element={<div className="p-4">Contact Page</div>} />

          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
