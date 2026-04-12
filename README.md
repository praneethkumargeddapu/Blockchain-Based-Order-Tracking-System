# Blockchain-Based-Order-Tracking-System
An order tracking system designed based on Blockchain.

# Project Description.
This is a blockchain-based order tracking system built on Polygon (Amoy Testnet). The idea is to track products as they move through a supply chain, from the manufacturer all the way to the customer. The system allows authorized stakeholders like manufacturers, distributors, retailers, and regulators to register products, transfer custody, update order statuses, and issue certifications on-chain. All state changes cannot be altered and publicly auditable. Supporting documents like certificates are stored off-chain via IPFS, with content hashes recorded on-chain for verification. 

# Who are the users?
1. Manufacturer: registers the product on the blockchain.
2. Distributor: updates shipment and custody info.
3. Retailer: marks product as stored and delivered.
4. Regulator: certifies products and audits records.
5. Consumer: can view product history by scanning a QR code.

# Tech Stack
Solidity: for writing the smart contract
Hardhat: for compiling and deploying
Polygon Amoy Testnet: blockchain we are using
OpenZeppelin: for role based access control
React: for the frontend
Ether.js: to connect the frontend to the blockchain
MetaMask: for signing transactions
IPFS: for storing documents off-chain
Node.js: for the backend

# How to set up
(will be updated as we build it)
1. Clone the repo.
2. Run npm install.
3. Run npx hardhat compile.
4. Deploy using npx hardhat run scripts

# Folder Structure
Blockchain-Based-Order-Tracking-System
contracts/ OrderTracking.sol
scripts/ deploy.js
frontend/ React application
backend/ Will be updated soon
test / OrderTracking.test.js

###How to Run Frontend
```bash
cd frontend
npm install
npm start
```

### How to run the smart contract
```bash
npm install
npm run compile
npm test
```

# Current progress of the projet
Completed two pages of the frontend. The two pages are Product Tracker and Manufacturer Dashboard
Smart contract is finished. It's compiled successfully and all tests are passing.
Deployment of the smart contract into polygon amoy testnet and the integration into the frontend are in progress
We will soon start working on backend. 
