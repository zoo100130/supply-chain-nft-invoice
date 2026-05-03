package services

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"

	"supply-chain-backend/config"
	"supply-chain-backend/models"
)

type BlockchainService struct {
	client      *ethclient.Client
	contractABI abi.ABI
	contract    common.Address
}

func NewBlockchainService(cfg *config.Config) *BlockchainService {
	client, err := ethclient.Dial(cfg.RPCURL)
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to blockchain: %v", err)
		log.Printf("   Running in simulation mode without blockchain connection")
		return &BlockchainService{
			client:   nil,
			contract: common.HexToAddress(cfg.ContractAddress),
		}
	}

	contractABI := `[
		{
			"inputs": [
				{"internalType": "address", "name": "recipient", "type": "address"},
				{"internalType": "uint256", "name": "amount", "type": "uint256"},
				{"internalType": "string", "name": "shipmentId", "type": "string"},
				{"internalType": "uint256", "name": "maturityDate", "type": "uint256"},
				{"internalType": "string", "name": "uri", "type": "string"}
			],
			"name": "createInvoice",
			"outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]`

	parsedABI, err := abi.JSON(bytes.NewReader([]byte(contractABI)))
	if err != nil {
		log.Printf("⚠️ Warning: Failed to parse contract ABI: %v", err)
	}

	return &BlockchainService{
		client:      client,
		contractABI: parsedABI,
		contract:    common.HexToAddress(cfg.ContractAddress),
	}
}

func (s *BlockchainService) IsConnected() bool {
	return s.client != nil
}

func (s *BlockchainService) GetBalance(ctx context.Context, address string) (float64, error) {
	if s.client == nil {
		return 0, fmt.Errorf("blockchain not connected")
	}

	addr := common.HexToAddress(address)
	balance, err := s.client.BalanceAt(ctx, addr, nil)
	if err != nil {
		return 0, err
	}

	ethBalance := new(big.Float).SetInt(balance)
	ethBalance = new(big.Float).Quo(ethBalance, big.NewFloat(1e18))
	result, _ := ethBalance.Float64()
	return result, nil
}

func (s *BlockchainService) GetInvoice(ctx context.Context, tokenID uint64) (*models.Invoice, error) {
	if s.client == nil {
		return nil, fmt.Errorf("blockchain not connected")
	}

	data, err := s.contractABI.Pack("getInvoice", big.NewInt(int64(tokenID)))
	if err != nil {
		return nil, err
	}

	msg := ethereum.CallMsg{
		To:   &s.contract,
		Data: data,
	}

	_, err = s.client.CallContract(ctx, msg, nil)
	if err != nil {
		return nil, err
	}

	invoice := &models.Invoice{
		TokenID:      tokenID,
		Issuer:       "0x0000000000000000000000000000000000000000",
		Amount:       0,
		ShipmentID:   "",
		Status:       models.StatusCreated,
		CreatedAt:    time.Now(),
		MaturityDate: time.Now().AddDate(0, 1, 0),
	}

	return invoice, nil
}

func (s *BlockchainService) CreateInvoice(ctx context.Context, req models.CreateInvoiceRequest) (uint64, string, error) {
	simulatedID := uint64(time.Now().UnixNano() % 1000000)
	return simulatedID, "0x" + fmt.Sprintf("%064x", simulatedID), nil
}

func (s *BlockchainService) UpdateStatus(ctx context.Context, tokenID uint64, status models.InvoiceStatus, nodeInfo string) error {
	return nil
}

func (s *BlockchainService) RequestFinancing(ctx context.Context, tokenID uint64, loanAmount float64) error {
	return nil
}
