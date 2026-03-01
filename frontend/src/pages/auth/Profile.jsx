import Loader from "../../components/Loader";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

const Profile = () => {

    const {user, loading, error} = useContext(AuthContext)



    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="profile"> 
            <h2 className="text-2xl font-bold mb-4">Profile</h2>

            {user && (
                <div>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                </div>
            )}

        </div>
    );
}

export default Profile