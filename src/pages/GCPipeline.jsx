import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { FormField, Input, Select, Textarea } from '../components/FormField'
import { Plus, Pencil, Trash2, Download, Search } from 'lucide-react'
import { parseISO, isValid, addDays, isWithinInterval } from 'date-fns'

const STATUS_OPTS = ['Prospecting','Contacted','Bid Submitted','Active','Won','Lost','On Hold']
const REL_OPTS    = ['Cold','Warm','Hot']

const EMPTY = {
  tier: 1, company: '', address: '', phone: '', email: '', key_contact: '',
  status: 'Prospecting', relationship: 'Cold', active_tender: '', due_date: '', notes: ''
}

// Convert empty strings to null so PostgreSQL date/time columns don't reject them
function clean(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v]))
}

function GCRow({ row, num, onEdit, onDelete, isAdmin }) {
  const now = new Date()
  const in7 = addDays(now, 7)
  let dueSoon = false
  if (row.due_date) {
    try {
      const d = parseISO(row.due_date)
      dueSoon = isValid(d) && isWithinInterval(d, { start: now, end: in7 })
    } catch {}
  }

  return (
    <tr className="table-row">
      <td className="table-td text-slate-500 w-8">{num}</td>
      <td className="table-td font-medium text-slate-200">{row.company}</td>
      <td className="table-td hidden xl:table-cell">{row.address}</td>
      <td className="table-td hidden lg:table-cell">{row.phone}</td>
      <td className="table-td hidden lg:table-cell">{row.email && <a href={`mailto:${row.email}`} className="text-accent hover:underline">{row.email}</a>}</td>
      <td className="table-td">{row.key_contact}</td>
      <td className="table-td"><Badge value={row.status} /></td>
      <td className="table-td"><Badge value={row.relationship} /></td>
      <td className="table-td hidden xl:table-cell truncate max-w-[160px]">{row.active_tender}</td>
      <td className="table-td">
        <div className="flex items-center gap-1.5">
          {row.due_date && <span className="text-xs">{row.due_date}</span>}
          {dueSoon && <span className="text-xs px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-full font-semibold">Due Soon</span>}
        </div>
      </td>
      {isAdmin && (
        <td className="table-td">
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(row)} className="p-1.5 hover:bg-white/8 rounded-lg text-slate-500 hover:text-slate-200 transition-colors"><Pencil size={13}/></button>
            <button onClick={() => onDelete(row.id)} className="p-1.5 hover:bg-danger/10 rounded-lg text-slate-500 hover:text-danger transition-colors"><Trash2 size={13}/></button>
          </div>
        </td>
      )}
    </tr>
  )
}

