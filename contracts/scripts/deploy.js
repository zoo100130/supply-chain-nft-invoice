const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying InvoiceNFT contract...");

  // 獲取部署者
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 部署合約
  const InvoiceNFT = await hre.ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();
  
  // 等待部署確認
  await invoiceNFT.waitForDeployment();
  const contractAddress = await invoiceNFT.getAddress();
  
  console.log("✅ InvoiceNFT deployed to:", contractAddress);
  
  // 驗證部署
  const totalSupply = await invoiceNFT.balanceOf(deployer.address);
  console.log("📊 Deployer NFT balance:", totalSupply.toString());

  // 保存部署信息
  console.log("\n📋 Deployment Summary:");
  console.log("====================");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Gas Used:", (await hre.ethers.provider.getTransactionReceipt(
    invoiceNFT.deploymentTransaction().hash
  )).gasUsed.toString());

  // 如果是 Sepolia 或 Polygon，自動驗證合約
  if (hre.network.name === "sepolia" || hre.network.name === "polygon") {
    console.log("\n⏳ Waiting for block confirmation...");
    await invoiceNFT.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: []
      });
      console.log("✅ Contract verified on Etherscan/Polygonscan");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
