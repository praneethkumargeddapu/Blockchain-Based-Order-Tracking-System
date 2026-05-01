const {expect} = require("chai");
const {ethers} = require("hardhat");

// A set of test cases for the OrderTracking smart contract
describe("OrderTracking", function(){
  let contract,owner, distributor, retailer, regulator, unknown;
  // These role hashes should match what exactly used in the contract
  const MANUFACTURER = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
  const DISTRIBUTOR = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
  const RETAILER = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));
  const REGULATOR = ethers.keccak256(ethers.toUtf8Bytes("REGULATOR_ROLE"));
  const product_id = 1001;
  const test_hash = "test_hash_1234";

  // This function deploys a fresh contract for every test. It assigns roles to the test wallets. Owner wallet gets all the roles automatically from the constructor.
  beforeEach(async function(){
    [owner, distributor, retailer, regulator, unknown] = await ethers.getSigners();
    const OrderTracking = await ethers.getContractFactory("OrderTracking");
    contract = await OrderTracking.deploy();
    await contract.waitForDeployment();
    await contract.grant_stakeholder_role(DISTRIBUTOR, distributor.address);
    await contract.grant_stakeholder_role(RETAILER, retailer.address);
    await contract.grant_stakeholder_role(REGULATOR, regulator.address);
  });

  // This test verifies that a manufacturer can register a product checking if the corresponding event is emitted or not.
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

  // This test makes sure that a prduct cannot be registered twice.
  it("should not register same product twice", async function(){
    await contract.register_product(product_id, test_hash);
    await expect(contract.register_product(product_id, test_hash))
    .to.be.revertedWith("Product already registered");
  });

  // This test verifies that the custody is transferred from manufacturer to the distributor. Also makes sure that the status of the product is automatically changed to "Shipped"
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

  // This test verifies that the current owner of the product can change the status of the product to "out for delivery" or "delivered"
  it("should update status forward", async function(){
    await contract.register_product(product_id, test_hash);
    await contract.transfer_custody(product_id, distributor.address);
    await expect(contract.connect(distributor).update_status(product_id, 2))
    .to.emit(contract, "StatusIsUpdated")
    .withArgs(product_id, 2);
    const cur_status = await contract.get_status(product_id);
    expect(cur_status).to.equal(2);
  });

  // This test makes sure that only an account with regulator role can certify a product
  it("should let regulator certify a product", async function(){
    await contract.register_product(product_id, test_hash);
    await expect(contract.connect(regulator).certify_product(product_id))
      .to.emit(contract, "ProductIsCertified")
      .withArgs(product_id, regulator.address);
    const product = await contract.get_product(product_id);
    const p_certified = product.is_certified;
    expect(p_certified).to.equal(true);
  });

  // This test verifies that the accounts without manufacturer role cannot register a product
  it("should block strangers from registering", async function(){
    await expect(
      contract.connect(unknown).register_product(product_id, test_hash)
    ).to.be.reverted;
  });

  // This test verifies that only the current owner can transfer the ownership of the product
  it("should block non-owner from transferring", async function(){
    await contract.register_product(product_id, test_hash);
    await expect(
      contract.connect(distributor).transfer_custody(product_id, retailer.address)
    ).to.be.revertedWith("Only current owner can transfer");
  });

  // This test makes sure that the status of a product cannot go backward
  it("should not allow status to go backward", async function(){
    await contract.register_product(product_id, test_hash);
    await contract.transfer_custody(product_id, distributor.address);
    await expect(
      contract.connect(distributor).update_status(product_id, 0)
    ).to.be.revertedWith("Status can only move forward");
  });
});
