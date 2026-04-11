import { useState } from "react";
import "./Tracker.css";

const STEPS = [
  { label: "Created", icon: "C" },
  { label: "Shipped", icon: "S" },
  { label: "Stored",  icon: "St" },
  { label: "Delivered", icon: "D" },
];

const DUMMY_PRODUCTS = {
  1001: { productID: "1001", owner: "0xManufacturer123", status: 0, ipfsHash: "QmTestHash111", isCertified: false },
  1002: { productID: "1002", owner: "0xDistributor456", status: 1, ipfsHash: "QmTestHash222", isCertified: false },
  1003: { productID: "1003", owner: "0xRetailer789", status: 3, ipfsHash: "QmTestHash333", isCertified: true },
};

export default function ProductTracker() {
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    setProduct(null);
    if (!productId) {
      setError("Please enter a product ID.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const found = DUMMY_PRODUCTS[parseInt(productId)];
      if (found) {
        setProduct(found);
      } else {
        setError("No product found. Try 1001, 1002, or 1003.");
      }
      setLoading(false);
    }, 1000);
  };

  const getStepClass = (index) => {
    if (index < product.status) return "track-step completed";
    if (index === product.status) return "track-step current";
    return "track-step";
  };

  return (
    <div>
      <h2 className="page-title">Track a Product</h2>
      <p className="page-desc">Enter a product ID to see its current status on the blockchain.</p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {product && (
        <div className="result-card">
          <h3>Product #{product.productID}</h3>
          <span className={product.isCertified ? "certified-badge" : "not-certified"}>
            {product.isCertified ? "Certified by Regulator" : "Not Certified"}
          </span>

          <div className="tracking-bar">
            {STEPS.map((step, i) => (
              <div key={i} className={getStepClass(i)}>
                <div className="track-icon">{step.icon}</div>
                <span className="track-label">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="details">
            <div className="detail-row">
              <span className="detail-label">Owner</span>
              <span className="detail-value">{product.owner}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value">{STEPS[product.status].label}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">IPFS Hash</span>
              <span className="detail-value">{product.ipfsHash}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Certified</span>
              <span className="detail-value">{product.isCertified ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
