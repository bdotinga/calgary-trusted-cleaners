// Reusable form field wrapper
export function FormField({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

export function Input({ ...props }) {
  return <input className="input-base" {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className="input-base" {...props}>
      {children}
    </select>
  )
}

export function Textarea({ ...props }) {
  return <textarea className="input-base resize-y min-h-[80px]" {...props} />
}
