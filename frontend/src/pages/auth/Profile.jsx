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


    console.log(user);

    return (
        <div className="profile"> 
            <h2 className="text-2xl font-bold mb-4">Profile</h2>

            {user && (
                <div>
                    <p>Name: {user.user.name}</p>
                    <p>Email: {user.user.email}</p>
                    <p>Role: {user.user.role}</p>
                    <p>Agency: {user.agency ? user.agency.company_name : 'N/A'}</p>
                </div>
            )}

        </div>
    );
}

export default Profile