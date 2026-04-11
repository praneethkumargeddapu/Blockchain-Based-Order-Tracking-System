const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OrderTracking", function () {
  let contract;
  let owner, distributor, retailer, regulator, stranger;

  const MANUFACTURER = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
  const DISTRIBUTOR = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
  const RETAILER = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));
  const REGULATOR = ethers.keccak256(ethers.toUtf8Bytes("REGULATOR_ROLE"));

  const PRODUCT_ID = 1001;
  const HASH = "QmTestHash123456789";

  beforeEach(async function () {
    [owner, distributor, retailer, regulator, stranger] = await ethers.getSigners();
    const OrderTracking = await ethers.getContractFactory("OrderTracking");
    contract = await OrderTracking.deploy();
    await contract.waitForDeployment();
    await contract.grant_stakeholder_role(DISTRIBUTOR, distributor.address);
    await contract.grant_stakeholder_role(RETAILER, retailer.address);
    await contract.grant_stakeholder_role(REGULATOR, regulator.address);
  });

  it("should register a product", async function () {
    await expect(contract.register_product(PRODUCT_ID, HASH))
      .to.emit(contract, "ProductIsRegistered")
      .withArgs(PRODUCT_ID, owner.address);

    const product = await contract.get_product(PRODUCT_ID);
    expect(product.product_id).to.equal(PRODUCT_ID);
    expect(product.owner).to.equal(owner.address);
    expect(product.status).to.equal(0);
    expect(product.is_certified).to.equal(false);
  });

  it("should not register same product twice", async function () {
    await contract.register_product(PRODUCT_ID, HASH);
    await expect(contract.register_product(PRODUCT_ID, HASH))
      .to.be.revertedWith("Product already registered");
  });

  it("should transfer custody to distributor", async function () {
    await contract.register_product(PRODUCT_ID, HASH);
    await expect(contract.transfer_custody(PRODUCT_ID, distributor.address))
      .to.emit(contract, "CustodyIsTransferred")
      .withArgs(PRODUCT_ID, owner.address, distributor.address);

    const product = await contract.get_product(PRODUCT_ID);
    expect(product.owner).to.equal(distributor.address);
    expect(product.status).to.equal(1);
  });

  it("should update status forward", async function () {
    await contract.register_product(PRODUCT_ID, HASH);
    await contract.transfer_custody(PRODUCT_ID, distributor.address);

    await expect(contract.connect(distributor).update_status(PRODUCT_ID, 2))
      .to.emit(contract, "StatusIsUpdated")
      .withArgs(PRODUCT_ID, 2);

    const status = await contract.get_status(PRODUCT_ID);
    expect(status).to.equal(2);
  });

  it("should let regulator certify a product", async function () {
    await contract.register_product(PRODUCT_ID, HASH);
    await expect(contract.connect(regulator).certify_product(PRODUCT_ID))
      .to.emit(contract, "ProductIsCertified")
      .withArgs(PRODUCT_ID, regulator.address);

    const product = await contract.get_product(PRODUCT_ID);
    expect(product.is_certified).to.equal(true);
  });

  it("should block strangers from registering", async function () {
    await expect(
      contract.connect(stranger).register_product(PRODUCT_ID, HASH)
    ).to.be.reverted;
  });

  it("should block non-owner from transferring", async function () {
    await contract.register_product(PRODUCT_ID, HASH);
    await expect(
      contract.connect(distributor).transfer_custody(PRODUCT_ID, retailer.address)
    ).to.be.revertedWith("Only current owner can transfer");
  });

  it("should not allow status to go backward", async function () {
    await contract.register_product(PRODUCT_ID, HASH);
    await contract.transfer_custody(PRODUCT_ID, distributor.address);
    await expect(
      contract.connect(distributor).update_status(PRODUCT_ID, 0)
    ).to.be.revertedWith("Status can only move forward");
  });
});
