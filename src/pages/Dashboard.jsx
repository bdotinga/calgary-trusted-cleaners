import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { GitBranch, FileText, Clock, BookUser, TrendingUp } from 'lucide-react'
import Badge from '../components/Badge'
import { format, addDays, isWithinInterval, parseISO, isValid } from 'date-fns'

function StatCard({ icon: Icon, label, value, sub, accent, to }) {
  const inner = (
    <div className={`glass-card p-5 flex items-start gap-4 hover:border-accent/20 transition-colors ${accent ? 'border-accent/20' : ''}`}>
      <div className={`p-2.5 rounded-xl ${accent ? 'bg-accent/10' : 'bg-white/5'}`}>
        <Icon size={20} className={accent ? 'text-accent' : 'text-slate-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm font-medium text-slate-300 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function SectionTitle({ children }) {
  return <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{children}</h2>
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    tier1: 0, tier2: 0, tenderCount: 0, tenderValue: 0,
    funnelHours: 0, contactCount: 0
  })
  const [upcomingItems, setUpcomingItems] = useState([])
  const [recentComms, setRecentComms]     = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const now = new Date()
      const in7 = addDays(now, 7)

      const [gcRes, tenderRes, commRes, workRes, contactRes] = await Promise.all([
        supabase.from('gc_pipeline').select('tier, due_date'),
        supabase.from('tenders').select('status, est_value, bid_due_date'),
        supabase.from('communication_log').select('*').order('date', { ascending: false }).order('time', { ascending: false }).limit(5),
        supabase.from('working_log').select('funnel_hours'),
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
      ])

      const gcs     = gcRes.data     || []
      const tenders = tenderRes.data || []

      const activeTenders = tenders.filter(t => !['Awarded','Lost','Cancelled'].includes(t.status))
      const tenderValue   = tenders.reduce((s, t) => s + (parseFloat(t.est_value) || 0), 0)
      const funnelHours   = (workRes.data || []).reduce((s, r) => s + (parseFloat(r.funnel_hours) || 0), 0)

      // Upcoming due dates
      const upcoming = []
      gcs.forEach(g => {
        if (!g.due_date) return
        try {
          const d = parseISO(g.due_date)
          if (isValid(d) && isWithinInterval(d, { start: now, end: in7 }))
            upcoming.push({ label: 'GC Bid Due', date: d, type: 'gc' })
        } catch {}
      })
      tenders.forEach(t => {
        if (!t.bid_due_date) return
        try {
          const d = parseISO(t.bid_due_date)
          if (isValid(d) && isWithinInterval(d, { start: now, end: in7 }))
            upcoming.push({ label: 'Tender Due', date: d, type: 'tender' })
        } catch {}
      })
      upcoming.sort((a, b) => a.date - b.date)

      setStats({
        tier1:        gcs.filter(g => g.tier === 1).length,
        tier2:        gcs.filter(g => g.tier === 2).length,
        tenderCount:  activeTenders.length,
        tenderValue,
        funnelHours,
        contactCount: contactRes.count || 0,
      })
      setUpcomingItems(upcoming)
      setRecentComms(commRes.data || [])
      setLoading(false)
    }
    fetchAll()
  }, [])

  const fmtCur = v => '$' + Number(v).toLocaleString('en-CA', { minimumFractionDigits: 0 })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Sales funnel overview · {format(new Date(), 'MMMM d, yyyy')}</p>
      </div>

      {/* Stats row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={GitBranch}  label="Tier 1 GCs"      value={stats.tier1}                sub="Top 10 Targets"       accent to="/pipeline" />
        <StatCard icon={GitBranch}  label="Tier 2 GCs"      value={stats.tier2}                sub="Relationship Building"       to="/pipeline" />
        <StatCard icon={BookUser}   label="Contacts"         value={stats.contactCount}         sub="In directory"                to="/contacts" />
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FileText}   label="Active Tenders"   value={stats.tenderCount}          sub="Open bids"                   to="/tenders" />
        <StatCard icon={TrendingUp} label="Total Bid Value"  value={fmtCur(stats.tenderValue)}  sub="All tenders"          accent to="/tenders" />
        <StatCard icon={Clock}      label="Funnel Hours"     value={stats.funnelHours.toFixed(1)} sub="Billable hours logged"     to="/working-log" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="glass-card p-5">
          <SectionTitle>Due in the next 7 days</SectionTitle>
          {upcomingItems.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">Nothing due in the next 7 days</p>
          ) : (
            <ul className="space-y-1">
              {upcomingItems.slice(0, 8).map((item, i) => (
                <li key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.type === 'gc' ? 'bg-accent' : 'bg-amber-400'}`}/>
                  <div className="flex-1 text-sm text-slate-200">{item.label}</div>
                  <div className="text-xs text-slate-500 shrink-0">{format(item.date, 'MMM d')}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Communications */}
        <div className="glass-card p-5">
          <SectionTitle>Recent Communications</SectionTitle>
          {recentComms.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">No communications logged yet</p>
          ) : (
            <ul className="space-y-1">
              {recentComms.map(c => (
                <li key={c.id} className="py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{c.contact_name}</div>
                      <div className="text-xs text-slate-500 truncate">{c.company} · {c.type}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <Badge value={c.outcome}/>
                      <span className="text-xs text-slate-600">{c.date}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/communications" className="block text-center text-xs text-accent hover:text-accent-hover mt-3 pt-3 border-t border-white/5 transition-colors">
            View all →
          </Link>
        </div>
      </div>
    </div>
  )
}
