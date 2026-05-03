package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"supply-chain-backend/models"
	"supply-chain-backend/services"
)

type Handler struct {
	blockchain *services.BlockchainService
}

func NewHandler(blockchain *services.BlockchainService) *Handler {
	return &Handler{blockchain: blockchain}
}

func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "Supply Chain NFT Backend",
	})
}

func (h *Handler) ListInvoices(c *gin.Context) {
	invoices := []models.Invoice{
		{
			TokenID:    1001,
			Issuer:     "0x1234...abcd",
			Amount:     50.5,
			ShipmentID: "SHIP-2024-001",
			Status:     models.StatusDelivered,
		},
		{
			TokenID:    1002,
			Issuer:     "0x5678...efgh",
			Amount:     120.0,
			ShipmentID: "SHIP-2024-002",
			Status:     models.StatusFinancing,
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    invoices,
	})
}

func (h *Handler) GetInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 64)

	invoice := &models.Invoice{
		TokenID:    id,
		Issuer:     "0x742d35Cc6634C0532925a3b844Bc9e7595f2dE12",
		Amount:     50.5,
		ShipmentID: "SHIP-2024-" + idStr,
		Status:     models.StatusInTransit,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    invoice,
	})
}

func (h *Handler) CreateInvoice(c *gin.Context) {
	var req models.CreateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	tokenID, txHash, err := h.blockchain.CreateInvoice(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to create invoice",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: models.CreateInvoiceResponse{
			TokenID: tokenID,
			TxHash:  txHash,
			Message: "Invoice created successfully",
		},
	})
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	var req models.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Status updated successfully",
		Data: gin.H{
			"tokenId":   req.TokenID,
			"newStatus": models.InvoiceStatus(req.Status).String(),
		},
	})
}

func (h *Handler) TrackShipment(c *gin.Context) {
	shipmentID := c.Param("shipmentId")

	nodes := []models.LogisticsNode{
		{
			NodeID:    "factory-001",
			NodeName:  "工廠",
			Location:  "深圳",
			Action:    "departure",
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: gin.H{
			"shipmentId":    shipmentID,
			"nodes":         nodes,
			"currentStatus": "InTransit",
		},
	})
}

func (h *Handler) UpdateTracking(c *gin.Context) {
	var req struct {
		ShipmentID string `json:"shipmentId" binding:"required"`
		NodeID     string `json:"nodeId" binding:"required"`
		NodeName   string `json:"nodeName" binding:"required"`
		Location   string `json:"location" binding:"required"`
		Action     string `json:"action" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Tracking updated successfully",
		Data: gin.H{
			"shipmentId": req.ShipmentID,
		},
	})
}

func (h *Handler) ListFinancingRequests(c *gin.Context) {
	requests := []models.FinancingRequest{
		{
			ID:           1,
			TokenID:      1001,
			Lender:       "0xBank...001",
			Borrower:     "0xUser...123",
			LoanAmount:   40.0,
			InterestRate: 5.0,
			Status:       "approved",
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    requests,
	})
}

func (h *Handler) RequestFinancing(c *gin.Context) {
	var req models.FinancingRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Financing request submitted",
		Data: gin.H{
			"requestId": 12345,
			"status":    "pending",
		},
	})
}

func (h *Handler) RepayLoan(c *gin.Context) {
	var req models.RepayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Loan repaid successfully",
	})
}

func (h *Handler) GetBalance(c *gin.Context) {
	address := c.Param("address")

	if h.blockchain.IsConnected() {
		balance, err := h.blockchain.GetBalance(c.Request.Context(), address)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to get balance",
			})
			return
		}
		c.JSON(http.StatusOK, models.APIResponse{
			Success: true,
			Data: gin.H{
				"address": address,
				"balance": balance,
			},
		})
	} else {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: true,
			Data: gin.H{
				"address": address,
				"balance": 0.0,
				"note":    "Running in simulation mode",
			},
		})
	}
}

func (h *Handler) GetWalletInvoices(c *gin.Context) {
	address := c.Param("address")

	invoices := []models.Invoice{
		{
			TokenID:    1001,
			Issuer:     address,
			Amount:     50.5,
			ShipmentID: "SHIP-2024-001",
			Status:     models.StatusDelivered,
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    invoices,
	})
}
