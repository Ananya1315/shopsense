import { useEffect, useState } from "react";

import api from "../api/axios";

import "../styles/dashboard.css";
import "../styles/vendorDashboard.css";


function VendorDashboard({
  onDashboard,
  onProducts,
  onSales,
  onAnalytics,
  onVendorAnalytics,
  onLogout
}) {

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================
  // FETCH VENDOR DASHBOARD
  // =========================================

  const fetchDashboard = async () => {

    try {

      const token =
        localStorage.getItem("access_token");

      const response = await api.get(
        "/vendor/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch vendor dashboard:",
        error
      );

      setError(
        "Failed to load dashboard"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchDashboard();

  }, []);


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (
      <div className="vendor-loading">
        Loading dashboard...
      </div>
    );

  }


  // =========================================
  // ERROR
  // =========================================

  if (error) {

    return (
      <div className="vendor-loading">
        {error}
      </div>
    );

  }


  // =========================================
  // DASHBOARD
  // =========================================

  return (

    <div className="vendor-layout">

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="vendor-sidebar">

        <h2 className="vendor-logo">
          ShopSense
        </h2>


        <nav className="vendor-nav">

          <button
            className="active"
            onClick={onDashboard}
          >
            Dashboard
          </button>


          <button
            onClick={onProducts}
          >
            My Products
          </button>


          <button
            onClick={onSales}
          >
            Sales
          </button>


          <button
            onClick={onAnalytics}
          >
            Customer Analytics
          </button>


          {/* NEW */}

          <button
            onClick={onVendorAnalytics}
          >
            My Analytics
          </button>

        </nav>


        {/* Logout */}

        <button
          className="vendor-logout"
          onClick={onLogout}
        >
          Logout
        </button>

      </aside>


      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="vendor-main">

        <h1 className="vendor-page-title">
          Vendor Dashboard
        </h1>


        <p className="vendor-page-subtitle">
          Welcome back, {dashboard.vendor_name} 👋
        </p>


        {/* =================================
            STATISTICS
        ================================== */}

        <div className="vendor-stats">

          <div className="vendor-stat-card">

            <h3>
              My Products
            </h3>

            <p>
              {dashboard.total_products}
            </p>

          </div>


          <div className="vendor-stat-card">

            <h3>
              Total Sales
            </h3>

            <p>
              {dashboard.total_sales}
            </p>

          </div>


          <div className="vendor-stat-card">

            <h3>
              Total Revenue
            </h3>

            <p>
              ₹{" "}
              {Number(
                dashboard.total_revenue
              ).toLocaleString("en-IN")}
            </p>

          </div>


          <div className="vendor-stat-card">

            <h3>
              Inventory Value
            </h3>

            <p>
              ₹{" "}
              {Number(
                dashboard.inventory_value
              ).toLocaleString("en-IN")}
            </p>

          </div>

        </div>


        {/* =================================
            INVENTORY STATUS
        ================================== */}

        <div className="vendor-section">

          <h2>
            Inventory Status
          </h2>


          <div className="vendor-stats">

            <div className="vendor-stat-card">

              <h3>
                Low Stock Products
              </h3>

              <p>
                {dashboard.low_stock_count}
              </p>

            </div>


            <div className="vendor-stat-card">

              <h3>
                Total Products
              </h3>

              <p>
                {dashboard.total_products}
              </p>

            </div>

          </div>

        </div>


        {/* =================================
            QUICK ACTIONS
        ================================== */}

        <div className="vendor-section">

          <h2>
            Quick Actions
          </h2>


          <div
            style={{
              display: "flex",
              gap: "15px"
            }}
          >

            <button
              className="vendor-primary-button"
              onClick={onProducts}
            >
              + Add Product
            </button>


            <button
              className="vendor-action-button"
              onClick={onProducts}
            >
              Manage Products
            </button>

          </div>

        </div>

      </main>

    </div>

  );

}


export default VendorDashboard;