import { ethers, artifacts, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying SoulboundNFT contract...");
  
  const SoulboundNFT = await ethers.getContractFactory("SoulboundNFT");
  const soulboundNFT = await SoulboundNFT.deploy();
  await soulboundNFT.deployed();
  
  console.log(`SoulboundNFT deployed to: ${soulboundNFT.address}`);

  console.log("Deploying DatingEscrow contract...");
  
  const DatingEscrow = await ethers.getContractFactory("DatingEscrow");
  const datingEscrow = await DatingEscrow.deploy(soulboundNFT.address);
  await datingEscrow.deployed();
  
  console.log(`DatingEscrow deployed to: ${datingEscrow.address}`);
  
  // Transfer ownership of SoulboundNFT to DatingEscrow
  console.log("Transferring SoulboundNFT ownership to DatingEscrow...");
  await soulboundNFT.transferOwnership(datingEscrow.address);
  
  console.log("Deployment complete!");
  
  // Get the network name
  const networkName = network.name;
  
  // Save contract addresses to frontend
  const frontendConfigPath = path.join(__dirname, "../../frontend/src/contracts/contractConfig.ts");
  
  // Create directory if it doesn't exist
  const frontendConfigDir = path.dirname(frontendConfigPath);
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  
  // Get ABIs
  const soulboundNFTArtifact = await artifacts.readArtifact("SoulboundNFT");
  const datingEscrowArtifact = await artifacts.readArtifact("DatingEscrow");
  
  const configContent = `// Auto-generated file - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}
// Network: ${networkName}

export const SOULBOUND_NFT_ADDRESS = "${soulboundNFT.address}";
export const DATING_ESCROW_ADDRESS = "${datingEscrow.address}";

export const SOULBOUND_NFT_ABI = ${JSON.stringify(soulboundNFTArtifact.abi, null, 2)};

export const DATING_ESCROW_ABI = ${JSON.stringify(datingEscrowArtifact.abi, null, 2)};

// Network configurations
export const SUPPORTED_NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorer: 'https://etherscan.io'
  },
  5: {
    name: 'Goerli Testnet',
    currency: 'GoerliETH',
    explorer: 'https://goerli.etherscan.io'
  },
  11155111: {
    name: 'Sepolia Testnet',
    currency: 'SepoliaETH',
    explorer: 'https://sepolia.etherscan.io'
  },
  31337: {
    name: 'Hardhat Local',
    currency: 'ETH',
    explorer: 'http://localhost:8545'
  }
};
`;
  
  fs.writeFileSync(frontendConfigPath, configContent);
  console.log(`Contract config saved to: ${frontendConfigPath}`);
  
  // Also save to backend for reference
  const deploymentInfo = {
    soulboundNFT: soulboundNFT.address,
    datingEscrow: datingEscrow.address,
    network: networkName,
    networkId: (await ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to deployment.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});