// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/AccessControl.sol";

contract OrderTracking is AccessControl{
    bytes32 public constant MANUFACTURER = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER = keccak256("RETAILER_ROLE");
    bytes32 public constant REGULATOR = keccak256("REGULATOR_ROLE");
    enum Status {Created, Shipped, Stored, Delivered}
    struct Product{
        uint256 product_id;
        address owner;
        Status status;
        string hash_number;
        bool is_certified;
        bool exists;
    }

    mapping(uint256 => Product) public products;
    event ProductIsRegistered(uint256 product_id, address manufacturer);
    event CustodyIsTransferred(uint256 product_id, address from, address to);
    event StatusIsUpdated(uint256 product_id, Status new_status);
    event ProductIsCertified(uint256 product_id, address regulator);
    constructor(){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER, msg.sender);
        _grantRole(DISTRIBUTOR, msg.sender);
        _grantRole(RETAILER, msg.sender);
        _grantRole(REGULATOR, msg.sender);
    }
    modifier product_exists(uint256 product_id){
        require(products[product_id].exists, "Product does not exist");
        _;
    }

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

    function update_status(uint256 product_id, Status new_status) external product_exists(product_id){
        Product storage i = products[product_id];
        require(i.owner == msg.sender, "Only current owner can update status");
        require(uint8(new_status) > uint8(i.status), "Status can only move forward");

        i.status = new_status;
        emit StatusIsUpdated(product_id, new_status);
    }

    function certify_product(uint256 product_id) external product_exists(product_id) onlyRole(REGULATOR){
        Product storage i = products[product_id];
        require(!i.is_certified, "Already certified");
        i.is_certified = true;
        emit ProductIsCertified(product_id, msg.sender);
    }

    function get_product(uint256 product_id) external view product_exists(product_id) returns (Product memory){
        return products[product_id];
    }

    function get_status(uint256 product_id) external view product_exists(product_id) returns (Status) {
        return products[product_id].status;
    }

    function grant_stakeholder_role(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
    }
}
