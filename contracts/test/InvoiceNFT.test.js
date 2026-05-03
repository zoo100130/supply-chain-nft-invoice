const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("InvoiceNFT Contract", function () {
  let InvoiceNFT;
  let invoiceNFT;
  let owner;
  let issuer;
  let logistics;
  let bank;
  let user;

  beforeEach(async function () {
    // 獲取測試帳戶
    [owner, issuer, logistics, bank, user] = await ethers.getSigners();

    // 部署合約
    InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
    invoiceNFT = await InvoiceNFT.deploy();

    // 授予角色
    await invoiceNFT.grantRole(ethers.id("ISSUER_ROLE"), issuer.address);
    await invoiceNFT.grantRole(ethers.id("LOGISTICS_ROLE"), logistics.address);
    await invoiceNFT.grantRole(ethers.id("BANK_ROLE"), bank.address);
  });

  describe("創建發票", function () {
    it("應該能夠創建新的發票 NFT", async function () {
      const shipmentId = "SHIP-001";
      const amount = ethers.parseEther("100");
      const maturityDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30天後
      const uri = "ipfs://QmXXXX";

      await expect(
        invoiceNFT.connect(issuer).createInvoice(
          issuer.address,
          amount,
          shipmentId,
          maturityDate,
          uri
        )
      )
        .to.emit(invoiceNFT, "InvoiceCreated")
        .withArgs(1, issuer.address, amount);

      // 驗證 NFT 所有權
      expect(await invoiceNFT.ownerOf(1)).to.equal(issuer.address);
    });
  });

  describe("更新物流狀態", function () {
    beforeEach(async function () {
      // 先創建發票
      await invoiceNFT.connect(issuer).createInvoice(
        issuer.address,
        ethers.parseEther("100"),
        "SHIP-001",
        Math.floor(Date.now() / 1000) + 86400 * 30,
        "ipfs://QmXXXX"
      );
    });

    it("應該能夠更新物流狀態", async function () {
      await expect(
        invoiceNFT.connect(logistics).updateLogisticsStatus(
          1,
          1, // InTransit
          "港口出境: 上海港"
        )
      )
        .to.emit(invoiceNFT, "StatusUpdated")
        .withArgs(1, 1, "港口出境: 上海港");

      const invoice = await invoiceNFT.getInvoice(1);
      expect(invoice.status).to.equal(1); // InTransit
    });
  });

  describe("融資功能", function () {
    beforeEach(async function () {
      // 創建並更新發票到 Delivered 狀態
      await invoiceNFT.connect(issuer).createInvoice(
        issuer.address,
        ethers.parseEther("100"),
        "SHIP-001",
        Math.floor(Date.now() / 1000) + 86400 * 30,
        "ipfs://QmXXXX"
      );

      await invoiceNFT.connect(logistics).updateLogisticsStatus(1, 3, "已送達");
    });

    it("應該能夠申請融資", async function () {
      const loanAmount = ethers.parseEther("80"); // 80% of 100

      await expect(
        invoiceNFT.connect(bank).requestFinancing(1, loanAmount)
      )
        .to.emit(invoiceNFT, "FinancingRequested")
        .withArgs(1, loanAmount);

      const invoice = await invoiceNFT.getInvoice(1);
      expect(invoice.status).to.equal(4); // Financing
    });
  });
});
