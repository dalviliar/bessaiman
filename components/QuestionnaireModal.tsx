'use client'

import { useRef, useState } from 'react'
import { X, ClipboardCheck, Loader2, CheckCircle, Paperclip } from 'lucide-react'
import type { Product } from '@/types'
import { useLang } from '@/context/LanguageContext'

interface Props {
  product: Product
  onClose: () => void
}

interface Form {
  full_name: string
  company: string
  position: string
  phone: string
  email: string
}

export default function QuestionnaireModal({ product, onClose }: Props) {
  const { tr } = useLang()
  const k = tr.kpForm
  const [form, setForm] = useState<Form>({ full_name: '', company: '', position: '', phone: '', email: '' })
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) { setError(k.qErrRequired); return }
    if (!file) { setError(k.qErrFile); return }
    setStatus('loading'); setError('')
    try {
      const fd = new FormData()
      fd.append('product_id', product.id)
      fd.append('product_name', product.name_ru)
      fd.append('full_name', form.full_name.trim())
      fd.append('company', form.company.trim())
      fd.append('position', form.position.trim())
      fd.append('phone', form.phone.trim())
      fd.append('email', form.email.trim())
      fd.append('file', file)
      const res = await fetch('/api/questionnaire-submit', { method: 'POST', body: fd })
      const isJson = res.headers.get('content-type')?.includes('application/json')
      const data = isJson ? await res.json() : null
      if (!res.ok) throw new Error(data?.error || k.qErrSend)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : k.qErrSend)
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#0C1424', border: '1px solid rgba(26,74,138,0.35)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,74,138,0.25)' }}>
              <ClipboardCheck size={15} style={{ color: '#4A90D9' }} />
            </div>
            <div>
              <p className="text-white font-semibold text-base">{k.qTitle}</p>
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{product.model || product.name_ru}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5">
            <X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        {status === 'done' ? (
          <div className="px-6 py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle size={32} style={{ color: '#34d399' }} />
            </div>
            <p className="text-white font-semibold text-lg">{k.qSent}</p>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>{k.qSentDesc}</p>
            <button onClick={onClose} className="btn-primary mt-2">{k.close}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {k.qIntro}
            </p>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{k.qFullName}</label>
              <input type="text" value={form.full_name} onChange={set('full_name')} placeholder={k.namePlaceholder} className="steel-input w-full" required />
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{k.company}</label>
              <input type="text" value={form.company} onChange={set('company')} placeholder={k.companyPlaceholder} className="steel-input w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{k.qPosition}</label>
                <input type="text" value={form.position} onChange={set('position')} className="steel-input w-full" />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{k.phone}</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+7 (7xx) xxx-xx-xx" className="steel-input w-full" />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="email@company.kz" className="steel-input w-full" required />
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{k.qFile}</label>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-2 justify-center py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px dashed rgba(59,130,246,0.35)' }}>
                <Paperclip size={14} /> {file ? file.name : k.qAttach}
              </button>
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </div>

            {(status === 'error' || error) && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error || k.qErrSend}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={status === 'loading'} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {status === 'loading' ? (<><Loader2 size={15} className="animate-spin" /> {k.qSending}</>) : (<><ClipboardCheck size={15} /> {k.qSend}</>)}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary px-4">{k.cancel}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
