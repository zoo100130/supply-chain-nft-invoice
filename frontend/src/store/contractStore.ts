import { create } from 'zustand'
import { ethers } from 'ethers'
import { useWalletStore } from './walletStore'
import { Invoice, InvoiceStatus, LogisticsNode, FinancingRequest } from '../types'

// 合約 ABI
const INVOICE_NFT_ABI = [
  'function createInvoice(address recipient, uint256 amount, string shipmentId, uint256 maturityDate, string uri) external returns (uint256)',
  'function updateLogisticsStatus(uint256 tokenId, uint8 newStatus, string nodeInfo) external',
  'function requestFinancing(uint256 tokenId, uint256 loanAmount) external',
  'function getInvoice(uint256 tokenId) external view returns (tuple(uint256 tokenId, address issuer, uint256 amount, string shipmentId, uint8 status, uint256 createdAt, uint256 maturityDate))',
  'function getNodeHistory(uint256 tokenId) external view returns (string[] memory)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'event InvoiceCreated(uint256 indexed tokenId, address indexed issuer, uint256 amount)',
  'event StatusUpdated(uint256 indexed tokenId, uint8 newStatus, string node)',
]

// 測試網部署地址 (待部署後替換)
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'

interface ContractState {
  contract: ethers.Contract | null
  invoices: Invoice[]
  myInvoices: Invoice[]
  isLoading: boolean
  error: string | null
  
  initializeContract: () => Promise<void>
  createInvoice: (recipient: string, amount: number, shipmentId: string, maturityDate: number, uri: string) => Promise<string>
  updateStatus: (tokenId: number, status: InvoiceStatus, nodeInfo: string) => Promise<void>
  requestFinancing: (tokenId: number, loanAmount: number) => Promise<void>
  fetchMyInvoices: () => Promise<void>
  fetchAllInvoices: () => Promise<void>
}

export const useContractStore = create<ContractState>((set, get) => ({
  contract: null,
  invoices: [],
  myInvoices: [],
  isLoading: false,
  error: null,

  initializeContract: async () => {
    const { signer } = useWalletStore.getState()
    if (!signer) {
      set({ error: '請先連接錢包' })
      return
    }

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, INVOICE_NFT_ABI, signer)
      set({ contract, error: null })
      console.log('合約初始化成功:', CONTRACT_ADDRESS)
    } catch (error) {
      console.error('合約初始化失敗:', error)
      set({ error: '合約初始化失敗' })
    }
  },

  createInvoice: async (recipient, amount, shipmentId, maturityDate, uri) => {
    const { contract } = get()
    if (!contract) throw new Error('合約未初始化')

    set({ isLoading: true, error: null })
    try {
      const amountWei = ethers.parseEther(amount.toString())
      const tx = await contract.createInvoice(recipient, amountWei, shipmentId, maturityDate, uri)
      const receipt = await tx.wait()
      
      // 從事件中獲取 tokenId
      const event = receipt.logs.find((log: ethers.Log) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'InvoiceCreated'
        } catch {
          return false
        }
      })
      
      const tokenId = event ? contract.interface.parseLog(event).args[0] : 0
      
      set({ isLoading: false })
      return tokenId.toString()
    } catch (error) {
      set({ isLoading: false, error: '創建發票失敗' })
      throw error
    }
  },

  updateStatus: async (tokenId, status, nodeInfo) => {
    const { contract } = get()
    if (!contract) throw new Error('合約未初始化')

    set({ isLoading: true, error: null })
    try {
      const tx = await contract.updateLogisticsStatus(tokenId, status, nodeInfo)
      await tx.wait()
      set({ isLoading: false })
      await get().fetchMyInvoices()
    } catch (error) {
      set({ isLoading: false, error: '更新狀態失敗' })
      throw error
    }
  },

  requestFinancing: async (tokenId, loanAmount) => {
    const { contract } = get()
    if (!contract) throw new Error('合約未初始化')

    set({ isLoading: true, error: null })
    try {
      const amountWei = ethers.parseEther(loanAmount.toString())
      const tx = await contract.requestFinancing(tokenId, amountWei)
      await tx.wait()
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: '申請融資失敗' })
      throw error
    }
  },

  fetchMyInvoices: async () => {
    const { contract } = useWalletStore.getState()
    const address = useWalletStore.getState().address
    if (!contract || !address) return

    set({ isLoading: true })
    try {
      // 這裡需要調用合約的查詢方法獲取用戶的發票
      // 實際實現時需要根據合約設計調整
      const invoices: Invoice[] = []
      set({ myInvoices: invoices, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: '獲取發票失敗' })
    }
  },

  fetchAllInvoices: async () => {
    set({ isLoading: true })
    // 實現獲取所有發票邏輯
    set({ isLoading: false })
  },
}))
