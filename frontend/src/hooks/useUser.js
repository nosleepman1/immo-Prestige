import { useState } from "react";
import { CURRENT_USER } from "../services/authServices";

const useUser = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const currentUser = async () => {
        setLoading(true)
        setError(null)

        await CURRENT_USER()
            .then(response => {
                setUser(response)
                console.log("Current user fetched successfully:", response)
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Failed to fetch user')
                console.error("Error fetching current user:", err)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return { user, loading, error, currentUser }
}

export default useUser