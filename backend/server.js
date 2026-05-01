const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

// We're using Multer so that, the uploaded file is stored in the memory instead of being saved to the disk.
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
app.use(cors());
app.use(express.json());

// This is the address where the contract is uploaded to the blockchain.
const CONTRACT_ADDRESS = "0x95d5F19535a605DA547b23E3E5167E3B9E9C047b";

// POST here receives file (invoice) from the frontend and upload it to the IPFS using Pinata API. It returns the IPFS hash associated with the file.
app.post("/upload", upload.single("file"), async (req, res) => {
  try{
    const data_form = new FormData();
    const file_buffer = req.file.buffer;
    const file_name = req.file.originalname;
    data_form.append("file", file_buffer, file_name);
    const pinata_url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const pinata_key = process.env.PINATA_API_KEY;
    const pinata_secret = process.env.PINATA_API_SECRET;
    const resp = await axios.post(pinata_url,data_form,
      {headers:{ ...data_form.getHeaders(),
          pinata_api_key: pinata_key,
          pinata_secret_api_key: pinata_secret},
      } );
    const ipfs_hash = resp.data.IpfsHash;
    res.json({hash: ipfs_hash});
  } catch (error) {
    res.status(500).json({error: "Failed to upload"});
  }
});

// GET is used to fetch all the blockchain events for a given product using the product ID. Then use the Polygon scan API to get the logs of the transaction from the blockchain.
app.get("/history/:product_id", async (req, res) => {
  try {
    const product_id = parseInt(req.params.product_id);
    const api_key = process.env.POLYGONSCAN_API_KEY;
    const api_url = `https://api.etherscan.io/v2/api?chainid=80002&module=logs&action=getLogs&address=${CONTRACT_ADDRESS}&fromBlock=0&toBlock=latest&apikey=${api_key}`;
    const resp = await axios.get(api_url);
    if (resp.data.status !== "1") {
      return res.json({events: []});
    }
    const cur_logs = resp.data.result;

    // This function maps the hash to the function so we can understand since the blockchain stores the events by their hash, not by name. These hashes are generated automatically by hardhat when we compile the smart contract.
    const event_signs = {
      "0x4fa9fd176f3c4b8a3e47028bc24073db8a0fd3664a629785fb59bafa72720501": "ProductIsRegistered",
      "0xaab5071cf0e7a2507199ef25e39d3f5395863a64b95fcb4681f66172c343d77a": "CustodyIsTransferred",
      "0x4b01fd6825243911aaa88329df6498bff7b0a62bd2b470c092067191fecdabdd": "StatusIsUpdated",
      "0x1eab711044b44d6ab553611dc34910d0dc8a9d59804d42a21c13ba175cadc2fb": "ProductIsCertified"
    };

    // labels for the enm which represents the status of the product in the smart contract.
    const labels = ["Shipped", "In Transit", "Out for Delivery", "Delivered"];
    const cur_events = [];
    for (const log of cur_logs) {
      // look up the name of the event using hash
      const cur_event = event_signs[log.topics[0]];
      if (!cur_event) continue;
      // get the product id from the logs and filter the logs by the product id
      const raw_id = log.data.slice(2, 66);
      const product_id_log = parseInt(raw_id, 16);
      if (product_id_log !== product_id) continue;
      // convert the number of the block into decimal
      const raw_block = log.blockNumber;
      const cur_block = parseInt(raw_block,16);
      if (cur_event === "ProductIsRegistered"){
        // get manufacturer address from the logs 
        const raw_manufacturer = log.data.slice(66, 130).slice(24);
        const manufacturer = "0x"+raw_manufacturer;
        cur_events.push({
          type: "Registered",
          by: manufacturer,
          block: cur_block,
        }); }
      if (cur_event === "CustodyIsTransferred"){
        // extract from and to addresses from the logs
        const raw_from = log.data.slice(66, 130).slice(24);
        const from = "0x" + raw_from;
        const raw_to = log.data.slice(130, 194).slice(24);
        const to = "0x" + raw_to;
        cur_events.push({
          type: "Custody Transferred",
          from: from,
          to: to,
          block: cur_block,
        });
      }
      if (cur_event==="StatusIsUpdated"){
        // extract the enum which shows the status of the product and convert it into the label.
        const raw_status = log.data.slice(66, 130);
        const num_status = parseInt(raw_status, 16);
        const status_label = labels[num_status];
        cur_events.push({
        type: "Status Updated",
        status: status_label,
        block: cur_block
        }); }
      if (cur_event==="ProductIsCertified"){
        // Get the address of the regulator from the logs
        const raw_regulator = log.data.slice(66, 130).slice(24);
        const regulator = "0x" + raw_regulator;
        cur_events.push({
          type: "Certified",
          by: regulator,
          block: cur_block
        });
      }}
    // Sort all the events based on block number so we can get the history in chronological order
    cur_events.sort((a,b) =>a.block-b.block);
    res.json({cur_events});
  } catch (error){
    console.log(error);
    res.status(500).json({error: "Failed to fetch history"});
  }
});
app.listen(process.env.PORT, () => {
  console.log("Backend running on port " + process.env.PORT);
});
