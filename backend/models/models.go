package models

import (
	"time"
)

// InvoiceStatus 發票狀態枚舉
type InvoiceStatus int

const (
	StatusCreated InvoiceStatus = iota
	StatusInTransit
	StatusCustomClearance
	StatusDelivered
	StatusFinancing
	StatusRepaid
	StatusDefaulted
)

func (s InvoiceStatus) String() string {
	names := []string{
		"Created",
		"InTransit",
		"CustomClearance",
		"Delivered",
		"Financing",
		"Repaid",
		"Defaulted",
	}
	if s >= 0 && int(s) < len(names) {
		return names[s]
	}
	return "Unknown"
}

// Invoice NFT 發票結構
type Invoice struct {
	TokenID      uint64        `json:"tokenId"`
	Issuer       string        `json:"issuer"`
	Amount       float64       `json:"amount"`
	ShipmentID   string        `json:"shipmentId"`
	Status       InvoiceStatus `json:"status"`
	NodeHistory  []string      `json:"nodeHistory"`
	CreatedAt    time.Time     `json:"createdAt"`
	MaturityDate time.Time     `json:"maturityDate"`
	URI          string        `json:"uri,omitempty"`
}

// LogisticsNode 物流節點
type LogisticsNode struct {
	NodeID      string    `json:"nodeId"`
	NodeName    string    `json:"nodeName"`
	Location    string    `json:"location"`
	Action      string    `json:"action"` // departure, arrival, customs
	Timestamp   time.Time `json:"timestamp"`
	TxHash      string    `json:"txHash"`
}

// FinancingRequest 融資請求
type FinancingRequest struct {
	ID          uint64    `json:"id"`
	TokenID     uint64    `json:"tokenId"`
	Lender      string    `json:"lender"`
	Borrower    string    `json:"borrower"`
	LoanAmount  float64   `json:"loanAmount"`
	InterestRate float64  `json:"interestRate"`
	Status      string    `json:"status"` // pending, approved, rejected, repaid
	CreatedAt   time.Time `json:"createdAt"`
	DueDate     time.Time `json:"dueDate"`
}

// API 請求/回應結構

type CreateInvoiceRequest struct {
	Recipient    string  `json:"recipient" binding:"required"`
	Amount       float64 `json:"amount" binding:"required,gt=0"`
	ShipmentID   string  `json:"shipmentId" binding:"required"`
	MaturityDate int64   `json:"maturityDate" binding:"required"`
	Description  string  `json:"description"`
}

type CreateInvoiceResponse struct {
	TokenID uint64 `json:"tokenId"`
	TxHash  string `json:"txHash"`
	Message string `json:"message"`
}

type UpdateStatusRequest struct {
	TokenID uint64 `json:"tokenId" binding:"required"`
	Status  int    `json:"status" binding:"required,min=0,max=6"`
	NodeInfo string `json:"nodeInfo" binding:"required"`
}

type FinancingRequestBody struct {
	TokenID    uint64  `json:"tokenId" binding:"required"`
	LoanAmount float64 `json:"loanAmount" binding:"required,gt=0"`
}

type RepayRequest struct {
	TokenID uint64 `json:"tokenId" binding:"required"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

type PaginatedResponse struct {
	Success    bool        `json:"success"`
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalCount int64       `json:"totalCount"`
}
