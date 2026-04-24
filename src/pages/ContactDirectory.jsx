import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { FormField, Input, Select, Textarea } from '../components/FormField'
import { Plus, Pencil, Trash2, Download, Search, Mail, Phone } from 'lucide-react'

const TIME_OPTS = ['Morning','Afternoon','Evening','Anytime']

const EMPTY = {
  name: '', title: '', company: '', office_phone: '', mobile: '', email: '',
  best_time: 'Anytime', last_contact_date: '', next_followup: '', notes: ''
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v]))
}

export default function ContactDirectory() {
  const { isAdmin } = useAuth()
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')
  const [search, setSearch]       = useState('')

  const fetchRows = useCallback(async () => {
    const { data } = await supabase.from('contacts').select('*').order('name')
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  useEffect(() => {
    const ch = supabase.channel('contacts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, fetchRows)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchRows])

  function openAdd() { setEditing(null); setForm(EMPTY); setSaveError(''); setModalOpen(true) }
  function openEdit(row) { setEditing(row); setForm({ ...row }); setSaveError(''); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null); setSaveError('') }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.name.trim()) { setSaveError('Name is required.'); return }
    setSaving(true)
    setSaveError('')

    let error
    if (editing) {
      const { id, created_at, updated_at, ...rest } = form
      ;({ error } = await supabase.from('contacts').update(clean(rest)).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('contacts').insert(clean(form)))
    }

    if (error) { setSaveError(error.message); setSaving(false); return }
    await fetchRows(); setSaving(false); closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this contact?')) return
    await supabase.from('contacts').delete().eq('id', id)
    fetchRows()
  }

  function exportCSV() {
    const headers = ['#','Name','Title','Company','Office Phone','Mobile','Email','Best Time','Last Contact','Next Follow-Up','Notes']
    const body = filtered.map((r,i) => [i+1,r.name,r.title,r.company,r.office_phone,r.mobile,r.email,r.best_time,r.last_contact_date,r.next_followup,r.notes]
      .map(v => '"' + (v||'').toString().replace(/"/g,'""') + '"').join(','))
    const csv = [headers.join(','), ...body].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = 'contacts.csv'; a.click()
  }

  const q = search.toLowerCase()
  const filtered = rows.filter(r => !q || [r.name,r.title,r.company,r.email,r.mobile,r.office_phone].some(v=>(v||'').toLowerCase().includes(q)))

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contact Directory</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
              className="input-base pl-8 py-1.5 w-52 text-xs"/>
          </div>
          <button onClick={exportCSV} className="btn-ghost text-xs py-1.5"><Download size={13}/>CSV</button>
          {isAdmin && <button onClick={openAdd} className="btn-primary text-xs py-1.5"><Plus size={13}/>Add Contact</button>}
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
                  {['#','Name','Title','Company','Office Phone','Mobile','Email','Best Time','Last Contact','Next Follow-Up','Notes']
                    .map(h => <th key={h} className="table-th">{h}</th>)}
                  {isAdmin && <th className="table-th w-16"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={12} className="table-td text-center text-slate-600 py-10">
                    {rows.length === 0 ? 'No contacts yet. Add your first contact.' : 'No results for that search.'}
                  </td></tr>
                ) : filtered.map((row, i) => (
                  <tr key={row.id} className="table-row">
                    <td className="table-td text-slate-500">{i+1}</td>
                    <td className="table-td font-semibold text-slate-200">{row.name}</td>
                    <td className="table-td text-slate-400">{row.title}</td>
                    <td className="table-td">{row.company}</td>
                    <td className="table-td">
                      {row.office_phone && (
                        <a href={"tel:" + row.office_phone} className="flex items-center gap-1 text-slate-300 hover:text-accent transition-colors">
                          <Phone size={11}/>{row.office_phone}
                        </a>
                      )}
                    </td>
                    <td className="table-td">
                      {row.mobile && (
                        <a href={"tel:" + row.mobile} className="flex items-center gap-1 text-slate-300 hover:text-accent transition-colors">
                          <Phone size={11}/>{row.mobile}
                        </a>
                      )}
                    </td>
                    <td className="table-td">
                      {row.email && (
                        <a href={"mailto:" + row.email} className="flex items-center gap-1 text-accent hover:text-accent-hover transition-colors">
                          <Mail size={11}/>{row.email}
                        </a>
                      )}
                    </td>
                    <td className="table-td"><Badge value={row.best_time}/></td>
                    <td className="table-td">{row.last_contact_date}</td>
                    <td className="table-td">{row.next_followup}</td>
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
            </table>
          </div>
        </div>
      )}

      <Modal title={editing ? 'Edit Contact' : 'Add Contact'} open={modalOpen} onClose={closeModal} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Name" required>
            <Input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Full name"/>
          </FormField>
          <FormField label="Title / Role">
            <Input value={form.title || ''} onChange={e => setField('title', e.target.value)} placeholder="Project Manager, VP..."/>
          </FormField>
          <FormField label="Company">
            <Input value={form.company || ''} onChange={e => setField('company', e.target.value)} placeholder="Company name"/>
          </FormField>
          <FormField label="Best Time to Call">
            <Select value={form.best_time} onChange={e => setField('best_time', e.target.value)}>
              {TIME_OPTS.map(o => <option key={o}>{o}</option>)}
            </Select>
          </FormField>
          <FormField label="Office Phone">
            <Input type="tel" value={form.office_phone || ''} onChange={e => setField('office_phone', e.target.value)} placeholder="(403) 000-0000"/>
          </FormField>
          <FormField label="Mobile">
            <Input type="tel" value={form.mobile || ''} onChange={e => setField('mobile', e.target.value)} placeholder="(403) 000-0000"/>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Email">
              <Input type="email" value={form.email || ''} onChange={e => setField('email', e.target.value)} placeholder="email@company.com"/>
            </FormField>
          </div>
          <FormField label="Last Contact Date">
            <Input type="date" value={form.last_contact_date || ''} onChange={e => setField('last_contact_date', e.target.value)}/>
          </FormField>
          <FormField label="Next Follow-Up">
            <Input type="date" value={form.next_followup || ''} onChange={e => setField('next_followup', e.target.value)}/>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Notes">
              <Textarea value={form.notes || ''} onChange={e => setField('notes', e.target.value)} placeholder="Notes about this contact..."/>
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
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Contact'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
