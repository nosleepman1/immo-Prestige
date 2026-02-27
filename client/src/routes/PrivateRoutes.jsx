import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";


const PrivateRoute = ({ children }) => {


    const navigate = useNavigate()
    const { isAuthenticated } = useContext(AuthContext)

    useEffect(() => {

        if (!isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, navigate])

    return children
}

export default PrivateRoute