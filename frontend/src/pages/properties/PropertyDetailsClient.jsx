const { useParams } = require("react-router-dom");

const PropertyDetailsClient = () => {

    const {id} = useParams();

    alert(id);

    return (
        <div>
            <h1>Property Details Client</h1>
        </div>
    );
};


export default PropertyDetailsClient;
