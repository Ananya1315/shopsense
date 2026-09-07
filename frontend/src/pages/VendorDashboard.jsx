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

      const token = localStorage.getItem("access_token");

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

      setError("Failed to load dashboard");

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

        <div className="vendor-header">

          <h1 className="vendor-page-title">
            Vendor Dashboard
          </h1>

          <p className="vendor-page-subtitle">
            Welcome back, {dashboard.vendor_name} 👋
          </p>

        </div>


        {/* =================================
            OVERVIEW STATISTICS
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Overview
          </h2>


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

        </section>


        {/* =================================
            INVENTORY STATUS
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Inventory Status
          </h2>


          <div className="inventory-status-grid">

            <div className="vendor-stat-card inventory-card">

              <div>

                <h3>
                  Low Stock Products
                </h3>

                <span className="inventory-description">
                  Products that need restocking
                </span>

              </div>

              <p>
                {dashboard.low_stock_count}
              </p>

            </div>


            <div className="vendor-stat-card inventory-card">

              <div>

                <h3>
                  Total Products
                </h3>

                <span className="inventory-description">
                  Products currently listed
                </span>

              </div>

              <p>
                {dashboard.total_products}
              </p>

            </div>

          </div>

        </section>


        {/* =================================
            QUICK ACTIONS
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Quick Actions
          </h2>


          <div className="vendor-actions">

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

        </section>

      </main>

    </div>

  );

}


export default VendorDashboard;