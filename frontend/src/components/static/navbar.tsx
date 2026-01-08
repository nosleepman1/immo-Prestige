import  { useState } from 'react';
import { Home, Compass, Building2, Menu, X, LogIn, Link } from 'lucide-react';
import { ModeToggle } from '../common/themeButton';



export default function NavbarImmobilier() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('accueil');

  const navLinks = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'discover', label: 'Découvrir', icon: Compass },
    { id: 'agences', label: 'Agences', icon: Building2 }
  ];

  return (
    <>
      {/* Navbar */}
     
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl transform group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ImmoPrestige
                </h1>
                <p className="text-xs -mt-1 text-gray-500 dark:text-gray-400 transition-colors">
                  Votre bien immobilier
                </p>
              </div>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeLink === link.id;
                return (
                  <Link
                    key={link.id}
                    onClick={() => setActiveLink(link.id)}
                    className={`relative px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-lg"></div>
                    )}
                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="font-medium relative z-10">{link.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              
              < ModeToggle />

              {/* Bouton Connexion */}
              <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all">
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Connexion</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay with Blur */}
      {isMenuOpen && (
        <>
          {/* Backdrop avec blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Menu Container */}
          <div className="fixed top-20 left-0 right-0 z-50 md:hidden">
            <div className="mx-4 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeLink === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveLink(link.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 text-blue-600 dark:text-blue-400 shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="font-medium text-lg">{link.label}</span>
                    </button>
                  );
                })}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    < ModeToggle />


                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all">
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium text-lg">Connexion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}