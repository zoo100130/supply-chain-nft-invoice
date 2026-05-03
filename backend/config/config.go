package config

import (
	"os"
)

type Config struct {
	RPCURL         string
	ContractAddress string
	PrivateKey     string
	NetworkID      int64
	Port           string
}

func Load() *Config {
	return &Config{
		RPCURL:          getEnv("RPC_URL", "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"),
		ContractAddress: getEnv("CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000000"),
		PrivateKey:      getEnv("PRIVATE_KEY", ""),
		NetworkID:       11155111, // Sepolia testnet
		Port:            getEnv("PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
