//nice homme pae for immoilier app with tailwind css
const Home = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow">
                <div className="container mx-auto px-4 py-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">ImmoPrestige</h1>
                    <nav>
                        <ul className="flex space-x-4">
                            <li><a href="/home" className="text-gray-700 hover:text-blue-500">Home</a></li>
                            <li><a href="/properties" className="text-gray-700 hover:text-blue-500">Properties</a></li>
                            <li><a href="/about" className="text-gray-700 hover:text-blue-500">About</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Welcome to ImmoPrestige</h2>
                    <p>Find your dream property with our premium real estate services.</p>
                </div>
            </main>
        </div>
    );
};