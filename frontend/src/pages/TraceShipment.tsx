import { useState } from 'react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'
import { useContractStore } from '../store/contractStore'
import { InvoiceStatus } from '../types'

const TraceShipment = () => {
  const { isConnected } = useWalletStore()
  const { updateStatus, myInvoices, isLoading } = useContractStore()

  const [selectedInvoice, setSelectedInvoice] = useState<string>('')
  const [nodeInfo, setNodeInfo] = useState('')
  const [action, setAction] = useState<string>('depart')

  const logisticsNodes = [
    { id: 'factory', name: '工廠出貨', icon: '🏭' },
    { id: 'port_out', name: '出口港口', icon: '🚢' },
    { id: 'customs_out', name: '出口海關', icon: '🛃' },
    { id: 'shipping', name: '海上運輸', icon: '🌊' },
    { id: 'customs_in', name: '進口海關', icon: '🛃' },
    { id: 'port_in', name: '進口港口', icon: '⚓' },
    { id: 'warehouse', name: '倉庫入庫', icon: '🏪' },
    { id: 'delivered', name: '已送達', icon: '✅' },
  ]

  const statusMap: Record<string, InvoiceStatus> = {
    depart: InvoiceStatus.InTransit,
    arrive: InvoiceStatus.InTransit,
    customs: InvoiceStatus.CustomClearance,
    delivered: InvoiceStatus.Delivered,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice || !nodeInfo) {
      toast.error('請填寫所有欄位')
      return
    }

    try {
      const status = statusMap[action]
      await updateStatus(parseInt(selectedInvoice), status, nodeInfo)
      toast.success('物流狀態更新成功！')
      setNodeInfo('')
    } catch {
      toast.error('更新失敗，請重試')
    }
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-4">需要連接錢包</h2>
        <p className="text-gray-400">請先連接 MetaMask 錢包</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        🚚 物流追蹤更新
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Update Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📍</span> 更新物流狀態
          </h2>

          {/* Select Invoice */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              選擇發票
            </label>
            <select
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
              className="input-field"
              required
            >
              <option value="">請選擇發票...</option>
              {myInvoices.map((invoice) => (
                <option key={invoice.tokenId} value={invoice.tokenId}>
                  #{invoice.tokenId} - {invoice.shipmentId}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              動作類型
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'depart', label: '離開節點', icon: '➡️' },
                { id: 'arrive', label: '抵達節點', icon: '⬇️' },
                { id: 'customs', label: '海關處理', icon: '🛃' },
                { id: 'delivered', label: '已完成', icon: '✅' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAction(item.id)}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                    action === item.id
                      ? 'bg-blue-600/30 border-blue-500 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Node Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              節點信息
            </label>
            <input
              type="text"
              value={nodeInfo}
              onChange={(e) => setNodeInfo(e.target.value)}
              placeholder="例如: 港口: 上海港, 時間: 14:30"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? '更新中...' : '🚀 更新區塊鏈'}
          </button>
        </form>

        {/* Logistics Flow */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🗺️</span> 物流節點流程
          </h2>
          <div className="space-y-3">
            {logisticsNodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-600/30 flex items-center justify-center text-xl">
                    {node.icon}
                  </div>
                  {index < logisticsNodes.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-700"></div>
                  )}
                </div>
                <div className="flex-1 p-3 bg-gray-800/50 rounded-xl">
                  <p className="font-semibold text-white">{node.name}</p>
                  <p className="text-xs text-gray-500">
                    狀態更新將記錄在區塊鏈上
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TraceShipment
