import { useState } from 'react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'
import { useContractStore } from '../store/contractStore'

const Financing = () => {
  const { isConnected, address } = useWalletStore()
  const { requestFinancing, myInvoices, isLoading } = useContractStore()

  const [selectedInvoice, setSelectedInvoice] = useState<string>('')
  const [loanAmount, setLoanAmount] = useState('')

  const availableInvoices = myInvoices.filter(
    (i) => i.status === 'Delivered' || i.status === 'Created'
  )

  const selected = availableInvoices.find(
    (i) => i.tokenId.toString() === selectedInvoice
  )
  const maxLoan = selected ? (selected.amount * 80) / 100 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice || !loanAmount) {
      toast.error('請填寫所有欄位')
      return
    }

    const amount = parseFloat(loanAmount)
    if (amount > maxLoan) {
      toast.error(`借款金額不能超過 ${maxLoan} ETH (80% 發票金額)`)
      return
    }

    try {
      await requestFinancing(parseInt(selectedInvoice), amount)
      toast.success('融資申請已提交！')
      setSelectedInvoice('')
      setLoanAmount('')
    } catch {
      toast.error('申請失敗，請重試')
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        💰 申請流動性融資
      </h1>

      <div className="card space-y-6">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-600/30">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💡</span> 融資說明
          </h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              可借款金額為發票價值的 80%
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              NFT 作為質押品，無需傳統信用審查
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              還款後 NFT 自動解除質押
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              還款期限為發票到期日
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Invoice */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              選擇 NFT 發票
            </label>
            <select
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
              className="input-field"
              required
            >
              <option value="">請選擇可質押的發票...</option>
              {availableInvoices.map((invoice) => (
                <option key={invoice.tokenId} value={invoice.tokenId}>
                  #{invoice.tokenId} - {invoice.shipmentId} ({invoice.amount} ETH)
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Details */}
          {selected && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-2">發票詳情</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Token ID:</span>
                  <span className="ml-2 text-white">#{selected.tokenId}</span>
                </div>
                <div>
                  <span className="text-gray-500">發票金額:</span>
                  <span className="ml-2 text-green-400">
                    {selected.amount} ETH
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">到期日:</span>
                  <span className="ml-2 text-white">
                    {new Date(selected.maturityDate * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">最大可借:</span>
                  <span className="ml-2 text-yellow-400">{maxLoan} ETH</span>
                </div>
              </div>
            </div>
          )}

          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              借款金額 (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              max={maxLoan}
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder={`最高 ${maxLoan} ETH`}
              className="input-field"
              required
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>最低: 0.01 ETH</span>
              <span>最高: {maxLoan} ETH (80%)</span>
            </div>
            {/* Slider */}
            <input
              type="range"
              min="0"
              max={maxLoan}
              step="0.01"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full mt-3 accent-blue-500"
            />
          </div>

          {/* Fee Preview */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4">
            <h3 className="text-yellow-400 font-semibold mb-2">📊 費用預覽</h3>
            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>借款金額:</span>
                <span>{loanAmount || 0} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>預估利息 (5%):</span>
                <span>{(parseFloat(loanAmount || '0') * 0.05).toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between text-white font-semibold pt-2 border-t border-gray-700">
                <span>到期還款總額:</span>
                <span className="text-red-400">
                  {(parseFloat(loanAmount || '0') * 1.05).toFixed(4)} ETH
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedInvoice}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50"
          >
            {isLoading ? '提交中...' : '🚀 提交融資申請'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Financing
