import {useState} from "react";
import {ethers} from 'ethers';
import {CONTRACT_ADDRESS, CONTRACT_ABI} from "./contract";
import "./Dashboard.css";
export default function DistributorDashboard({signer, account}){
  const [new_owner, setNewOwner] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState("");

  const [loading, setLoading] = useState(false);

  const gas_fee = {maxFeePerGas: ethers.parseUnits("70", "gwei"),maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),};
  const get_contract = () => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return contract;
  };
  const Transferring = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!new_owner || !address) {
      setMsg("fill all the fields");
      return;
    }
    if (!account) {
      setMsg("Wallet should be connected");
      return;
    }
    setLoading(true);
    try {
      const id = parseInt(new_owner);
      const contract = get_contract();
      const final_result = await contract.transfer_custody(id, address, gas_fee);
      setMsg("Transaction submitted successfully. waiting to confirm");
      await final_result.wait();
      const tx_hash = final_result.hash;
      setMsg("custody transferred to the next owner successfully. " + tx_hash);
      setNewOwner("");
      setAddress("");
    } catch (error) {
      setMsg(error.reason || error.message || "Transaction failed.");
    }
    setLoading(false);
  };
  let btn_text = "Transfer to new owner";
  if (loading) {
    btn_text = "submitting the information";
  }
  return (
    <div>
      <h2 className="page-title">Distributor</h2>
      <p className="page-desc">You can transfer custody to the next owner in the supply chain</p>
      {!account && (
        <p className="wallet-warning">Wallet should be connected</p>
      )}
      <div className="card">
      <form onSubmit={Transferring}>
        <div className="field">
        <label>Product ID</label>
        <input
        type="text"
        value={new_owner}
        onChange={(e) =>{
          const typed = e.target.value;
          setNewOwner(typed);
        }}
        />
        </div>
        <div className="field">
        <label>New owner wallet addresss</label>
        <input
        type="text"
        value={address}
        onChange={(e)=>{

        const typed = e.target.value;
        setAddress(typed);
        }}
        />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
        {btn_text}

        </button>
      </form>
      {msg && (
        <p className="message">{msg}</p>
      )}
      </div>
    </div>
  );}
