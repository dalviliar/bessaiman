'use client'

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/77011013433"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в WhatsApp"
      className="fixed z-50 flex items-center justify-center transition-all duration-200 group"
      style={{
        bottom: 24,
        right: 24,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#25D366,#128C7E)',
        boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(37,211,102,0.55)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(37,211,102,0.4)'
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.096.54 4.07 1.487 5.785L0 24l6.374-1.467A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 01-5.003-1.373l-.36-.213-3.713.855.884-3.612-.233-.372A9.796 9.796 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
      </svg>

      {/* Pulse ring */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          animation: 'wa-pulse 2s ease-out infinite',
          background: 'rgba(37,211,102,0.35)',
        }}
      />

      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1); opacity: 0.7 }
          70%  { transform: scale(1.6); opacity: 0 }
          100% { transform: scale(1.6); opacity: 0 }
        }
      `}</style>
    </a>
  )
}
