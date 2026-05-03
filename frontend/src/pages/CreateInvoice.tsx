import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'
import { useContractStore } from '../store/contractStore'

const CreateInvoice = () => {
  const navigate = useNavigate()
  const { isConnected, address } = useWalletStore()
  const { createInvoice, isLoading, error } = useContractStore()

  const [formData, setFormData] = useState({
    shipmentId: '',
    amount: '',
    maturityDate: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error('請先連接錢包')
      return
    }

    try {
      const maturityTimestamp = Math.floor(
        new Date(formData.maturityDate).getTime() / 1000
      )
      const uri = `data:application/json,${JSON.stringify({
        description: formData.description,
        shipmentId: formData.shipmentId,
      })}`

      const tokenId = await createInvoice(
        address!,
        parseFloat(formData.amount),
        formData.shipmentId,
        maturityTimestamp,
        uri
      )

      toast.success(`發票創建成功！Token ID: #${tokenId}`)
      setTimeout(() => navigate('/my-invoices'), 2000)
    } catch (err) {
      toast.error('創建失敗，請重試')
    }
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-4">需要連接錢包</h2>
        <p className="text-gray-400">請先連接 MetaMask 錢包才能創建發票</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        📝 創建 NFT 發票
      </h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Shipment ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            物流單號 *
          </label>
          <input
            type="text"
            required
            value={formData.shipmentId}
            onChange={(e) =>
              setFormData({ ...formData, shipmentId: e.target.value })
            }
            placeholder="例如: SHIP-2024-001"
            className="input-field"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            發票金額 (ETH) *
          </label>
          <input
            type="number"
            step="0.0001"
            min="0"
            required
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="0.00"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">
            建議金額：可用於質押借款金額的 80%
          </p>
        </div>

        {/* Maturity Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            到期日 *
          </label>
          <input
            type="date"
            required
            value={formData.maturityDate}
            onChange={(e) =>
              setFormData({ ...formData, maturityDate: e.target.value })
            }
            min={new Date().toISOString().split('T')[0]}
            className="input-field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            發票描述
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="描述發票內容、货物信息等..."
            className="input-field resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
          <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <span>ℹ️</span> 創建說明
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• 發票將鑄造為 ERC-721 NFT</li>
            <li>• NFT 將轉移至您的錢包</li>
            <li>• 之後可用於質押融資</li>
            <li>• 需要支付 Gas 費用</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              區塊鏈確認中...
            </span>
          ) : (
            '🚀 創建 NFT 發票'
          )}
        </button>
      </form>
    </div>
  )
}

export default CreateInvoice
