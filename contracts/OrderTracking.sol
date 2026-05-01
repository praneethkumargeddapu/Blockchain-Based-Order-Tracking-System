// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// We used OpenZeppelin Access Control to handle role-based permissions, so that, only certain roles can perform certain operations. For example, only accounts with regulator role can certify a product.
import "@openzeppelin/contracts/access/AccessControl.sol";

//OrderTracking inherits this AccessControl to manage all the roles of the stakeholders.
contract OrderTracking is AccessControl{
    bytes32 public constant MANUFACTURER = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER = keccak256("RETAILER_ROLE");
    bytes32 public constant REGULATOR = keccak256("REGULATOR_ROLE");

    // The stages a product goes through in the supply chain is represented by status, which tells the current status of the product.
    enum Status {Created, Shipped, Stored, Delivered}
    // This struct contains all the information of a product such as, product_id, current owner of the product, Ipfs hash of the uploaded invoice, if the product is certified, if the product actually exists. 
    struct Product{
        uint256 product_id;
        address owner;
        Status status;
        string hash_number;
        bool is_certified;
        bool exists;
    }

    mapping(uint256 => Product) public products;

    // events that are emitted when the state of the product is changed in the supply chain.
    event ProductIsRegistered(uint256 product_id, address manufacturer);
    event CustodyIsTransferred(uint256 product_id, address from, address to);
    event StatusIsUpdated(uint256 product_id, Status new_status);
    event ProductIsCertified(uint256 product_id, address regulator);

    // constructor to grant all roles to the deployer to  manage the system.
    constructor(){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER, msg.sender);
        _grantRole(DISTRIBUTOR, msg.sender);
        _grantRole(RETAILER, msg.sender);
        _grantRole(REGULATOR, msg.sender);
    }

    // This modifier checks if a prodcut actually has been registered or not before trying any operation on it.
    modifier product_exists(uint256 product_id){
        require(products[product_id].exists, "Product does not exist");
        _;
    }

    // register_product creates a new product and adds it to the blockchain. Only accounts with Manufacturer role can perform this operation.
    function register_product(uint256 product_id, string calldata hash) external onlyRole(MANUFACTURER) {
        require(!products[product_id].exists, "Product already registered");
        require(bytes(hash).length > 0, "Hash cannot be empty");
        products[product_id] = Product({
            product_id: product_id,
            owner: msg.sender,
            status: Status.Created,
            hash_number: hash,
            is_certified: false,
            exists: true
        });
        emit ProductIsRegistered(product_id, msg.sender);
    }

    // Transfer_custody transfers the ownership of the product from the current owner to the next owner in the supply chain. When the ownership of a product is transferred from Manufacturer, the status of the product automatically changes to shipped.
    function transfer_custody(uint256 product_id, address new_owner) external product_exists(product_id) {
        Product storage i = products[product_id];
        require(i.owner == msg.sender, "Only current owner can transfer");
        require(new_owner != address(0), "Invalid address");
        require(new_owner != msg.sender, "Cannot transfer to yourself");
        address previous_owner = i.owner;
        i.owner = new_owner;
        if (i.status == Status.Created) {
            i.status = Status.Shipped;
            emit StatusIsUpdated(product_id, Status.Shipped);
        }
        emit CustodyIsTransferred(product_id, previous_owner, new_owner);
    }

    // Update_status allows the current owner of the product to update the staus of the product like out for delivery, delivered. Once the status is updated, the owner cannot revert the change.
    function update_status(uint256 product_id, Status new_status) external product_exists(product_id){
        Product storage i = products[product_id];
        require(i.owner == msg.sender, "Only current owner can update status");
        require(uint8(new_status) > uint8(i.status), "Status can only move forward");

        i.status = new_status;
        emit StatusIsUpdated(product_id, new_status);
    }

    // Certify_product allows the accounts with regulator role to certify the authenticity of a product.
    function certify_product(uint256 product_id) external product_exists(product_id) onlyRole(REGULATOR){
        Product storage i = products[product_id];
        require(!i.is_certified, "Already certified");
        i.is_certified = true;
        emit ProductIsCertified(product_id, msg.sender);
    }

    // Get_product is used to retrieve all the details of a product using the Product Id
    function get_product(uint256 product_id) external view product_exists(product_id) returns (Product memory){
        return products[product_id];
    }

    // Get_status is used to find the current status of the product.
    function get_status(uint256 product_id) external view product_exists(product_id) returns (Status) {
        return products[product_id].status;
    }

    // Grant_stakeholder_role allows the admin to assign roles to new wallets. This function is implemented and tested but not yet added to the UI.
    // This will be added in future work.
    function grant_stakeholder_role(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
    }
}
