import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { FormField, Input, Select, Textarea } from '../components/FormField'
import { Plus, Pencil, Trash2, Download, DollarSign } from 'lucide-react'
import { addDays, parseISO, isValid, isWithinInterval } from 'date-fns'

const STATUS_OPTS = ['Preparing','Submitted','Under Review','Awarded','Lost','Cancelled']
const RESULT_OPTS = ['Pending','Won','Lost','Withdrawn']

const EMPTY = {
  project_name: '', general_contractor: '', bid_due_date: '', bid_time: '',
  est_value: '', scope: '', our_bid: '', status: 'Preparing', result: 'Pending', notes: ''
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v]))
}

export default function TenderTracker() {
  const { isAdmin } = useAuth()
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchRows = useCallback(async () => {
    const { data } = await supabase.from('tenders').select('*').order('bid_due_date', { ascending: true, nullsFirst: false })
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  useEffect(() => {
    const ch = supabase.channel('tenders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenders' }, fetchRows)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchRows])

  function openAdd() { setEditing(null); setForm(EMPTY); setSaveError(''); setModalOpen(true) }
  function openEdit(row) { setEditing(row); setForm({ ...row }); setSaveError(''); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null); setSaveError('') }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.project_name.trim()) { setSaveError('Project name is required.'); return }
    setSaving(true)
    setSaveError('')

    const payload = clean({
      ...form,
      est_value: parseFloat(form.est_value) || 0,
      our_bid:   parseFloat(form.our_bid)   || 0,
    })

    let error
    if (editing) {
      const { id, created_at, updated_at, ...rest } = payload
      ;({ error } = await supabase.from('tenders').update(rest).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('tenders').insert(payload))
    }

    if (error) { setSaveError(error.message); setSaving(false); return }
    await fetchRows(); setSaving(false); closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this tender?')) return
    await supabase.from('tenders').delete().eq('id', id)
    fetchRows()
  }

  function exportCSV() {
    const headers = ['#','Project','GC','Bid Due','Bid Time','Est Value','Scope','Our Bid','Status','Result','Notes']
    const body = rows.map((r,i) => [i+1,r.project_name,r.general_contractor,r.bid_due_date,r.bid_time,r.est_value,r.scope,r.our_bid,r.status,r.result,r.notes]
      .map(v => `"${(v||'').toString().replace(/"/g,'""')}"`) .join(','))
    const csv = [headers.join(','), ...body].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = 'tenders.csv'; a.click()
  }

  const fmtCur = v => (v != null && v !== '') ? `$${Number(v).toLocaleString('en-CA')}` : '—'
  const totalEst = rows.reduce((s, r) => s + (parseFloat(r.est_value) || 0), 0)
  const totalBid = rows.reduce((s, r) => s + (parseFloat(r.our_bid)   || 0), 0)

  const now = new Date(); const in7 = addDays(now, 7)
  function dueSoon(dateStr) {
    if (!dateStr) return false
    try { const d = parseISO(dateStr); return isValid(d) && isWithinInterval(d, { start: now, end: in7 }) } catch { return false }
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tender Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} tenders tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-ghost text-xs py-1.5"><Download size={13}/>CSV</button>
          {isAdmin && <button onClick={openAdd} className="btn-primary text-xs py-1.5"><Plus size={13}/>Add Tender</button>}
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border-accent/20 flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg"><DollarSign size={16} className="text-accent"/></div>
          <div>
            <div className="text-xl font-bold text-white">{fmtCur(totalEst)}</div>
            <div className="text-xs text-slate-500 font-medium">Total Est. Bid Value</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 bg-teal-400/10 rounded-lg"><DollarSign size={16} className="text-teal-400"/></div>
          <div>
            <div className="text-xl font-bold text-white">{fmtCur(totalBid)}</div>
            <div className="text-xs text-slate-500 font-medium">Total Our Bids</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg"><DollarSign size={16} className="text-slate-400"/></div>
          <div>
            <div className="text-xl font-bold text-white">{rows.filter(r => r.result === 'Won').length}</div>
            <div className="text-xs text-slate-500 font-medium">Tenders Won</div>
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
                  {['#','Project / Tender','General Contractor','Bid Due','Bid Time','Est. Value','Our Bid','Scope','Status','Result','Notes']
                    .map(h => <th key={h} className="table-th">{h}</th>)}
                  {isAdmin && <th className="table-th w-16"></th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={12} className="table-td text-center text-slate-600 py-10">No tenders yet</td></tr>
                ) : rows.map((row, i) => (
                  <tr key={row.id} className="table-row">
                    <td className="table-td text-slate-500">{i+1}</td>
                    <td className="table-td font-medium text-slate-200">{row.project_name}</td>
                    <td className="table-td">{row.general_contractor}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <span>{row.bid_due_date}</span>
                        {dueSoon(row.bid_due_date) && <span className="text-xs px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-full font-semibold">Due Soon</span>}
                      </div>
                    </td>
                    <td className="table-td">{row.bid_time}</td>
                    <td className="table-td font-semibold text-accent">{fmtCur(row.est_value)}</td>
                    <td className="table-td text-teal-400 font-semibold">{fmtCur(row.our_bid)}</td>
                    <td className="table-td max-w-[160px] truncate" title={row.scope}>{row.scope}</td>
                    <td className="table-td"><Badge value={row.status}/></td>
                    <td className="table-td"><Badge value={row.result}/></td>
                    <td className="table-td max-w-[140px] truncate" title={row.notes}>{row.notes}</td>
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
                    <td colSpan={5} className="table-td text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Totals</td>
                    <td className="table-td text-accent font-bold">{fmtCur(totalEst)}</td>
                    <td className="table-td text-teal-400 font-bold">{fmtCur(totalBid)}</td>
                    <td colSpan={isAdmin ? 5 : 4}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      <Modal title={editing ? 'Edit Tender' : 'Add Tender'} open={modalOpen} onClose={closeModal} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FormField label="Project / Tender Name" required>
              <Input value={form.project_name} onChange={e => setField('project_name', e.target.value)} placeholder="Project name"/>
            </FormField>
          </div>
          <FormField label="General Contractor">
            <Input value={form.general_contractor || ''} onChange={e => setField('general_contractor', e.target.value)} placeholder="GC name"/>
          </FormField>
          <FormField label="Bid Due Date">
            <Input type="date" value={form.bid_due_date || ''} onChange={e => setField('bid_due_date', e.target.value)}/>
          </FormField>
          <FormField label="Bid Time">
            <Input type="time" value={form.bid_time || ''} onChange={e => setField('bid_time', e.target.value)}/>
          </FormField>
          <FormField label="Est. Value ($)">
            <Input type="number" min="0" step="100" value={form.est_value || ''} onChange={e => setField('est_value', e.target.value)} placeholder="0.00"/>
          </FormField>
          <FormField label="Our Bid ($)">
            <Input type="number" min="0" step="100" value={form.our_bid || ''} onChange={e => setField('our_bid', e.target.value)} placeholder="0.00"/>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setField('status', e.target.value)}>
              {STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
            </Select>
          </FormField>
          <FormField label="Result">
            <Select value={form.result} onChange={e => setField('result', e.target.value)}>
              {RESULT_OPTS.map(o => <option key={o}>{o}</option>)}
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Scope of Work">
              <Textarea value={form.scope || ''} onChange={e => setField('scope', e.target.value)} placeholder="Describe the scope…"/>
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Notes">
              <Textarea value={form.notes || ''} onChange={e => setField('notes', e.target.value)} placeholder="Additional notes…"/>
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
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Tender'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
