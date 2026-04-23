// Reusable badge with color presets for Status / Relationship / Category / etc.

const STATUS_COLORS = {
  // GC Pipeline Status
  Prospecting:    'bg-slate-700/60 text-slate-300',
  Contacted:      'bg-blue-500/15 text-blue-400',
  'Bid Submitted':'bg-purple-500/15 text-purple-400',
  Active:         'bg-cyan-500/15 text-cyan-400',
  Won:            'bg-emerald-500/15 text-emerald-400',
  Lost:           'bg-red-500/15 text-red-400',
  'On Hold':      'bg-amber-500/15 text-amber-400',
  // Relationship
  Cold:           'bg-blue-500/10 text-blue-400',
  Warm:           'bg-orange-500/15 text-orange-400',
  Hot:            'bg-red-500/15 text-red-400',
  // Comm Outcome
  Positive:       'bg-emerald-500/15 text-emerald-400',
  Neutral:        'bg-slate-600/50 text-slate-400',
  'Follow-Up Required': 'bg-amber-500/15 text-amber-400',
  'No Answer':    'bg-slate-600/50 text-slate-400',
  'Left Voicemail':'bg-blue-500/10 text-blue-400',
  // Comm Type
  'Phone Call':   'bg-violet-500/15 text-violet-400',
  Email:          'bg-cyan-500/15 text-cyan-400',
  'In-Person':    'bg-emerald-500/15 text-emerald-400',
  Text:           'bg-blue-500/15 text-blue-400',
  Meeting:        'bg-amber-500/15 text-amber-400',
  // Working Log Category
  Research:       'bg-indigo-500/15 text-indigo-400',
  Outreach:       'bg-cyan-500/15 text-cyan-400',
  Proposal:       'bg-violet-500/15 text-violet-400',
  Admin:          'bg-slate-600/50 text-slate-400',
  Other:          'bg-slate-600/40 text-slate-500',
  // Tender Status
  Preparing:      'bg-amber-500/15 text-amber-400',
  Submitted:      'bg-blue-500/15 text-blue-400',
  'Under Review': 'bg-purple-500/15 text-purple-400',
  Awarded:        'bg-emerald-500/15 text-emerald-400',
  Cancelled:      'bg-slate-600/50 text-slate-400',
  // Tender Result
  Pending:        'bg-amber-500/15 text-amber-400',
  Withdrawn:      'bg-slate-600/50 text-slate-400',
  // Best Time
  Morning:        'bg-amber-500/15 text-amber-400',
  Afternoon:      'bg-orange-500/15 text-orange-400',
  Evening:        'bg-indigo-500/15 text-indigo-400',
  Anytime:        'bg-emerald-500/15 text-emerald-400',
}

export default function Badge({ value, className = '' }) {
  if (!value) return null
  const color = STATUS_COLORS[value] || 'bg-slate-700/60 text-slate-400'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${color} ${className}`}>
      {value}
    </span>
  )
}
