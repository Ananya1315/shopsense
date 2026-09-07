import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/dashboard.css";

function Dashboard({
  onDashboard,
  onVendorManagement,
  onProducts,
  onAnalytics,
  onLogout
}) {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // =========================================
        // TOTAL PRODUCTS
        // =========================================

        const productsResponse = await api.get(
          "/analytics/total-products",
          config
        );

        setTotalProducts(
          productsResponse.data.total_products
        );

        // =========================================
        // VENDORS
        // =========================================

        const vendorsResponse = await api.get(
          "/vendors",
          config
        );

        setTotalVendors(
          vendorsResponse.data.length
        );

        // =========================================
        // SALES + REVENUE
        // =========================================

        let sales = 0;
        let revenue = 0;

        for (const vendor of vendorsResponse.data) {
          try {
            const salesResponse = await api.get(
              `/analytics/vendor/${vendor.vendor_id}/sales`,
              config
            );

            const revenueResponse = await api.get(
              `/analytics/vendor/${vendor.vendor_id}/revenue`,
              config
            );

            sales +=
              salesResponse.data.total_sales || 0;

            revenue +=
              revenueResponse.data.total_revenue || 0;

          } catch (error) {
            console.error(
              `Failed to fetch analytics for vendor ${vendor.vendor_id}:`,
              error
            );
          }
        }

        setTotalSales(sales);
        setTotalRevenue(revenue);

      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          error
        );
      }
    };

    fetchDashboardData();

  }, []);

  return (
    <div className="dashboard">

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="logo">
          ShopSense
        </div>

        <nav>

          {/* Dashboard */}

          <button
            className="nav-item active"
            onClick={onDashboard}
          >
            Dashboard
          </button>


          {/* Vendors */}

          <button
            className="nav-item"
            onClick={onVendorManagement}
          >
            Vendors
          </button>


          {/* Products */}

          <button
            className="nav-item"
            onClick={onProducts}
          >
            Products
          </button>


          {/* Analytics */}

          <button
            className="nav-item"
            onClick={onAnalytics}
          >
            Analytics
          </button>

        </nav>


        {/* Logout */}

        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </aside>


      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">

        <header className="dashboard-header">

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Welcome back, Admin 👋
          </p>

        </header>


        {/* =====================================
            STATISTICS
        ====================================== */}

        <section className="stats-grid">

          <div className="stat-card">

            <p>
              Total Vendors
            </p>

            <h2>
              {totalVendors}
            </h2>

          </div>


          <div className="stat-card">

            <p>
              Total Products
            </p>

            <h2>
              {totalProducts}
            </h2>

          </div>


          <div className="stat-card">

            <p>
              Total Sales
            </p>

            <h2>
              {totalSales}
            </h2>

          </div>


          <div className="stat-card">

            <p>
              Total Revenue
            </p>

            <h2>
              ₹ {totalRevenue.toLocaleString("en-IN")}
            </h2>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;