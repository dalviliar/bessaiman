'use client'

import { AlignLeft, AlignCenter, AlignJustify } from 'lucide-react'

export type TextAlign = 'left' | 'center' | 'justify'

const OPTIONS: { value: TextAlign; label: string; icon: typeof AlignLeft }[] = [
  { value: 'left',    label: 'По левому краю', icon: AlignLeft },
  { value: 'center',  label: 'По центру',      icon: AlignCenter },
  { value: 'justify', label: 'По ширине',      icon: AlignJustify },
]

/** Sets how a long text field is aligned once published — shown next to the
 *  textarea it controls, not applied to the raw text itself. */
export function AlignPicker({ value, onChange }: { value: string; onChange: (v: TextAlign) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Выравнивание текста:</span>
      </div>
      <div className="flex gap-1">
        {OPTIONS.map(opt => {
          const active = value === opt.value
          const Icon = opt.icon
          return (
            <button key={opt.value} type="button" title={opt.label} onClick={() => onChange(opt.value)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: active ? '#60A5FA' : 'rgba(255,255,255,0.45)',
              }}>
              <Icon size={13} />
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
