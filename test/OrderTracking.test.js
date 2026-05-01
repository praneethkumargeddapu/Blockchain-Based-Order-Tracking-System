const {expect} = require("chai");
const {ethers} = require("hardhat");
describe("OrderTracking", function(){
  let contract,owner, distributor, retailer, regulator, unknown;
  const MANUFACTURER = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
  const DISTRIBUTOR = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
  const RETAILER = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));
  const REGULATOR = ethers.keccak256(ethers.toUtf8Bytes("REGULATOR_ROLE"));
  const product_id = 1001;
  const test_hash = "test_hash_1234";
  beforeEach(async function(){
    [owner, distributor, retailer, regulator, unknown] = await ethers.getSigners();
    const OrderTracking = await ethers.getContractFactory("OrderTracking");
    contract = await OrderTracking.deploy();
    await contract.waitForDeployment();
    await contract.grant_stakeholder_role(DISTRIBUTOR, distributor.address);
    await contract.grant_stakeholder_role(RETAILER, retailer.address);
    await contract.grant_stakeholder_role(REGULATOR, regulator.address);
  });
  it("should register a product", async function(){
    await expect(contract.register_product(product_id, test_hash))
    .to.emit(contract, "ProductIsRegistered")
    .withArgs(product_id, owner.address);
    const product = await contract.get_product(product_id);
    const pid = product.product_id;
    const p_owner = product.owner;
    const p_status = product.status;
    const p_certified = product.is_certified;
    expect(pid).to.equal(product_id);
    expect(p_owner).to.equal(owner.address);
    expect(p_status).to.equal(0);
    expect(p_certified).to.equal(false);
  });
  it("should not register same product twice", async function(){
    await contract.register_product(product_id, test_hash);
    await expect(contract.register_product(product_id, test_hash))
    .to.be.revertedWith("Product already registered");
  });
  it("should transfer custody to distributor", async function(){
    await contract.register_product(product_id, test_hash);
    await expect(contract.transfer_custody(product_id, distributor.address))
    .to.emit(contract, "CustodyIsTransferred")
    .withArgs(product_id, owner.address, distributor.address);
    const product = await contract.get_product(product_id);
    const p_owner = product.owner;
    const p_status = product.status;
    expect(p_owner).to.equal(distributor.address);
    expect(p_status).to.equal(1);
  });
  it("should update status forward", async function(){
    await contract.register_product(product_id, test_hash);
    await contract.transfer_custody(product_id, distributor.address);
    await expect(contract.connect(distributor).update_status(product_id, 2))
    .to.emit(contract, "StatusIsUpdated")
    .withArgs(product_id, 2);
    const cur_status = await contract.get_status(product_id);
    expect(cur_status).to.equal(2);
  });
  it("should let regulator certify a product", async function(){
    await contract.register_product(product_id, test_hash);
    await expect(contract.connect(regulator).certify_product(product_id))
      .to.emit(contract, "ProductIsCertified")
      .withArgs(product_id, regulator.address);
    const product = await contract.get_product(product_id);
    const p_certified = product.is_certified;
    expect(p_certified).to.equal(true);
  });
  it("should block strangers from registering", async function(){
    await expect(
      contract.connect(unknown).register_product(product_id, test_hash)
    ).to.be.reverted;
  });
  it("should block non-owner from transferring", async function(){
    await contract.register_product(product_id, test_hash);
    await expect(
      contract.connect(distributor).transfer_custody(product_id, retailer.address)
    ).to.be.revertedWith("Only current owner can transfer");
  });
  it("should not allow status to go backward", async function(){
    await contract.register_product(product_id, test_hash);
    await contract.transfer_custody(product_id, distributor.address);
    await expect(
      contract.connect(distributor).update_status(product_id, 0)
    ).to.be.revertedWith("Status can only move forward");
  });
});
