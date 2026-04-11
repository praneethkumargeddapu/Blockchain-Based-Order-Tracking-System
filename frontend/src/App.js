import { useState } from "react";
import ManufacturerDashboard from "./ManufacturerDashboard";
import ProductTracker from "./ProductTracker";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("tracker");

  return (
    <div className="app">
      <nav className="navbar">
        <span className="nav-title">Order Tracking System</span>
        <div className="nav-links">
          <button
            className={page === "tracker" ? "nav-btn active" : "nav-btn"}
            onClick={() => setPage("tracker")}
          >
            Track Product
          </button>
          <button
            className={page === "manufacturer" ? "nav-btn active" : "nav-btn"}
            onClick={() => setPage("manufacturer")}
          >
            Manufacturer
          </button>
        </div>
      </nav>

      <div className="content">
        {page === "tracker" && <ProductTracker />}
        {page === "manufacturer" && <ManufacturerDashboard />}
      </div>

      <footer className="footer">
        CSE 540 - Team 5 - Arizona State University
      </footer>
    </div>
  );
}
