const {ethers} =require("hardhat");
async function main(){
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance));
  const OrderTracking = await ethers.getContractFactory("OrderTracking");
  const contract = await OrderTracking.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
}
main()
.then(() => process.exit(0))
.catch((error) =>{
  console.error(error);
  process.exit(1);
});
