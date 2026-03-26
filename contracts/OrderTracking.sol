// Main contract for blockchain based order tracking system.
// Handles product registration, custody transfers, status updates and certifications.

contract OrderTracking is AccessControl {
//roles for each stakeholder (manufacturer, distributor, retailer, and regulator).
//status of the product (created, shipped, stored, delivered).
enum Status {Created, Shipped, Stored, Delivered}
//stored data of each product (productId, owner, certified_status, ipfsHash).
struct Product {
uint256 productID; // unique id of the product
address owner; // current owner of the product
Status status; // current stage in the supply chain
string ipfsHash; // supporting documents stored on ipfs
bool isCertified; // whether regulator has certified this product
}

//events
event ProductRegistered(uint256 productId, address manufacturer);
event CustodyTransferred(uint256 productId, address from, address to);
event StatusUpdated(uint256 productId, Status newStatus);
event ProductCertified(uint256 productId, address regulator);
//functions
function registerProduct(uint256 productId, string calldata ipfsHash) {}
function transferCustody(uint256 productId, address newOwner) {}
function updateStatus(uint256 productId, Status newStatus) {}
function certifyProduct(uint256 productId) {}
function getProduct(uint256 productId) external view returns (Product memory) {}
function getStatus (uint256 productId) external view returns (Status) {}
}
