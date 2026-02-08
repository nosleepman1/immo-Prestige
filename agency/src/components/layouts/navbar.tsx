import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut, Building2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/hooks/auth/useLogout'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/', label: 'Tableau de bord' },
  { to: '/properties', label: 'Mes biens' },
  { to: '/rental-applications', label: 'Demandes' },
  { to: '/leases', label: 'Baux' },
  { to: '/installments', label: 'Échéances' },
  { to: '/owners', label: 'Propriétaires' },
  { to: '/contract-templates', label: 'Contrats' },
  { to: '/subscription', label: 'Abonnement' },
  { to: '/messages', label: 'Messagerie' },
  { to: '/account', label: 'Mon compte' },
]

const Navbar = () => {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useLogout()

  if (!isAuthenticated) return null

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center w-full flex-wrap gap-2">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 font-semibold">
          <Building2 className="size-5 text-primary" />
          ImmoPrestige Agence
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user?.name}</span>
        <Button onClick={() => logout.mutate()} variant="outline" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </nav>
  )
}

export default Navbar
