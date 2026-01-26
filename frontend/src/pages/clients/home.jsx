import { use, useEffect } from "react";

/**
 * Home page for clients section of the ImmoPrestige real estate app.
 * Uses Tailwind CSS for styling.
 * add fetch api to get client data (properties, profile info) and display it on the page.
 */
const Home = () => {

    // Fetch client data (properties, profile info) - placeholder for actual fetch logic
    //useEffect(() => {
        // Example fetch call (to be replaced with actual API endpoint)
        /*
        fetch('/api/client-data')
            .then(response => response.json())
            .then(data => {
                // Handle the fetched data
                console.log(data);
            })
            .catch(error => console.error('Error fetching client data:', error));
        */
    //}, []);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8">    
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Welcome to ImmoPrestige Clients</h2>
                    <p>Explore exclusive properties and manage your client profile with ease.</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">    
                    <h3 className="text-lg font-semibold mb-4">Your Properties</h3>
                    <p>List of properties will be displayed here.</p>

                </div>
            </main>
        </div>
    );
};


export default Home;