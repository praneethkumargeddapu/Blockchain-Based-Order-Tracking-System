import {useState} from "react";
import {ethers} from 'ethers';
import {CONTRACT_ADDRESS, CONTRACT_ABI} from "./contract";
import "./Dashboard.css";
export default function RetailerDashboard({signer, account}){
  const [cur_tab, showTab] = useState("out_for_delivery");
  const [product_id, setProdId] = useState("");
  const [msg, setMsg] = useState("");
  const [load, setLoad] = useState(false);
  const gas_fees = {maxFeePerGas: ethers.parseUnits("70", "gwei"),maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),};
  const getContractt = () => {
    const con = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return con;
  };
  const outForDeliveryFunction = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!product_id) {
      setMsg("Product ID should be entered first");
      return;
    }
    if (!account) {
      setMsg("Wallet should be connected first");
      return;
    }
    setLoad(true);
    try {
      const id = parseInt(product_id);
      const con = getContractt();
      const final_result = await con.update_status(id, 2, gas_fees);
      setMsg("Transaction submitted. Waiting to confirm the transaction");

      await final_result.wait();

      const tx_hash = final_result.hash;
      setMsg("Status updated to Out for Delivery " + tx_hash);
      setProdId("");
    } catch (error) {
      setMsg(error.reason || error.message || "Transaction failed.");
    }
    setLoad(false);
  };
  const deliveredFunction = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!product_id) {
      setMsg("Product ID should be entered first");
      return;
    }
    if (!account) {
      setMsg("Wallet should be connected first");
      return;
    }
    setLoad(true);
    try {
    const id = parseInt(product_id);
    const con = getContractt();
    const final_result = await con.update_status(id, 3, gas_fees);
    setMsg("Transaction submitted. Waiting to confirm the transaction");
    await final_result.wait();
    const tx_hash = final_result.hash;
    setMsg("Status updated to Delivered " + tx_hash);
    setProdId("");
    } catch (error) {
      setMsg(error.reason || error.message || "Transaction failed.");
    }
    setLoad(false);
  };

  let btn_text = "Mark as Out for Delivery";
  if (load) {
    btn_text = "Submitted. Waiting to confirm";
  }
  let btn_text_two = "Mark as Delivered";
  if (load) {
    btn_text_two = "Submitted. Waiting to confirm";
  }

  return (
    <div>
      <h2 className="page-title">Retailer</h2>
      <p className="page-desc">Update product delivery status on the blockchain</p>
      {!account && (
        <p className="wallet-warning">Wallet should be connected first</p>
      )}
      <div className="tabs">
        <button
          className={cur_tab === "out_for_delivery" ? "tab active" : "tab"}
          onClick={() => {
            showTab("out_for_delivery");
            setMsg("");
          }}
        >
          Out for Delivery
        </button>
        <button
          className={cur_tab === "delivered" ? "tab active" : "tab"}
          onClick={() => {
            showTab("delivered");
            setMsg("");
          }}

        >
          Delivered
        </button>
      </div>
      <div className="card">
        {cur_tab === "out_for_delivery" && (
          <form onSubmit={outForDeliveryFunction}>
          <div className="field">
          <label>Product ID</label>
          <input
          type="text"
          value={product_id}
          onChange={(e) => {
            const typed = e.target.value;
            setProdId(typed);
          }}
          />
          </div>
          <p className="field-note">This will update the product status to Out for Delivery on the blockchain</p>
          <button type="submit" className="submit-btn" disabled={load}>
            {btn_text}
          </button>
          </form>
        )}
        {cur_tab === "delivered" && (
          <form onSubmit={deliveredFunction}>
          <div className="field">
          <label>Product ID</label>
          <input
          type="text"
          value={product_id}
          onChange={(e) => {
            const typed = e.target.value;
            setProdId(typed);
          }}
          />
          </div>
          <p className="field-note">This will update the product status to Delivered on the blockchain</p>
          <button type="submit" className="submit-btn" disabled={load}>
          {btn_text_two}
          </button>
          </form>
        )}
        {msg && (<p className="message">{msg}</p>)}
      </div>
    </div>
  );
}