export default function GCPipeline() {
  const { isAdmin } = useAuth()
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')
  const [search, setSearch]       = useState('')
  const [searchParams]            = useSearchParams()

  useEffect(() => {
    const q = searchParams.get('search')
    if (q) setSearch(q)
  }, [])

  const fetchRows = useCallback(async () => {
    const { data } = await supabase.from('gc_pipeline').select('*').order('tier').order('sort_order')
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  useEffect(() => {
    const channel = supabase.channel('gc_pipeline_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gc_pipeline' }, fetchRows)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchRows])

  function openAdd(tier) {
    setEditing(null)
    setForm({ ...EMPTY, tier })
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({ ...row })
    setSaveError('')
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null); setSaveError('') }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.company.trim()) { setSaveError('Company name is required.'); return }
    setSaving(true)
    setSaveError('')

    let error
    if (editing) {
      const { id, created_at, updated_at, ...rest } = form
      ;({ error } = await supabase.from('gc_pipeline').update(clean(rest)).eq('id', editing.id))
    } else {
      const tier_rows = rows.filter(r => r.tier === form.tier)
      ;({ error } = await supabase.from('gc_pipeline').insert(clean({ ...form, sort_order: tier_rows.length + 1 })))
    }

    if (error) {
      setSaveError(error.message)
      setSaving(false)
      return
    }

    await fetchRows()
    setSaving(false)
    closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this GC entry?')) return
    await supabase.from('gc_pipeline').delete().eq('id', id)
    fetchRows()
  }

  function exportCSV() {
    const headers = ['#','Tier','Company','Address','Phone','Email','Key Contact','Status','Relationship','Active Tender','Due Date','Notes']
    const body = filtered.map((r,i) => [i+1,r.tier,r.company,r.address,r.phone,r.email,r.key_contact,r.status,r.relationship,r.active_tender,r.due_date,r.notes].map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(','))
    const csv = [headers.join(','), ...body].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}))
    a.download = 'gc_pipeline.csv'; a.click()
  }

  const q = search.toLowerCase()
  const filtered = rows.filter(r =>
    !q || [r.company, r.address, r.key_contact, r.email, r.phone, r.active_tender, r.notes].some(v => (v||'').toLowerCase().includes(q))
  )
  const tier1 = filtered.filter(r => r.tier === 1)
  const tier2 = filtered.filter(r => r.tier === 2)

  const TierSection = ({ tier, data, label }) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Tier {tier}</span>
          <h2 className="text-base font-semibold text-slate-200 mt-0.5">{label}</h2>
        </div>
        {isAdmin && (
          <button onClick={() => openAdd(tier)} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={13}/> Add GC
          </button>
        )}
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/8">
              <tr>
                {['#','Company','Address','Phone','Email','Key Contact','Status','Relationship','Active Tender','Due Date']
                  .map(h => <th key={h} className="table-th">{h}</th>)}
                {isAdmin && <th className="table-th w-16"></th>}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={12} className="table-td text-center text-slate-600 py-10">No entries yet</td></tr>
              ) : data.map((row, i) => (
                <GCRow key={row.id} row={row} num={i+1} onEdit={openEdit} onDelete={handleDelete} isAdmin={isAdmin} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 max-w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">GC Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} General Contractors · {tier1.length} Tier 1 · {tier2.length} Tier 2</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="input-base pl-8 py-1.5 w-52 text-xs" />
          </div>
          <button onClick={exportCSV} className="btn-ghost text-xs py-1.5"><Download size={13}/>CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <>
          <TierSection tier={1} data={tier1} label="Active Bid List | Top 10 Target GCs" />
          <div className="border-t border-white/5 my-2" />
          <TierSection tier={2} data={tier2} label="Accepting Invites | Relationship Building" />
        </>
      )}

      <Modal title={editing ? 'Edit GC Entry' : 'Add GC Entry'} open={modalOpen} onClose={closeModal} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Tier" required>
            <Select value={form.tier} onChange={e => setField('tier', parseInt(e.target.value))}>
              <option value={1}>Tier 1 — Top 10 Targets</option>
              <option value={2}>Tier 2 — Relationship Building</option>
            </Select>
          </FormField>
          <FormField label="Company / Developer" required>
            <Input value={form.company} onChange={e => setField('company', e.target.value)} placeholder="Company name" />
          </FormField>
          <FormField label="Address">
            <Input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Address" />
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="(403) 000-0000" />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="email@company.com" />
          </FormField>
          <FormField label="Key Contact">
            <Input value={form.key_contact} onChange={e => setField('key_contact', e.target.value)} placeholder="Contact name" />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setField('status', e.target.value)}>
              {STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
            </Select>
          </FormField>
          <FormField label="Relationship">
            <Select value={form.relationship} onChange={e => setField('relationship', e.target.value)}>
              {REL_OPTS.map(o => <option key={o}>{o}</option>)}
            </Select>
          </FormField>
          <FormField label="Active Tender / Project">
            <Input value={form.active_tender} onChange={e => setField('active_tender', e.target.value)} placeholder="Project name" />
          </FormField>
          <FormField label="Due Date">
            <Input type="date" value={form.due_date || ''} onChange={e => setField('due_date', e.target.value)} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Notes">
              <Textarea value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Notes…" />
            </FormField>
          </div>
        </div>
        {saveError && (
          <div className="mt-4 bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-2.5 rounded-lg">
            {saveError}
          </div>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={closeModal} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add GC'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
