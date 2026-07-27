import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Flag,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/hooks/auth/useLogout'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ui/theme-toggle'

interface NavGroup {
  groupName: string
  items: {
    to: string
    label: string
    icon: React.ElementType
  }[]
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    groupName: 'Principal',
    items: [{ to: '/', label: 'Tableau de bord', icon: LayoutDashboard }],
  },
  {
    groupName: 'Supervision',
    items: [
      { to: '/agencies', label: 'Agences', icon: Building2 },
      { to: '/reports', label: 'Signalements', icon: Flag },
    ],
  },
]

/**
 * Same shell as the agency space, with the admin's own accent: a slate mark
 * instead of the emerald one, so a glance at the sidebar tells you which
 * back-office you are in.
 */
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
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-base tracking-tight font-heading">ImmoPrestige</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Ouvrir le menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/80 shadow-xs flex flex-col justify-between transition-all duration-300 ease-in-out group',
          isHovered ? 'md:w-64' : 'md:w-20',
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between h-16 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-slate-900/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div
              className={cn(
                'transition-opacity duration-200 whitespace-nowrap',
                isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0 md:hidden'
              )}
            >
              <h1 className="font-bold text-slate-900 text-sm leading-none font-heading">ImmoPrestige</h1>
              <span className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase mt-1 block">
                Super administrateur
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.groupName} className="space-y-1.5">
              <div
                className={cn(
                  'px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase transition-opacity duration-200',
                  isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0 md:hidden'
                )}
              >
                {group.groupName}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== '/' && location.pathname.startsWith(item.to))

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group/link',
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-slate-800 rounded-r-full" />
                      )}
                      <Icon
                        className={cn(
                          'w-5 h-5 shrink-0 transition-transform duration-200 group-hover/link:scale-110',
                          isActive ? 'text-slate-800' : 'text-slate-400 group-hover/link:text-slate-600'
                        )}
                      />
                      <span
                        className={cn(
                          'whitespace-nowrap transition-opacity duration-200 flex-1',
                          isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0 md:hidden'
                        )}
                      >
                        {item.label}
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-3">
          {/* Full picker once the sidebar is open; a single flip when collapsed,
              where three labels would not fit. */}
          {isHovered || isMobileOpen ? (
            <ThemeToggle />
          ) : (
            <div className="hidden md:flex justify-center">
              <ThemeToggle compact />
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div
              className={cn(
                'overflow-hidden transition-opacity duration-200 flex-1',
                isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0 md:hidden'
              )}
            >
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Administrateur'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout.mutate()}
              title="Déconnexion"
              className={cn(
                'p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0',
                !(isHovered || isMobileOpen) && 'md:hidden'
              )}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  )
}

export default SidebarLayout
