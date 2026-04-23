import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, GitBranch, MessageSquare, Clock,
  FileText, BookUser, LogOut, ShieldCheck, Eye
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { to: '/',               label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  { to: '/pipeline',       label: 'GC Pipeline',  icon: GitBranch },
  { to: '/communications', label: 'Comm Log',     icon: MessageSquare },
  { to: '/working-log',    label: 'Working Log',  icon: Clock },
  { to: '/tenders',        label: 'Tenders',      icon: FileText },
  { to: '/contacts',       label: 'Contacts',     icon: BookUser },
]

export default function Sidebar() {
  const { signOut, isAdmin, role } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="w-64 shrink-0 bg-navy-900 border-r border-white/5 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="text-accent font-bold text-xs tracking-[0.2em] uppercase mb-0.5">Calgary Trusted</div>
        <div className="text-white font-bold text-lg leading-tight tracking-tight">Cleaners</div>
        <div className="text-slate-500 text-xs mt-0.5 tracking-widest uppercase">Sales Funnel · 2026</div>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4">
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg w-fit font-semibold
          ${isAdmin
            ? 'bg-accent/10 text-accent border border-accent/20'
            : 'bg-white/5 text-slate-400 border border-white/10'}`}>
          {isAdmin ? <ShieldCheck size={12}/> : <Eye size={12}/>}
          {isAdmin ? 'Admin' : 'Viewer'}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-accent/10 text-accent border border-accent/20'
                 : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-accent' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium
                     text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
