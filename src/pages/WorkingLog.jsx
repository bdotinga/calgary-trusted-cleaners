import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { FormField, Input, Select, Textarea } from '../components/FormField'
import { Plus, Pencil, Trash2, Download, Clock } from 'lucide-react'

const CAT_OPTS = ['Research','Outreach','Proposal','Admin','Meeting','Other']

const EMPTY = {
  date: '', time: '', category: 'Research', description: '', notes: '',
  funnel_hours: '', non_billable_hours: '', who: ''
}

export default function WorkingLog() {
  const { isAdmin } = useAuth()
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)

  const fetchRows = useCallback(async () => {
    const { data } = await supabase.from('working_log').select('*').order('date', { ascending: false }).order('time', { ascending: false })
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  useEffect(() => {
    const ch = supabase.channel('working_log_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'working_log' }, fetchRows)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchRows])

  function openAdd() {
    setEditing(null)
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0,5)
    setForm({ ...EMPTY, date: today, time: now })
    setModalOpen(true)
  }

  function openEdit(row) { setEditing(row); setForm({ ...row }); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.date) return
    setSaving(true)
    const payload = {
      ...form,
      funnel_hours: parseFloat(form.funnel_hours) || 0,
      non_billable_hours: parseFloat(form.non_billable_hours) || 0,
    }
    if (editing) {
      await supabase.from('working_log').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('working_log').insert(payload)
    }
    await fetchRows(); setSaving(false); closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return
    await supabase.from('working_log').delete().eq('id', id)
    fetchRows()
  }

  function exportCSV() {
    const headers = ['#','Date','Time','Category','Description','Notes','Funnel Hours','Non-Billable Hours','Who']
    const body = rows.map((r,i) => [i+1,r.date,r.time,r.category,r.description,r.notes,r.funnel_hours,r.non_billable_hours,r.who]
      .map(v => `"${(v||'').toString().replace(/"/g,'""')}"`) .join(','))
    const csv = [headers.join(','), ...body].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = 'working_log.csv'; a.click()
  }

  const totalFunnel = rows.reduce((s, r) => s + (parseFloat(r.funnel_hours) || 0), 0)
  const totalNonBil = rows.reduce((s, r) => s + (parseFloat(r.non_billable_hours) || 0), 0)

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Working Log</h1>
          <p className="text-slate-500 text-sm mt-1">Time tracking · Feb–May 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-ghost text-xs py-1.5"><Download size={13}/>CSV</button>
          {isAdmin && <button onClick={openAdd} className="btn-primary text-xs py-1.5"><Plus size={13}/>Log Hours</button>}
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg"><Clock size={16} className="text-accent"/></div>
          <div>
            <div className="text-xl font-bold text-white">{totalFunnel.toFixed(1)}</div>
            <div className="text-xs text-slate-500 font-medium">Funnel Hours</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg"><Clock size={16} className="text-slate-400"/></div>
          <div>
            <div className="text-xl font-bold text-white">{totalNonBil.toFixed(1)}</div>
            <div className="text-xs text-slate-500 font-medium">Non-Billable Hours</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 bg-teal-400/10 rounded-lg"><Clock size={16} className="text-teal-400"/></div>
          <div>
            <div className="text-xl font-bold text-white">{(totalFunnel + totalNonBil).toFixed(1)}</div>
            <div className="text-xs text-slate-500 font-medium">Total Hours</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/8">
                <tr>
                  {['#','Date','Time','Category','Description','Notes','Funnel Hrs','Non-Bill Hrs','Who',...(isAdmin?['']:[])]
                    .map(h => <th key={h} className="table-th">{h}</th>)}
                  {isAdmin && <th className="table-th w-16"></th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={10} className="table-td text-center text-slate-600 py-10">No entries yet</td></tr>
                ) : rows.map((row, i) => (
                  <tr key={row.id} className="table-row">
                    <td className="table-td text-slate-500">{i+1}</td>
                    <td className="table-td">{row.date}</td>
                    <td className="table-td">{row.time}</td>
                    <td className="table-td"><Badge value={row.category}/></td>
                    <td className="table-td max-w-[180px] truncate text-slate-200 font-medium">{row.description}</td>
                    <td className="table-td max-w-[160px] truncate">{row.notes}</td>
                    <td className="table-td text-accent font-semibold">{row.funnel_hours || 0}</td>
                    <td className="table-td text-slate-400">{row.non_billable_hours || 0}</td>
                    <td className="table-td">{row.who}</td>
                    {isAdmin && (
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-white/8 rounded-lg text-slate-500 hover:text-slate-200 transition-colors"><Pencil size={13}/></button>
                          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-danger/10 rounded-lg text-slate-500 hover:text-danger transition-colors"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {rows.length > 0 && (
                <tfoot className="border-t border-white/8 bg-navy-900/50">
                  <tr>
                    <td colSpan={6} className="table-td text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Totals</td>
                    <td className="table-td text-accent font-bold">{totalFunnel.toFixed(1)}</td>
                    <td className="table-td text-slate-400 font-bold">{totalNonBil.toFixed(1)}</td>
                    <td colSpan={isAdmin ? 2 : 1}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      <Modal title={editing ? 'Edit Log Entry' : 'Log Hours'} open={modalOpen} onClose={closeModal} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Date" required><Input type="date" value={form.date} onChange={e => setField('date', e.target.value)}/></FormField>
          <FormField label="Time"><Input type="time" value={form.time} onChange={e => setField('time', e.target.value)}/></FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={e => setField('category', e.target.value)}>
              {CAT_OPTS.map(o => <option key={o}>{o}</option>)}
            </Select>
          </FormField>
          <FormField label="Who"><Input value={form.who} onChange={e => setField('who', e.target.value)} placeholder="Name"/></FormField>
          <div className="sm:col-span-2">
            <FormField label="Description"><Input value={form.description} onChange={e => setField('description', e.target.value)} placeholder="What was done…"/></FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Notes"><Textarea value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Additional notes…"/></FormField>
          </div>
          <FormField label="Funnel Hours (Billable)"><Input type="number" step="0.25" min="0" value={form.funnel_hours} onChange={e => setField('funnel_hours', e.target.value)} placeholder="0.0"/></FormField>
          <FormField label="Non-Billable Hours"><Input type="number" step="0.25" min="0" value={form.non_billable_hours} onChange={e => setField('non_billable_hours', e.target.value)} placeholder="0.0"/></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={closeModal} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Log Entry'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
