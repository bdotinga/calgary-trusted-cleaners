import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'

export default function Header() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    // Global search navigates to pipeline with query param for now
    if (query.trim()) {
      navigate(`/pipeline?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="h-14 bg-navy-900 border-b border-white/5 flex items-center px-6 gap-4 sticky top-0 z-30">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="text"
            placeholder="Search pipeline, contacts, tenders…"
            className="w-full bg-navy-800 border border-white/8 rounded-lg pl-9 pr-4 py-1.5 text-sm
                       text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent/50
                       focus:ring-1 focus:ring-accent/20 transition-colors"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>
      </form>
      <div className="ml-auto flex items-center gap-3">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        <span className="text-xs text-slate-500">Live Sync</span>
      </div>
    </header>
  )
}
