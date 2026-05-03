package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"supply-chain-backend/config"
	"supply-chain-backend/handlers"
	"supply-chain-backend/services"
)

func main() {
	// 載入環境變數
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// 初始化配置
	cfg := config.Load()

	// 初始化區塊鏈服務
	blockchainService := services.NewBlockchainService(cfg)

	// 初始化 HTTP 處理器
	h := handlers.NewHandler(blockchainService)

	// 設置 Gin 路由
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// CORS 中間件
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 健康檢查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "Supply Chain NFT Backend",
			"version": "1.0.0",
		})
	})

	// API 路由
	api := r.Group("/api/v1")
	{
		// 發票相關
		invoices := api.Group("/invoices")
		{
			invoices.GET("", h.ListInvoices)
			invoices.GET("/:id", h.GetInvoice)
			invoices.POST("", h.CreateInvoice)
			invoices.PUT("/:id/status", h.UpdateStatus)
		}

		// 物流追蹤
		tracking := api.Group("/tracking")
		{
			tracking.GET("/:shipmentId", h.TrackShipment)
			tracking.POST("/update", h.UpdateTracking)
		}

		// 融資相關
		financing := api.Group("/financing")
		{
			financing.GET("/requests", h.ListFinancingRequests)
			financing.POST("/request", h.RequestFinancing)
			financing.POST("/repay", h.RepayLoan)
		}

		// 錢包相關
		wallet := api.Group("/wallet")
		{
			wallet.GET("/:address/balance", h.GetBalance)
			wallet.GET("/:address/invoices", h.GetWalletInvoices)
		}
	}

	// 啟動伺服器
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Supply Chain NFT Backend starting on port %s", port)
	log.Printf("📡 RPC URL: %s", cfg.RPCURL)
	log.Printf("🔗 Contract Address: %s", cfg.ContractAddress)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
