# Blockchain-Based-Order-Tracking-System
An order tracking system designed based on Blockchain.
**CSE 540: Team 5**
Amruta Mahajan, Praneeth Kumar Geddapu, Samarjeet Paril, Remi Maria Selvam, Rohit Chintakindi

# Project Description.
This is a blockchain-based order tracking system built on Polygon (Amoy Testnet). The idea is to track products as they move through a supply chain, from the manufacturer all the way to the customer. The system allows authorized stakeholders like manufacturers, distributors, retailers, and regulators to register products, transfer custody, update order statuses, and issue certifications on-chain. All state changes cannot be altered and publicly auditable. Supporting documents like certificates are stored off-chain via IPFS, with content hashes recorded on-chain for verification. 

# Who are the users?
1. Manufacturer: registers the product on the blockchain.
2. Distributor: updates shipment and custody info.
3. Retailer: marks product as stored and delivered.
4. Regulator: certifies products and audits records.
5. Consumer: can view product history by scanning a QR code.
**Contract was deployed in the following address**
0x95d5F19535a605DA547b23E3E5167E3B9E9C047b
# Tech Stack
Solidity: for writing the smart contract
Hardhat: for compiling and deploying
Polygon Amoy Testnet: blockchain we are using
OpenZeppelin: for role based access control
React: for the frontend
Ether.js: to connect the frontend to the blockchain
MetaMask: for signing transactions
Pinata (IPFS): for storing documents off-chain
Node.js: for the backend

# Folder Structure
Blockchain-Based-Order-Tracking-System
contracts/ OrderTracking.sol
scripts/ deploy.js
frontend/ React application
backend/ server.js
test / OrderTracking.test.js
package.json
hardhat.config.js
.env.example

#How to setup
###1. Clone the repo
Use the following commands
```bash
git clone https://github.com/praneethkumargeddapu/Blockchain-Based-Order-Tracking-System.git"
cd Blockchain-Based-Order-Tracking-System
```
###2.Install the dependencies
Use the following command
```bash
npm install
```
###3. Set up the environment
create a file named ".env", then copy the contents from ".env.example" and fill in your values for PRIVATE_KEY and AMOY_RPC_URL.
###4. INstall dependencies for backend
```bash
cd frontend
npm install
```
###5. Install dependencies for backend
```bash
cd backend
npm install
```
create .env and fill your values for PINATA_API_KEY, PINATA_API_SECRET, POLYGONSCAN_API_KEY
The contract is already deployed on Polygon Amoy Testnet.

### How to run the smart contract
```bash
npm install
npm run compile
npm test
```
### How to Run Frontend
```bash
cd frontend
npm install
npm start
```
### How to run Backend
```bash
cd backend
node server.js
```
Frontend runs on http://localhost:3000
Backend runs on http://localhost:3001

#How to perform ordertracking on the website.
1. Run the frontend on localhost of your device. 
2. Create an account in Metamask and connect your metamask wallet to Polygon Amoy Testnet
3. Follow the role-specific operations:
   **Manufacturer** can register a product and upload the invoice of the product. Can also transfer custody of teh prodcut after registering.
   **Distributor** can transfer the custody of the prodcut to another owner.
   **Retailer** can mark a product as out for delivery or delivered
   **Regulator** can certify a product.
4. You can lookup transit history of a product by using **Track product**. You don't need metamask wallet for this functionality.

##References
We wrote the code for this project by referencing the following documentation.
1. React Documentation: https://react.dev
2. MDN Web Docs (JavaScript): https://developer.mozilla.org
3. Ethers.js v6 Documentation: https://docs.ethers.org/v6
4. Hardhat Documentation: https://hardhat.org/docs
5. OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts
6. Pinata IPFS Documentation: https://docs.pinata.cloud
7. PolygonScan API: https://docs.etherscan.io
