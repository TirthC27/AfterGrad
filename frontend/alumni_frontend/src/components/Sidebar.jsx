import React from 'react'
import {
  Home, Calendar, Users, Briefcase, Heart, TrendingUp,
  Settings, LogOut, Menu
} from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Dashboard', key: 'dashboard' },
  { icon: Calendar, label: 'Events', key: 'events' },
  { icon: Users, label: 'Mentorship', key: 'mentorship' },
  { icon: Briefcase, label: 'Gigs', key: 'gigs' },
  { icon: Heart, label: 'Donations', key: 'donations' },
  { icon: TrendingUp, label: 'Fundraising', key: 'fundraising' },
  { icon: Settings, label: 'Settings', key: 'settings' },
]

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse }) {
  return (
    <aside
      className={`
        sticky top-0 h-screen flex flex-col
        bg-[var(--glass-bg)] backdrop-blur-[20px]
        border-r border-[var(--glass-border)]
        transition-all duration-300 ease-out overflow-hidden
        animate-[slideInLeft_0.4s_ease]
        ${collapsed ? 'w-[68px] px-3 py-7' : 'w-[200px] px-4 py-7'}
      `}
    >
      {/* Header / Toggle */}
      <div
        onClick={onToggleCollapse}
        role="button"
        tabIndex={0}
        className={`
          flex items-center gap-3 mb-9 rounded-xl cursor-pointer select-none
          transition-colors duration-200 hover:bg-[rgba(134,239,172,0.1)]
          ${collapsed ? 'justify-center px-0' : 'px-2'}
        `}
      >
        <Menu size={20} className="text-[var(--text-primary)] shrink-0" />
        {!collapsed && (
          <span className="text-base font-semibold text-[var(--text-primary)]">Menu</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={item.label}
              className={`
                flex items-center gap-3 rounded-xl border-none cursor-pointer
                text-sm font-[inherit] whitespace-nowrap
                transition-all duration-200 ease-out
                ${collapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}
                ${isActive
                  ? 'bg-[var(--mint-400)] text-white shadow-[0_4px_16px_rgba(74,222,128,0.3)]'
                  : 'bg-transparent text-[var(--text-muted)] hover:bg-[rgba(134,239,172,0.1)] hover:text-[var(--text-secondary)]'
                }
              `}
            >
              <span className="flex items-center shrink-0"><Icon size={20} /></span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        title="Log out"
        className={`
          flex items-center gap-3 rounded-xl border-none bg-transparent
          cursor-pointer text-[var(--text-muted)] text-sm font-[inherit]
          transition-all duration-200 whitespace-nowrap
          hover:text-red-500 hover:bg-[rgba(231,76,60,0.05)]
          ${collapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}
        `}
      >
        <LogOut size={20} className="shrink-0" />
        {!collapsed && <span>Log out</span>}
      </button>
    </aside>
  )
}
