import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  FileText,
  FileCheck2,
  CalendarCheck2,
  Users,
  FileSignature,
  CreditCard,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/hooks/auth/useLogout'
import { cn } from '@/lib/utils'

interface NavGroup {
  groupName: string
  items: {
    to: string
    label: string
    icon: React.ElementType
    badge?: string
  }[]
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    groupName: 'Principal',
    items: [
      { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
      { to: '/properties', label: 'Mes biens', icon: Building2 },
    ],
  },
  {
    groupName: 'Gestion Locative',
    items: [
      { to: '/rental-applications', label: 'Demandes', icon: FileText },
      { to: '/leases', label: 'Baux', icon: FileCheck2 },
      { to: '/installments', label: 'Échéances', icon: CalendarCheck2 },
      { to: '/owners', label: 'Propriétaires', icon: Users },
      { to: '/contract-templates', label: 'Contrats', icon: FileSignature },
    ],
  },
  {
    groupName: 'Mon Agence',
    items: [
      { to: '/messages', label: 'Messagerie', icon: MessageSquare },
      { to: '/subscription', label: 'Abonnement', icon: CreditCard, badge: 'Pro' },
      { to: '/account', label: 'Mon compte', icon: User },
    ],
  },
]

export const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useLogout()
  const location = useLocation()

  if (!isAuthenticated) return <>{children}</>

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 antialiased">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5 font-bold text-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-base tracking-tight font-heading">ImmoPrestige</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/80 shadow-xs flex flex-col justify-between transition-all duration-300 ease-in-out group",
          // Desktop expanded on hover or collapsed width
          isHovered ? "md:w-64" : "md:w-20",
          // Mobile state
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Top Header / Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between h-16 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div className={cn("transition-opacity duration-200 whitespace-nowrap", isHovered || isMobileOpen ? "opacity-100" : "opacity-0 md:hidden")}>
              <h1 className="font-bold text-slate-900 text-sm leading-none font-heading">ImmoPrestige</h1>
              <span className="text-[11px] text-emerald-600 font-semibold tracking-wide uppercase mt-1 block">Espace Agence</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          {NAVIGATION_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              <div
                className={cn(
                  "px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase transition-opacity duration-200",
                  isHovered || isMobileOpen ? "opacity-100" : "opacity-0 md:hidden"
                )}
              >
                {group.groupName}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group/link",
                        isActive
                          ? "bg-emerald-50/80 text-emerald-700 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full" />
                      )}
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-transform duration-200 group-hover/link:scale-110",
                          isActive ? "text-emerald-600" : "text-slate-400 group-hover/link:text-slate-600"
                        )}
                      />
                      <span
                        className={cn(
                          "whitespace-nowrap transition-opacity duration-200 flex-1",
                          isHovered || isMobileOpen ? "opacity-100" : "opacity-0 md:hidden"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.badge && (isHovered || isMobileOpen) && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className={cn("overflow-hidden transition-opacity duration-200 flex-1", isHovered || isMobileOpen ? "opacity-100" : "opacity-0 md:hidden")}>
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Agence'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'agence@immoprestige.com'}</p>
            </div>
            <button
              onClick={() => logout.mutate()}
              title="Déconnexion"
              className={cn(
                "p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0",
                !(isHovered || isMobileOpen) && "md:hidden"
              )}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}

export default SidebarLayout
