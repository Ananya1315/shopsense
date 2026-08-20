import { useEffect, useState } from "react";
import api from "../api/axios";

import "../styles/dashboard.css";
import "../styles/vendorDashboard.css";


function VendorDashboard({
  onDashboard,
  onProducts,
  onSales,
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


      console.log(
        "Vendor dashboard:",
        response.data
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


        <h1 className="vendor-logo">
          ShopSense
        </h1>
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

</nav>


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
          Welcome back,{" "}
          {dashboard?.vendor_name || "Vendor"} 👋
        </p>


        {/* ===================================
            STATISTICS
        ==================================== */}

        <div className="vendor-stats">


          <div className="vendor-stat-card">

            <h3>
              My Products
            </h3>

            <p>
              {dashboard?.total_products ?? 0}
            </p>

          </div>


          <div className="vendor-stat-card">

            <h3>
              Total Sales
            </h3>

            <p>
              {dashboard?.total_sales ?? 0}
            </p>

          </div>


          <div className="vendor-stat-card">

            <h3>
              Total Revenue
            </h3>

            <p>
              ₹{" "}
              {Number(
                dashboard?.total_revenue ?? 0
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
                dashboard?.inventory_value ?? 0
              ).toLocaleString("en-IN")}
            </p>

          </div>


        </div>


        {/* ===================================
            INVENTORY STATUS
        ==================================== */}

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
                {dashboard?.low_stock_count ?? 0}
              </p>

            </div>


            <div className="vendor-stat-card">

              <h3>
                Total Products
              </h3>

              <p>
                {dashboard?.total_products ?? 0}
              </p>

            </div>


          </div>


        </div>


        {/* ===================================
            QUICK ACTIONS
        ==================================== */}

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
              onClick={() =>
                alert(
                  "Add Product functionality coming next."
                )
              }
            >
              + Add Product
            </button>


            <button
              className="vendor-action-button"
              onClick={() =>
                alert(
                  "Product management coming next."
                )
              }
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