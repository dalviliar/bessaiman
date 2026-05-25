'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { QrCode, Search, ArrowDown, ArrowUp, CheckCircle, XCircle, Camera, CameraOff, Package, RefreshCw } from 'lucide-react'
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
        getRecentTransactions(30),
      ])
      setItems(itemsData)
      setTransactions(txData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

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

      reader.decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
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
    const name = item.product?.[`name_${lang}` as const] || item.product?.name_ru || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode?.includes(searchQuery) || false
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title text-3xl mb-2">{tr.warehouse.title}</h1>
        <div className="h-1 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #1565C0, #00B0FF)' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scanner Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="steel-card p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <QrCode size={18} className="text-steel-accent" />
              {tr.warehouse.scanBarcode}
            </h2>

            {/* Camera view */}
            <div className="relative rounded-xl overflow-hidden bg-steel-surface border border-steel-border aspect-square">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              {cameraActive && (
                <div className="absolute inset-0">
                  <div className="absolute inset-4 border-2 border-steel-accent/60 rounded-lg" />
                  <div className="scan-line" />
                </div>
              )}
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Camera size={40} className="text-steel-border" />
                  <p className="text-steel-silver text-sm">{tr.warehouse.startCamera}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  cameraActive
                    ? 'bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/50'
                    : 'btn-primary'
                }`}
              >
                {cameraActive ? <><CameraOff size={15} />{tr.warehouse.stopCamera}</> : <><Camera size={15} />{tr.warehouse.startCamera}</>}
              </button>
            </div>

            {/* Manual barcode input */}
            <div>
              <label className="text-steel-silver text-xs mb-2 block">{tr.warehouse.manualInput}</label>
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
                  className="btn-primary px-3 py-0 flex items-center"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Scan result */}
            {scanMode === 'found' && foundItem && (
              <div className="space-y-4 border-t border-steel-border/40 pt-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle size={16} />
                  {tr.warehouse.productFound}
                </div>
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
                  <div className="text-white text-sm font-medium">
                    {foundItem.product?.[`name_${lang}` as const] || foundItem.product?.name_ru}
                  </div>
                  {foundItem.product?.model && (
                    <div className="text-steel-accent text-xs font-mono mt-0.5">{foundItem.product.model}</div>
                  )}
                  <div className="text-steel-silver text-xs mt-2">
                    {tr.warehouse.stockLevel}: <span className="text-white font-bold">{foundItem.quantity}</span>
                  </div>
                </div>

                {/* Transaction form */}
                <div className="space-y-3">
                  <div className="flex rounded-lg overflow-hidden border border-steel-border">
                    <button
                      onClick={() => setTxMode('in')}
                      className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                        txMode === 'in'
                          ? 'bg-emerald-700 text-white'
                          : 'text-steel-silver hover:bg-white/5'
                      }`}
                    >
                      <ArrowDown size={14} /> {tr.warehouse.receiveGoods}
                    </button>
                    <button
                      onClick={() => setTxMode('out')}
                      className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                        txMode === 'out'
                          ? 'bg-red-700 text-white'
                          : 'text-steel-silver hover:bg-white/5'
                      }`}
                    >
                      <ArrowUp size={14} /> {tr.warehouse.dispatchGoods}
                    </button>
                  </div>

                  <div>
                    <label className="text-steel-silver text-xs mb-1 block">{tr.warehouse.quantity}</label>
                    <input type="number" min={1} value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="steel-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-steel-silver text-xs mb-1 block">{tr.warehouse.note}</label>
                    <input type="text" value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="steel-input text-sm"
                      placeholder="..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleTransaction} className="btn-primary flex-1 text-sm py-2">
                      {tr.warehouse.confirm}
                    </button>
                    <button onClick={() => { setScanMode('idle'); setFoundItem(null); setBarcode('') }}
                      className="btn-secondary flex-1 text-sm py-2">
                      {tr.warehouse.cancel}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scanMode === 'not_found' && (
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium border-t border-steel-border/40 pt-4">
                <XCircle size={16} />
                {tr.warehouse.productNotFound}
              </div>
            )}
          </div>
        </div>

        {/* Stock Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-silver" />
              <input type="text" placeholder={tr.warehouse.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="steel-input pl-9 text-sm"
              />
            </div>
            <button onClick={loadData}
              className="steel-input w-10 h-10 flex items-center justify-center p-0 hover:border-steel-accent transition-colors">
              <RefreshCw size={15} className={`text-steel-silver ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stock list */}
          <div className="steel-card overflow-hidden">
            <div className="px-5 py-3 border-b border-steel-border/40 flex items-center gap-2 text-sm font-semibold text-white">
              <Package size={16} className="text-steel-accent" />
              {tr.warehouse.stockLevel} ({filteredItems.length})
            </div>
            {loading ? (
              <div className="p-8 text-center text-steel-silver">{tr.common.loading}</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-steel-silver">{tr.warehouse.noItems}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-steel-border/30">
                      <th className="px-5 py-3 text-left text-steel-silver font-medium">Товар</th>
                      <th className="px-5 py-3 text-left text-steel-silver font-medium">Штрих-код</th>
                      <th className="px-5 py-3 text-center text-steel-silver font-medium">{tr.warehouse.stockLevel}</th>
                      <th className="px-5 py-3 text-left text-steel-silver font-medium">{tr.warehouse.location}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, i) => (
                      <tr key={item.id}
                        className={`border-b border-steel-border/20 last:border-0 hover:bg-white/[0.02] transition-colors ${
                          i % 2 === 1 ? 'bg-white/[0.01]' : ''
                        }`}>
                        <td className="px-5 py-3">
                          <div className="text-white font-medium">
                            {item.product?.[`name_${lang}` as const] || item.product?.name_ru || '—'}
                          </div>
                          {item.product?.model && (
                            <div className="text-steel-accent text-xs font-mono">{item.product.model}</div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-steel-silver font-mono text-xs">
                          {item.barcode || '—'}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`font-bold text-base ${
                            item.quantity === 0 ? 'text-red-400' :
                            item.quantity < 3 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-steel-silver text-xs">
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
            <div className="px-5 py-3 border-b border-steel-border/40 text-sm font-semibold text-white">
              {tr.warehouse.recentTransactions}
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}
                      className="border-b border-steel-border/20 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            tx.type === 'in' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'
                          }`}>
                            {tx.type === 'in' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                          </span>
                          <div>
                            <div className="text-white text-xs">
                              {tx.product?.[`name_${lang}` as const] || tx.product?.name_ru}
                            </div>
                            {tx.note && <div className="text-steel-silver text-xs">{tx.note}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        <span className={`font-bold ${tx.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'in' ? '+' : '−'}{tx.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-steel-silver text-xs text-right">
                        {new Date(tx.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
