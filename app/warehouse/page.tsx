'use client'

import WarehouseAuth from '@/components/WarehouseAuth'
import { useEffect, useState, useRef, useCallback } from 'react'
import {
  QrCode, Search, ArrowDown, ArrowUp, CheckCircle, XCircle,
  Camera, CameraOff, Package, RefreshCw, BarChart3, AlertTriangle,
  TrendingUp, Layers, type LucideIcon,
} from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import {
  getWarehouseItems,
  getWarehouseItemByBarcode,
  createWarehouseTransaction,
  getRecentTransactions,
} from '@/lib/supabase'
import type { WarehouseItem, WarehouseTransaction } from '@/types'

type ScanMode = 'idle' | 'scanning' | 'found' | 'not_found'
type TxMode = 'in' | 'out'

function KpiCard({
  icon: Icon, label, value, color, sub,
}: {
  icon: LucideIcon
  label: string
  value: number | string
  color: string
  sub?: string
}) {
  return (
    <div
      className="steel-card p-5 flex items-start gap-4"
      style={{ borderColor: color + '30' }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: color + '18' }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
        <p className="text-2xl font-black font-mono" style={{ color: 'white' }}>{value}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function WarehousePage() {
  const { lang, tr } = useLang()
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [barcode, setBarcode] = useState('')
  const [scanMode, setScanMode] = useState<ScanMode>('idle')
  const [foundItem, setFoundItem] = useState<WarehouseItem | null>(null)
  const [txMode, setTxMode] = useState<TxMode>('in')
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<{ reset: () => void } | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [itemsData, txData] = await Promise.all([
        getWarehouseItems(),
        getRecentTransactions(50),
      ])
      setItems(itemsData)
      setTransactions(txData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // KPI calculations
  const totalSKU = items.length
  const totalStock = items.reduce((s, i) => s + i.quantity, 0)
  const lowStock = items.filter((i) => i.quantity > 0 && i.quantity < 3).length
  const outOfStock = items.filter((i) => i.quantity === 0).length
  const today = new Date().toDateString()
  const todayTx = transactions.filter((tx) => new Date(tx.created_at).toDateString() === today).length

  const handleBarcodeSearch = useCallback(async (code: string) => {
    if (!code.trim()) return
    setScanMode('scanning')
    const item = await getWarehouseItemByBarcode(code.trim())
    if (item) {
      setFoundItem(item)
      setScanMode('found')
    } else {
      setFoundItem(null)
      setScanMode('not_found')
    }
  }, [])

  const startCamera = async () => {
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/library')
      const reader = new BrowserMultiFormatReader()
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
      }
      reader.decodeFromVideoDevice(null, videoRef.current!, (result) => {
        if (result) {
          const code = result.getText()
          setBarcode(code)
          handleBarcodeSearch(code)
          reader.reset()
          stopCamera()
        }
      })
      scannerRef.current = reader
    } catch {
      alert('Camera not available')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    scannerRef.current?.reset?.()
    setCameraActive(false)
  }

  const handleTransaction = async () => {
    if (!foundItem || qty < 1) return
    await createWarehouseTransaction({
      product_id: foundItem.product_id,
      barcode: foundItem.barcode,
      type: txMode,
      quantity: qty,
      note: note || null,
      performed_by_name: null,
    })
    setBarcode('')
    setFoundItem(null)
    setScanMode('idle')
    setQty(1)
    setNote('')
    loadData()
  }

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true
    const name = item.product?.[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || item.product?.name_ru || ''
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode?.includes(searchQuery) ?? false)
    )
  })

  return (
    <WarehouseAuth>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono tracking-widest uppercase mb-2" style={{ color: 'rgba(14,165,233,0.7)' }}>
          Bes Saiman Group
        </p>
        <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: 'white', letterSpacing: '-0.02em' }}>
          {tr.warehouse.title}
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-10 rounded-full" style={{ background: 'linear-gradient(90deg, #1565C0, #00B0FF)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Управление остатками и движением товаров
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          icon={Layers}
          label="Всего SKU"
          value={loading ? '—' : totalSKU}
          color="#0EA5E9"
          sub="уникальных позиций"
        />
        <KpiCard
          icon={BarChart3}
          label="На складе (шт.)"
          value={loading ? '—' : totalStock}
          color="#10B981"
          sub="суммарный остаток"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Мало на складе"
          value={loading ? '—' : lowStock + outOfStock}
          color={lowStock + outOfStock > 0 ? '#D97706' : '#10B981'}
          sub={outOfStock > 0 ? `${outOfStock} позиций нет` : 'всё в норме'}
        />
        <KpiCard
          icon={TrendingUp}
          label="Движений сегодня"
          value={loading ? '—' : todayTx}
          color="#8B5CF6"
          sub="приход / расход"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Scanner Panel ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="steel-card p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-white text-sm">
              <QrCode size={16} style={{ color: '#0EA5E9' }} />
              {tr.warehouse.scanBarcode}
            </h2>

            {/* Camera */}
            <div
              className="relative rounded-xl overflow-hidden aspect-square"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              {cameraActive && (
                <div className="absolute inset-0">
                  <div className="absolute inset-4 rounded-lg" style={{ border: '2px solid rgba(14,165,233,0.6)' }} />
                  <div className="scan-line" />
                </div>
              )}
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Camera size={36} style={{ color: 'rgba(255,255,255,0.12)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{tr.warehouse.startCamera}</p>
                </div>
              )}
            </div>

            <button
              onClick={cameraActive ? stopCamera : startCamera}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                cameraActive
                  ? 'bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/50'
                  : 'btn-primary'
              }`}
            >
              {cameraActive
                ? <><CameraOff size={14} />{tr.warehouse.stopCamera}</>
                : <><Camera size={14} />{tr.warehouse.startCamera}</>
              }
            </button>

            {/* Manual input */}
            <div>
              <label className="text-xs mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {tr.warehouse.manualInput}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={tr.warehouse.barcodePlaceholder}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch(barcode)}
                  className="steel-input flex-1 text-sm"
                />
                <button
                  onClick={() => handleBarcodeSearch(barcode)}
                  className="btn-primary px-3 flex items-center"
                >
                  <Search size={15} />
                </button>
              </div>
            </div>

            {/* Scan result */}
            {scanMode === 'found' && foundItem && (
              <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#34d399' }}>
                  <CheckCircle size={15} />
                  {tr.warehouse.productFound}
                </div>
                <div className="rounded-lg p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div className="text-white text-sm font-medium">
                    {foundItem.product?.[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || foundItem.product?.name_ru}
                  </div>
                  {foundItem.product?.model && (
                    <div className="font-mono text-xs mt-0.5" style={{ color: '#0EA5E9' }}>{foundItem.product.model}</div>
                  )}
                  <div className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {tr.warehouse.stockLevel}:{' '}
                    <span className="font-bold text-white">{foundItem.quantity}</span>
                  </div>
                </div>

                {/* Transaction form */}
                <div className="space-y-3">
                  <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      onClick={() => setTxMode('in')}
                      className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        txMode === 'in' ? 'bg-emerald-700 text-white' : 'text-steel-silver hover:bg-white/5'
                      }`}
                    >
                      <ArrowDown size={13} /> {tr.warehouse.receiveGoods}
                    </button>
                    <button
                      onClick={() => setTxMode('out')}
                      className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        txMode === 'out' ? 'bg-red-700 text-white' : 'text-steel-silver hover:bg-white/5'
                      }`}
                    >
                      <ArrowUp size={13} /> {tr.warehouse.dispatchGoods}
                    </button>
                  </div>

                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr.warehouse.quantity}</label>
                    <input type="number" min={1} value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="steel-input text-sm w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr.warehouse.note}</label>
                    <input type="text" value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="steel-input text-sm w-full"
                      placeholder="..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleTransaction} className="btn-primary flex-1 text-sm py-2">
                      {tr.warehouse.confirm}
                    </button>
                    <button
                      onClick={() => { setScanMode('idle'); setFoundItem(null); setBarcode('') }}
                      className="btn-secondary flex-1 text-sm py-2"
                    >
                      {tr.warehouse.cancel}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scanMode === 'not_found' && (
              <div className="flex items-center gap-2 text-sm font-medium pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: '#f87171' }}>
                <XCircle size={15} />
                {tr.warehouse.productNotFound}
              </div>
            )}
          </div>
        </div>

        {/* ── Stock table + Transactions ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Search + refresh */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input type="text" placeholder={tr.warehouse.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="steel-input pl-9 text-sm w-full"
              />
            </div>
            <button
              onClick={loadData}
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>

          {/* Stock table */}
          <div className="steel-card overflow-hidden">
            <div className="px-5 py-3 flex items-center gap-2 text-sm font-semibold text-white" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <Package size={15} style={{ color: '#0EA5E9' }} />
              {tr.warehouse.stockLevel} ({filteredItems.length})
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{tr.common.loading}</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{tr.warehouse.noItems}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Товар</th>
                      <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Штрих-код</th>
                      <th className="px-5 py-3 text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr.warehouse.stockLevel}</th>
                      <th className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr.warehouse.location}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, i) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-white/[0.025]"
                        style={{
                          borderBottom: i < filteredItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                        }}
                      >
                        <td className="px-5 py-3">
                          {/* Image placeholder slot */}
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}
                            >
                              <Package size={14} style={{ color: 'rgba(14,165,233,0.5)' }} />
                            </div>
                            <div>
                              <div className="text-white font-medium text-xs leading-snug">
                                {item.product?.[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || item.product?.name_ru || '—'}
                              </div>
                              {item.product?.model && (
                                <div className="font-mono text-[10px] mt-0.5" style={{ color: '#0EA5E9' }}>{item.product.model}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {item.barcode || '—'}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className="font-black text-base font-mono"
                            style={{
                              color: item.quantity === 0 ? '#f87171'
                                : item.quantity < 3 ? '#fbbf24'
                                : '#34d399',
                            }}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {item.location || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="steel-card overflow-hidden">
            <div className="px-5 py-3 text-sm font-semibold text-white" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {tr.warehouse.recentTransactions}
            </div>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-white/[0.025]"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: tx.type === 'in' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              color: tx.type === 'in' ? '#34d399' : '#f87171',
                            }}
                          >
                            {tx.type === 'in' ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                          </span>
                          <div>
                            <div className="text-xs text-white leading-snug">
                              {tx.product?.[`name_${lang}` as 'name_ru' | 'name_kk' | 'name_en'] || tx.product?.name_ru}
                            </div>
                            {tx.note && (
                              <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{tx.note}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        <span className="font-bold font-mono text-sm" style={{ color: tx.type === 'in' ? '#34d399' : '#f87171' }}>
                          {tx.type === 'in' ? '+' : '−'}{tx.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {new Date(tx.created_at).toLocaleString('ru-RU', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Движений пока нет
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </WarehouseAuth>
  )
}
