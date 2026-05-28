import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ title, open, onClose, children, wide }) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  // Outer div: plain block (NOT flex) + overflow-y:auto → reliable scroll in all browsers
  // Inner div: flex centering + min-height:100% → backdrop fills viewport even for short modals
  // Modal panel: stopPropagation so clicks inside don't bubble to the close handler
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          minHeight: '100%',
          padding: '2rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: wide ? '768px' : '560px', width: '100%' }}
          className="bg-navy-800 border border-white/10 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <h2 className="text-base font-semibold text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
