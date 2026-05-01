import {useState} from "react";
import {ethers} from "ethers";
import {CONTRACT_ADDRESS, CONTRACT_ABI, STATUS_LABELS} from "./contract";
import "./ProductTracker.css";
const STATUS_ICONS = ["1", "2", "3", "4"];
export default function ProductTracker({signer}){
  const [product_id, setProdId] = useState("");
  const [product, setProd] = useState(null);
  const [prod_history, setProdHistory] = useState(null);
  const [error, setErr] = useState("");
  const [load, setLoad] = useState(false);
  const [load_history, setLoadHistory] = useState(false);
  const getProvider = () =>{
    if (signer) {
      return signer;
    }
    const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
    return provider;
  };
  const searchFunction = async (e) =>{
    e.preventDefault();
    setErr("");
    setProd(null);
    setProdHistory(null);
    if (!product_id.trim()){
    setErr("Please enter a product ID.");
    return;
    }
    setLoad(true);
    try{
      const runner = getProvider();
      const con = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
      const id = parseInt(product_id);
      const res = await con.get_product(id);
      const prod_id = res.product_id.toString();
      const owner = res.owner;
      const status = Number(res.status);
      const hash_number = res.hash_number;
      const is_certified = res.is_certified;
      setProd({
        product_id: prod_id,
        owner: owner,
        status: status,
        hash_number: hash_number,
        is_certified: is_certified,
      });
    } catch (err){
      if (err.message?.includes("Product does not exist")) {
        setErr("No product found with that ID.");
      } else {
      setErr("Something went wrong. Check your connection.");
    }
    }
    setLoad(false); };
  const historyFunction = async () =>{
    setLoadHistory(true);
    setProdHistory(null);
    try{
      const response = await fetch(`http://localhost:3001/history/${product_id}`);
      const cur_data = await response.json();
      const events = cur_data.events;
      setProdHistory(events);
    } catch (err){
      setErr("Failed to load history.");
    }
    setLoadHistory(false);
  };
  const short_wallet = (addr) =>{
    const start = addr.slice(0, 6);
    const end = addr.slice(-4);
    return start + "..." + end;
  };
  const getCSSClass = (ind) =>{
  if (ind < product.status) {
    return "track-step completed";
  }
  if (ind === product.status){
    return "track-step current";
  }
  return "track-step";
  };
  let search_btn = "Search";
  if (load){
    search_btn = "Searching...";
  }
  let history_btn = "Track History";
  if (load_history){
  history_btn = "Loading...";
  }
  return (
    <div>
      <h2 className="page-title">Track Product</h2>
      <p className="page-desc">Enter a product ID to see its current status on the blockchain.</p>

      <form onSubmit={searchFunction} className="search-form">
      <input
      type="text"
      placeholder="Enter Product ID"
      value={product_id}
      onChange={(e) => {
        const typed = e.target.value;
        setProdId(typed);
      }}
      />
      <button type="submit" disabled={load}>
      {search_btn}
      </button>
      </form>
      {error && <p className="error">{error}</p>}
      {product && (
        <div className="result-card">
          <h3>Product #{product.product_id}</h3>
          <span className={product.is_certified ? "certified-badge" : "not-certified"}>
          {product.is_certified ? "Certified" : "Not Certified"}
          </span>
          <div className="tracking-bar">
          {STATUS_LABELS.map((label, i) => (
          <div key={i} className={getCSSClass(i)}>
          <div className="track-icon">{STATUS_ICONS[i]}</div>
          <span className="track-label">{label}</span>
          </div>
          ))} </div>

          <div className="details">
          <div className="detail-row">
          <span className="detail-label">Owner</span>
          <span className="detail-value">{short_wallet(product.owner)}</span>
          </div>
          <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className="detail-value">{STATUS_LABELS[product.status]}</span>
          </div>
          <div className="detail-row">
          <span className="detail-label">Invoice</span>
          <a href={`https://gateway.pinata.cloud/ipfs/${product.hash_number}`}
          target="_blank"
          rel="noreferrer"
          className="detail-value"
          style={{color: "#333", textDecoration: "underline", cursor: "pointer"}}
        >
          View Invoice
        </a>
        </div>
        <div className="detail-row">
        <span className="detail-label">Certified</span>
        <span className="detail-value">{product.is_certified ? "Yes" : "No"}</span>
        </div>
        </div>
        <button className="history-btn" onClick={historyFunction} disabled={load_history}>
          {history_btn}
        </button>
        {prod_history && prod_history.length === 0 && (
        <p className="no-history">No history found for this product.</p>)}
        {prod_history && prod_history.length > 0 && (
        <div className="history-section">
        <h4 className="history-title">Product History</h4>
        <div className="history-list">
        {prod_history.map((event, i) => (
        <div key={i} className="history-item">
        <div className="history-type">{event.type}</div>
        {event.by && (
        <div className="history-detail">By: {short_wallet(event.by)}</div>
        )}
        {event.from && (
        <div className="history-detail">From: {short_wallet(event.from)}</div>
        )}
        {event.to && (
        <div className="history-detail">To: {short_wallet(event.to)}</div>
        )}
        {event.status && (
        <div className="history-detail">Status: {event.status}</div>
        )}
        <div className="history-block">Block number. {event.block}</div>
        </div>))}
        </div>
        </div>)}
        </div>)}
    </div>);
}
