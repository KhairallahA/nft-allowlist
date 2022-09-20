const hre = require("hardhat");

async function main() {
  const factory = await hre.ethers.getContractFactory("NFTAllowlist")
  // const [owner, address1, address2] = await hre.ethers.getSigners()
  const contract = await factory.deploy()

  await contract.deployed()
  console.log("Contract deployed to: ", contract.address);
  console.log("Contract deployed by: ", owner.address);
  console.log("Address 1: ", address1.address);
  console.log("Address 2: ", address2.address, "\n");
  
  let txn

  // Add address1 to allowlist
  txn = await contract.allowlistAddresses([address1.address])
  await txn.wait()
  console.log("Address 1 added to allowlist. \n")

  // Let address1 mint presale NFTs
  console.log("Address 1 (allowlisted) is minting...")
  txn = await contract.connect(address1).preSale()
  await txn.wait()
  console.log("Address 1 minted. \n")

  // Add address2 to allowlist
  // txn = await contract.allowlistAddresses([address2.address])
  // await txn.wait()
  // console.log("Address 2 added to allowlist. \n")

  // Let address2 mint presale NFTs
  console.log("Address 2 (not allowlisted) is minting...")
  txn = await contract.connect(address2).preSale()
  await txn.wait()
  console.log()
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
