# Supply Chain NFT Invoice System

供應鏈發票 NFT 化 + 融資質押系統

## 專案背景

這個專案是課堂區塊鏈應用的期末報告主題。將物流單據鑄造成 NFT，實現不可竄改的溯源記錄，企業可拿 NFT 單據申請短期流動性貸款。

## 主要功能

- 創建 NFT 發票（鑄造到區塊鏈）
- 物流狀態追蹤（區塊鏈上記錄每個節點）
- 質押 NFT 申請融資
- 查看錢包餘額與交易歷史

## 技術架構

```
前端：React + TypeScript + Vite + TailwindCSS
後端：Go + Gin
區塊鏈：Solidity + Hardhat + OpenZeppelin
```

## 快速啟動

### 前端
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### 後端
```bash
cd backend
go mod download
go run main.go
# http://localhost:8080
```

### 合約部署
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## 環境設定

建立 `.env` 檔案：

```env
# contracts/.env
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=deployed_address

# frontend/.env.local
VITE_CONTRACT_ADDRESS=deployed_address
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

## 資料夾結構

```
01_supply_chain_nft/
├── frontend/           # React 前端
│   ├── src/
│   │   ├── pages/     # 各頁面元件
│   │   ├── store/     # Zustand 狀態管理
│   │   └── types/     # TypeScript 類型定義
├── backend/            # Go 後端 API
│   ├── handlers/       # HTTP 處理函式
│   ├── models/         # 資料模型
│   └── services/      # 區塊鏈服務
├── contracts/         # Solidity 合約
│   ├── contracts/      # 合約原始碼
│   └── scripts/        # 部署腳本
```

## 授權

MIT License
