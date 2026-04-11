import { useState } from "react";
import "./Dashboard.css";

export default function ManufacturerDashboard() {
  const [tab, setTab] = useState("register");
  const [productId, setProductId] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [transferId, setTransferId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!productId || !ipfsHash) {
      setMessage("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setMessage("Product registered successfully. Tx: 0xDUMMY_HASH");
      setProductId("");
      setIpfsHash("");
      setLoading(false);
    }, 1500);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferId || !toAddress) {
      setMessage("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setMessage("Custody transferred successfully. Tx: 0xDUMMY_HASH");
      setTransferId("");
      setToAddress("");
      setLoading(false);
    }, 1500);
  };

  return (
    <div>
      <h2 className="page-title">Manufacturer Dashboard</h2>
      <p className="page-desc">Register products and transfer custody on the blockchain.</p>

      <div className="tabs">
        <button
          className={tab === "register" ? "tab active" : "tab"}
          onClick={() => { setTab("register"); setMessage(""); }}
        >
          Register Product
        </button>
        <button
          className={tab === "transfer" ? "tab active" : "tab"}
          onClick={() => { setTab("transfer"); setMessage(""); }}
        >
          Transfer Custody
        </button>
      </div>

      <div className="card">
        {tab === "register" && (
          <form onSubmit={handleRegister}>
            <div className="field">
              <label>Product ID</label>
              <input
                type="number"
                placeholder="e.g. 1001"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </div>
            <div className="field">
              <label>IPFS Hash</label>
              <input
                type="text"
                placeholder="e.g. QmTestHash123"
                value={ipfsHash}
                onChange={(e) => setIpfsHash(e.target.value)}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Register Product"}
            </button>
          </form>
        )}

        {tab === "transfer" && (
          <form onSubmit={handleTransfer}>
            <div className="field">
              <label>Product ID</label>
              <input
                type="number"
                placeholder="e.g. 1001"
                value={transferId}
                onChange={(e) => setTransferId(e.target.value)}
              />
            </div>
            <div className="field">
              <label>New Owner Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Transfer Custody"}
            </button>
          </form>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
