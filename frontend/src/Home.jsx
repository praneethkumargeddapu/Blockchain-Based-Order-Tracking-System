import "./Home.css";
export default function Home({ setPage }) {
  return (
    <div className="home">
    <div className="home-header">
    <h1>Blockchain Order Tracking System</h1>
    <p>A supply chain tracking system built on Polygon Amoy Testnet. Products are tracked from manufacturer to customer. Every action, and every transfer is recorded permanently on the blockchain.</p>
    </div>
    <div className="home-grid">
    <div className="home-card">
    <h3>Manufacturer</h3>
    <p>Register new products on the blockchain and transfer the custody of the products.</p>
    <button onClick={() => setPage("manufacturer")}>Go to Dashboard</button>
    </div>
    <div className="home-card">
    <h3>Distributor</h3>
    <p>Transfer Custody and update shipment status.</p>
    <button onClick={() => setPage("distributor")}>Go to Dashboard</button>
    </div>
    <div className="home-card">
    <h3>Retailer</h3>
    <p>Mark products as stored and delivered.</p>
    <button onClick={() => setPage("retailer")}>Go to Dashboard</button>
    </div>

    <div className="home-card">
    <h3>Regulator</h3>
    <p>Certify the products</p>
    <button onClick={() => setPage("regulator")}>Go to Dashboard</button>
    </div>
    <div className="home-card">
    <h3>Track Product</h3>
    <p>Enter a product ID to view its full history on the blockchain.</p>
    <button onClick={() => setPage("tracker")}>Track</button>
    </div>
    </div>
    </div>);
}
