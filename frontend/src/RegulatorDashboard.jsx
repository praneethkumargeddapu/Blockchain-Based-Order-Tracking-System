import {useState} from "react";
import {ethers} from 'ethers';
import {CONTRACT_ADDRESS, CONTRACT_ABI} from "./contract";
import "./Dashboard.css";
export default function RegulatorDashboard({signer, account}){
  const [product_id, setProdId] = useState("");
  const [msg, setMsg] = useState("");
  
  const [load, setLoad] = useState(false);
  
  const gas_fee={maxFeePerGas: ethers.parseUnits("70","gwei"),maxPriorityFeePerGas: ethers.parseUnits("30","gwei"),};

  const findContract=()=>new ethers.Contract(CONTRACT_ADDRESS,CONTRACT_ABI,signer);
  const Certification=async(e)=>{
    e.preventDefault();
    setMsg("");
    if (!product_id){
      setMsg("Product ID should be entered first");
      return;
    }
    if (!account) {
      setMsg("Wallet should be connected first");
      return;
    }
    setLoad(true);
    try {
      const con = findContract();
      const final_result = await con.certify_product(parseInt(product_id), gas_fee);
      setMsg("Transaction submitted. Waiting to confirm the transaction");
      await final_result.wait();
      
      setMsg("Successfully certified the product"+final_result.hash);
      setProdId("");
    } catch (error) {
      setMsg(error.reason||error.message || "Transaction failed.");
    }
    setLoad(false);
  };
  return (
    <div>
      <h2 className="page-title">Regulator</h2>
      <p className="page-desc">Certify products that are not certified</p>
      {!account && <p className="wallet-warning">Wallet should be connected first</p>}

      <div className="card">
        <form onSubmit={Certification}>

          <div className="field">

            <label>Product ID</label>
            <input

              type="text"

              value={product_id}
              onChange={(e) => setProdId(e.target.value)}
            />

          </div>
          <p className="field-note">To certify the products on the blockchain. Only authorized persons with regulator role can do this</p>
          <button type="submit" className="submit-btn" disabled={load}>
            {load ? "Submitted. Waiting to confirm" : "Certify Product"}
          </button>

        </form>
        {msg && <p className="message">{msg}</p>}
      </div>

    </div>
  );
}
