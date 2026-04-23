import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { FormField, Input, Select, Textarea } from '../components/FormField'
import { Plus, Pencil, Trash2, Download, Search } from 'lucide-react'

const TYPE_OPTS    = ['Phone Call','Email','In-Person','Text','Meeting']
const OUTCOME_OPTS = ['Positive','Neutral','Follow-Up Required','No Answer','Left Voicemail']

const EMPTY = {
  date: '', time: '', contact_name: '', company: '', type: 'Phone Call',
  outcome: 'Neutral', what_discussed: '', next_action: '', next_action_date: ''
}

export default function CommunicationLog() {
  const { isAdmin } = useAuth()
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [search, setSearch]       = useState('')

  const fetchRows = useCallback(async () => {
    const { data } = await supabase.from('communication_log').select('*')
      .order('date', { ascending: false }).order('time', { ascending: false })
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  useEffect(() => {
    const ch = supabase.channel('comm_log_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'communication_log' }, fetchRows)
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
    if (!form.contact_name.trim()) return
    setSaving(true)
    if (editing) {
      await supabase.from('communication_log').update(form).eq('id', editing.id)
    } else {
      await supabase.from('communication_log').insert(form)
    }
    await fetchRows(); setSaving(false); closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this log entry?')) return
    await supabase.from('communication_log').delete().eq('id', id)
    fetchRows()
  }

  function exportCSV() {
    const headers = ['Date','Time','Contact','Company','Type','Outcome','Discussed','Next Action','Next Action Date']
    const body = filtered.map(r => [r.date,r.time,r.contact_name,r.company,r.type,r.outcome,r.what_discussed,r.next_action,r.next_action_date]
      .map(v => `"${(v||'').toString().replace(/"/g,'""')}"`) .join(','))
    const csv = [headers.join(','), ...body].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = 'comm_log.csv'; a.click()
  }

  const q = search.toLowerCase()
  const filtered = rows.filter(r => !q || [r.contact_name, r.company, r.type, r.outcome, r.what_discussed].some(v => (v||'').toLowerCase().includes(q)))

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Communication Log</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} entries · Most recent first</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="input-base pl-8 py-1.5 w-52 text-xs"/>
          </div>
          <button onClick={exportCSV} className="btn-ghost text-xs py-1.5"><Download size={13}/>CSV</button>
          {isAdmin && <button onClick={openAdd} className="btn-primary text-xs py-1.5"><Plus size={13}/>Add Entry</button>}
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
                  {['Date','Time','Contact','Company','Type','Outcome','Discussed','Next Action','Next Action Date',...(isAdmin?['']:[])]
                    .map(h => <th key={h} className="table-th">{h}</th>)}
                  {isAdmin && <th className="table-th w-16"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="table-td text-center text-slate-600 py-10">No entries yet</td></tr>
                ) : filtered.map(row => (
                  <tr key={row.id} className="table-row">
                    <td className="table-td whitespace-nowrap">{row.date}</td>
                    <td className="table-td">{row.time}</td>
                    <td className="table-td font-medium text-slate-200">{row.contact_name}</td>
                    <td className="table-td">{row.company}</td>
                    <td className="table-td"><Badge value={row.type}/></td>
                    <td className="table-td"><Badge value={row.outcome}/></td>
                    <td className="table-td max-w-[200px] truncate" title={row.what_discussed}>{row.what_discussed}</td>
                    <td className="table-td max-w-[160px] truncate">{row.next_action}</td>
                    <td className="table-td">{row.next_action_date}</td>
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
            </table>
          </div>
        </div>
      )}

      <Modal title={editing ? 'Edit Log Entry' : 'Add Communication'} open={modalOpen} onClose={closeModal} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Date" required><Input type="date" value={form.date} onChange={e => setField('date', e.target.value)}/></FormField>
          <FormField label="Time"><Input type="time" value={form.time} onChange={e => setField('time', e.target.value)}/></FormField>
          <FormField label="Contact Name" required><Input value={form.contact_name} onChange={e => setField('contact_name', e.target.value)} placeholder="Full name"/></FormField>
          <FormField label="Company"><Input value={form.company} onChange={e => setField('company', e.target.value)} placeholder="Company"/></FormField>
          <FormField label="Type">
            <Select value={form.type} onChange={e => setField('type', e.target.value)}>
              {TYPE_OPTS.map(o => <option key={o}>{o}</option>)}
            </Select>
          </FormField>
          <FormField label="Outcome">
            <Select value={form.outcome} onChange={e => setField('outcome', e.target.value)}>
              {OUTCOME_OPTS.map(o => <option key={o}>{o}</option>)}
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="What Was Discussed"><Textarea value={form.what_discussed} onChange={e => setField('what_discussed', e.target.value)} placeholder="Summary of conversation…"/></FormField>
          </div>
          <FormField label="Next Action"><Input value={form.next_action} onChange={e => setField('next_action', e.target.value)} placeholder="Follow-up action"/></FormField>
          <FormField label="Next Action Date"><Input type="date" value={form.next_action_date} onChange={e => setField('next_action_date', e.target.value)}/></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={closeModal} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
