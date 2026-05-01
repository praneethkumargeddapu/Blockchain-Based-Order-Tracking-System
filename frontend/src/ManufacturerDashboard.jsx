import {useState} from "react";
import {ethers} from 'ethers';
import {CONTRACT_ADDRESS, CONTRACT_ABI} from "./contract";
import "./Dashboard.css";
export default function ManufacturerDashboard({signer, account}){
  const [cur_tab, showTab] = useState("register");
  const [product_id, showProductId] = useState("");
  const [hash_IPFS, setHash] = useState("");
  const [cur_file, setFile] = useState(null);
  const [address, setAdress] = useState("");
  const [new_owner, setNewOwner] = useState("");
  const [msg, setMsg] = useState("");
  const [load, setLoad] = useState(false);
  const [upload, setUpload] = useState(false);
  const gas_fee = {maxFeePerGas: ethers.parseUnits("70", "gwei"),maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),};
  const getContract = () => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return contract;
  };
  const UploadFunction = async () => {
    if (!cur_file) {
      setMsg("select a file");
      return;
    }
    setUpload(true);
    setMsg("");
    try {
      const data_form = new FormData();
      data_form.append("file", cur_file);
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: data_form,
      });
      const cur_data = await response.json();
      if (cur_data.hash) {
      const generated_hash = cur_data.hash;
      setHash(generated_hash);
      setMsg("File succesfully uploaded to IPFS. Generated hash is: " + generated_hash);
      } else {
      setMsg("Upload failed");
      }
    } catch (error) {
      setMsg("Upload failed");
    }
    setUpload(false);
  };
  const RegisterFunction = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!product_id || !hash_IPFS) {
      setMsg("fill in all fields");
      return;
    }
    if (!account) {
      setMsg("wallet should be connected");
      return;
    }
    setLoad(true);
    try {
      const id = parseInt(product_id);
      const contract = getContract();
      const transactino = await contract.register_product(id, hash_IPFS, gas_fee);
      setMsg("successfully submitted transactin. waiting to confirm");

      await transactino.wait();

      const tx_hash = transactino.hash;
      setMsg("Successfully registered a product " + tx_hash);
      showProductId("");
      setHash("");
      setFile(null);
    } catch (error) {
      setMsg(error.reason || error.message || "Transaction failed.");
    }
    setLoad(false);
  };

  const TransferFunctino = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!new_owner || !address) {
    setMsg("fill in all fields");
    return;
    }
    if (!account) {
      setMsg("wallet should be connected");
      return;
    }
    setLoad(true);
    try {
      const id = parseInt(new_owner);
      const contract = getContract();
      const transactino = await contract.transfer_custody(id, address, gas_fee);
      setMsg("Transaction submitted. Waiting for confirmation...");
      await transactino.wait();
      const tx_hash = transactino.hash;
      setMsg("Custody transferred successfully. Tx: " + tx_hash);
      setNewOwner("");
      setAdress("");
    } catch (error) {
      setMsg(error.reason || error.message || "Transaction failed.");
    }
    setLoad(false);
  };
  let reg_btn = "Register Product";
  if (load) {
    reg_btn = "Submitting...";
  }
  let transfer_btn = "Transfer Custody";
  if (load) {
    transfer_btn = "Submitting...";
  }
  let upload_btn = "Upload to IPFS";
  if (upload) {
    upload_btn = "Uploading...";
  }
  return (
    <div>
      <h2 className="page-title">Manufacturer Dashboard</h2>
      <p className="page-desc">Register products and transfer custody on the blockchain.</p>
      {!account && (
        <p className="wallet-warning">Please connect your wallet to use this dashboard.</p>
      )}
      <div className="tabs">
      <button
      className={cur_tab === "register" ? "tab active" : "tab"}
      onClick={() => {
      showTab("register");
      setMsg("");
        }}
      >
        Register Product
      </button>
      <button
      className={cur_tab === "transfer" ? "tab active" : "tab"}
      onClick={() => {
      showTab("transfer");
      setMsg("");
        }}
      >
        Transfer Ownership
      </button>
      </div>
      <div className="card">
        {cur_tab === "register" && (
          <form onSubmit={RegisterFunction}>
          <div className="field">
          <label>Product ID</label>
          <input
            type="text"
            value={product_id}
            onChange={(e) => {
            const typed = e.target.value;
            showProductId(typed);
            }}
            />
            </div>
            <div className="field">
            <label>Upload Invoice</label>
            <input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={(e) => {
              const selected = e.target.files[0];
              setFile(selected);
            }}
            />
            </div>
            <button
            type="button"
            className="upload-btn"
            onClick={UploadFunction}
            disabled={upload}
            >
              {upload_btn}
            </button>
            {hash_IPFS && (
              <div className="field">
              <label>IPFS Hash</label>
              <input
                type="text"
                value={hash_IPFS}
                readOnly
                />
              </div>
            )}
          <button type="submit" className="submit-btn" disabled={load || !hash_IPFS}>
          {reg_btn}
          </button>
          </form>
        )}
      {cur_tab === "transfer" && (
        <form onSubmit={TransferFunctino}>
          <div className="field">
          <label>Product ID</label>
          <input
          type="text"
          value={new_owner}
          onChange={(e) => {
            const typed = e.target.value;
            setNewOwner(typed);
            }}
            />
            </div>
            <div className="field">
            <label>Transfer ownership</label>
            <input
            type="text"
            value={address}
            onChange={(e) => {
              const typed = e.target.value;
              setAdress(typed);
            }}
            />
            </div>
            <button type="submit" className="submit-btn" disabled={load}>
            {transfer_btn}
            </button>
          </form>
        )}
        {msg && (<p className="message">{msg}</p>)}
      </div>
    </div>
);
}
