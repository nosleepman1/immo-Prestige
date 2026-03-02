import { useContext, useState } from "react"
import { useTheme } from "../context/ThemeContext"
import { AuthContext } from "../context/AuthContext"
import { NavLink } from "react-router-dom"

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, logout, user } = useContext(AuthContext)

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Contact", href: "/contact" },
  ]


  

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground transition-colors duration-200"
      : "px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"

  return (
    <nav className="bg-white dark:bg-black border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="shrink-0">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Immo <span className=" text-amber-400 shadow-2xl">Prestige</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
           
            {navLinks.map((page) => (
              <NavLink key={page.name} to={page.href} className={navLinkClass}>
                {page.name}
              </NavLink>
            ))}

            {user?.user.role == "agency" && (
              <NavLink to="/properties" className={navLinkClass}>
                Proprietes
              </NavLink>
            )}
          </div>

          {/* Right side: theme + auth */}
          <div className="hidden md:flex items-center space-x-2">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Auth buttons */}
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  Profil
                </NavLink>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  Connexion
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-amber-500/20 transition-all duration-300"
                >
                  S'inscrire
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute w-full border-t border-border bg-background px-4 pt-3 pb-4 space-y-1">
          {navLinks.map((page) => (
            <NavLink
              key={page.name}
              to={page.href}
              onClick={() => setMenuOpen(false)}
              className={navLinkClass}
            >
              {page.name}
            </NavLink>
          ))}

          <div className="pt-2 border-t border-border flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  Profil
                </NavLink>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  Connexion
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-amber-500/20 transition-all duration-300 text-center"
                >
                  S'inscrire
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar