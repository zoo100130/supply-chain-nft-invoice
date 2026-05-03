import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore'
import { useContractStore } from '../store/contractStore'

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    Created: { bg: 'bg-blue-600/20', text: 'text-blue-400', label: '已創建' },
    InTransit: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', label: '運輸中' },
    CustomClearance: { bg: 'bg-orange-600/20', text: 'text-orange-400', label: '清關中' },
    Delivered: { bg: 'bg-green-600/20', text: 'text-green-400', label: '已送達' },
    Financing: { bg: 'bg-purple-600/20', text: 'text-purple-400', label: '融資中' },
    Repaid: { bg: 'bg-emerald-600/20', text: 'text-emerald-400', label: '已還款' },
    Defaulted: { bg: 'bg-red-600/20', text: 'text-red-400', label: '違約' },
  }

  const config = statusConfig[status] || statusConfig.Created

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) => (
  <div className="card">
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <p className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
      {value}
    </p>
  </div>
)

const MyInvoices = () => {
  const { isConnected } = useWalletStore()
  const { myInvoices, fetchMyInvoices, isLoading } = useContractStore()

  useEffect(() => {
    if (isConnected) {
      fetchMyInvoices()
    }
  }, [isConnected])

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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">📋 我的 NFT 發票</h1>
        <Link to="/create" className="btn-primary">
          + 創建新發票
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="總計"
          value={myInvoices.length}
          color="from-gray-600 to-gray-700"
        />
        <StatCard
          label="已完成"
          value={myInvoices.filter((i) => i.status === 'Delivered').length}
          color="from-green-600 to-emerald-600"
        />
        <StatCard
          label="融資中"
          value={myInvoices.filter((i) => i.status === 'Financing').length}
          color="from-purple-600 to-pink-600"
        />
        <StatCard
          label="已還款"
          value={myInvoices.filter((i) => i.status === 'Repaid').length}
          color="from-blue-600 to-cyan-600"
        />
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">載入中...</p>
        </div>
      ) : myInvoices.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-white mb-2">還沒有任何發票</h2>
          <p className="text-gray-400 mb-6">創建你的第一張 NFT 發票開始使用</p>
          <Link to="/create" className="btn-primary inline-block">
            創建發票
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myInvoices.map((invoice) => (
            <div key={invoice.tokenId} className="card hover:border-gray-600 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-600/30 flex items-center justify-center text-2xl">
                    📄
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white">
                        #{invoice.tokenId}
                      </h3>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="text-gray-400">
                      <span className="text-gray-500">物流單號:</span>{' '}
                      {invoice.shipmentId}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      創建於: {new Date(invoice.createdAt * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">發票金額</p>
                    <p className="text-2xl font-bold text-green-400">
                      {invoice.amount} ETH
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-500">到期日</p>
                    <p className="text-white">
                      {new Date(invoice.maturityDate * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Node History */}
              {invoice.nodeHistory && invoice.nodeHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">
                    📍 物流節點 ({invoice.nodeHistory.length} 個)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {invoice.nodeHistory.map((node, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                      >
                        {node}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-2">
                {invoice.status === 'Created' && (
                  <Link
                    to="/trace"
                    className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm"
                  >
                    🚚 更新物流
                  </Link>
                )}
                {(invoice.status === 'Created' || invoice.status === 'Delivered') && (
                  <Link
                    to="/financing"
                    className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                  >
                    💰 申請融資
                  </Link>
                )}
                <button
                  onClick={() => navigator.clipboard.writeText(`#${invoice.tokenId}`)}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  📋 複製
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyInvoices