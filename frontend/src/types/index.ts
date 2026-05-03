export enum InvoiceStatus {
  Created = 'Created',
  InTransit = 'InTransit',
  CustomClearance = 'CustomClearance',
  Delivered = 'Delivered',
  Financing = 'Financing',
  Repaid = 'Repaid',
  Defaulted = 'Defaulted',
}

export interface Invoice {
  tokenId: number
  issuer: string
  amount: number
  shipmentId: string
  status: InvoiceStatus
  nodeHistory: LogisticsNode[]
  createdAt: number
  maturityDate: number
  uri?: string
}

export interface LogisticsNode {
  nodeId: string
  nodeName: string
  location: string
  timestamp: number
  status: 'departure' | 'arrival' | 'customs'
  txHash: string
}

export interface FinancingRequest {
  tokenId: number
  loanAmount: number
  interestRate: number
  duration: number
  status: 'pending' | 'approved' | 'rejected' | 'repaid'
}

export interface ShipmentUpdate {
  shipmentId: string
  nodeId: string
  nodeName: string
  location: string
  action: 'depart' | 'arrive' | 'customs_clearance'
  timestamp: number
}

export interface ContractConfig {
  address: string
  chainId: number
  networkName: string
}
