import {useState} from "react";
import {useWallet} from "./useWallet";
import Home from "./Home";
import ManufacturerDashboard from "./ManufacturerDashboard";
import DistributorDashboard from "./DistributorDashboard";
import RetailerDashboard from "./RetailerDashboard";
import RegulatorDashboard from "./RegulatorDashboard";
import ProductTracker from "./ProductTracker";
import "./App.css";
export default function App() {
  const [cur_page, showCurPage] = useState("home");
  const {account, signer, error, connect, disconnect, short_address} = useWallet();
  let nav_title_style = {cursor: "pointer"};
  return (
    <div className="app">
      <nav className="navbar">
      <span
      className="nav-title"
      onClick={() => showCurPage("home")}
      style={nav_title_style}>
      Order Tracking System
      </span>
        <div className="nav-links">
        <button
        className={cur_page === "tracker" ? "nav-btn active" : "nav-btn"}
        onClick={() => showCurPage("tracker")}>
        Track Product
        </button>
        <button
        className={cur_page === "manufacturer" ? "nav-btn active" : "nav-btn"}
        onClick={() => showCurPage("manufacturer")}>
        Manufacturer
        </button>
        <button
        className={cur_page === "distributor" ? "nav-btn active" : "nav-btn"}
        onClick={() => showCurPage("distributor")}>
        Distributor
        </button>
        <button
        className={cur_page === "retailer" ? "nav-btn active" : "nav-btn"}
        onClick={() => showCurPage("retailer")}>
        Retailer
        </button>
        <button
        className={cur_page === "regulator" ? "nav-btn active" : "nav-btn"}
        onClick={() => showCurPage("regulator")}>
        Regulator
        </button>
      </div>
      <div>
      {account ?(
      <div className="wallet-connected">
      <span className="wallet-address">{short_address}</span>
      <button className="disconnect-btn" onClick={disconnect}>Disconnect</button>
      </div>) 
      : (
        <button className="connect-btn" onClick={connect}>Connect Wallet</button>
        )}
      </div>
      </nav>
      {error && <div className="wallet-error">{error}</div>}
      <div className="content">
      {cur_page === "home" && <Home setPage={showCurPage} />}
      {cur_page === "tracker" && <ProductTracker signer={signer} />}
      {cur_page === "manufacturer" && <ManufacturerDashboard signer={signer} account={account} />}
      {cur_page === "distributor" && <DistributorDashboard signer={signer} account={account} />}
      {cur_page === "retailer" && <RetailerDashboard signer={signer} account={account} />}
      {cur_page === "regulator" && <RegulatorDashboard signer={signer} account={account} />}
      </div>
      <footer className="footer">
        CSE 540 Group 5
      </footer>
    </div>
  ); }
