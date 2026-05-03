import { useEffect } from 'react'
import { useWalletStore } from '../store/walletStore'
import { useContractStore } from '../store/contractStore'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { isConnected, address, balance, connect } = useWalletStore()
  const { initializeContract, myInvoices, fetchMyInvoices } = useContractStore()

  useEffect(() => {
    if (isConnected) {
      initializeContract()
      fetchMyInvoices()
    }
  }, [isConnected])

  const stats = [
    {
      label: '我的發票',
      value: myInvoices.length,
      icon: '📄',
      color: 'from-blue-500 to-cyan-500',
      link: '/my-invoices',
    },
    {
      label: '融資中',
      value: myInvoices.filter((i) => i.status === 'Financing').length,
      icon: '💰',
      color: 'from-purple-500 to-pink-500',
      link: '/financing',
    },
    {
      label: '錢包餘額',
      value: `${parseFloat(balance).toFixed(4)} ETH`,
      icon: '👛',
      color: 'from-green-500 to-emerald-500',
      link: null,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            供應鏈 NFT 溯源系統
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          將物流單據鑄造為 NFT，實現不可竄改的溯源記錄，
          <br />
          並支援質押借款，解決企業短期資金週轉需求
        </p>
      </div>

      {/* Connect Wallet Prompt */}
      {!isConnected && (
        <div className="card text-center py-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            連接錢包開始使用
          </h2>
          <p className="text-gray-400 mb-6">
            連接 MetaMask 錢包，體驗 NFT 發票創建、物流追蹤與融資服務
          </p>
          <button onClick={connect} className="btn-primary text-lg px-8 py-4">
            連接錢包
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {isConnected && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.link || '#'}
                className="card group hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>⚡</span> 快速操作
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickAction
                icon="📝"
                title="創建發票"
                desc="將物流單據鑄造為 NFT"
                link="/create"
              />
              <QuickAction
                icon="🚚"
                title="更新物流"
                desc="更新貨運狀態與節點"
                link="/trace"
              />
              <QuickAction
                icon="💰"
                title="申請融資"
                desc="質押 NFT 獲取流動性"
                link="/financing"
              />
              <QuickAction
                icon="📊"
                title="查看記錄"
                desc="瀏覽所有發票歷史"
                link="/my-invoices"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📈</span> 最新活動
            </h2>
            <div className="space-y-4">
              {myInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">📭</div>
                  <p>還沒有任何發票記錄</p>
                  <p className="text-sm mt-1">創建第一張 NFT 發票開始使用</p>
                </div>
              ) : (
                myInvoices.slice(0, 5).map((invoice) => (
                  <div
                    key={invoice.tokenId}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                        📄
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          #{invoice.tokenId} - {invoice.shipmentId}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(invoice.createdAt * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      invoice.status === 'Delivered' ? 'bg-green-600/20 text-green-400' :
                      invoice.status === 'Financing' ? 'bg-purple-600/20 text-purple-400' :
                      'bg-blue-600/20 text-blue-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Flow Diagram */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🔄</span> 系統流程
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { icon: '🏭', label: '工廠' },
                { icon: '📝', label: '創建發票' },
                { icon: '🚢', label: '港口出港' },
                { icon: '🛃', label: '海關清關' },
                { icon: '🏭', label: '港口入港' },
                { icon: '🏪', label: '零售商' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-600/30 flex items-center justify-center text-2xl mb-1">
                      {step.icon}
                    </div>
                    <span className="text-sm text-gray-400">{step.label}</span>
                  </div>
                  {i < 5 && <span className="text-gray-600 text-2xl">→</span>}
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-600/20 rounded-xl border border-green-600/30">
                <span className="text-green-400">💰</span>
                <span className="text-green-400 font-semibold">
                  企業可在任意節點質押 NFT 申請流動性貸款
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const QuickAction = ({
  icon,
  title,
  desc,
  link,
}: {
  icon: string
  title: string
  desc: string
  link: string
}) => (
  <Link
    to={link}
    className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors group"
  >
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-gray-500 mt-1">{desc}</p>
  </Link>
)

export default Dashboard