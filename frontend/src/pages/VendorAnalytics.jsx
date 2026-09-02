import { useEffect, useState } from "react";

import api from "../api/axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import "../styles/vendorAnalytics.css";


function VendorAnalytics({
  onDashboard,
  onProducts,
  onSales,
  onAnalytics,
  onVendorAnalytics,
  onLogout
}) {

  const [salesByProduct, setSalesByProduct] = useState([]);
  const [revenueByProduct, setRevenueByProduct] = useState([]);

  // =========================================
  // BENCHMARKING
  // =========================================

  const [benchmark, setBenchmark] = useState(null);

  const [loading, setLoading] = useState(true);


  // =========================================
  // FETCH VENDOR ANALYTICS
  // =========================================

  const fetchAnalytics = async () => {

    try {

      const token =
        localStorage.getItem("access_token");


      const [
        salesResponse,
        revenueResponse,
        benchmarkResponse
      ] = await Promise.all([

        // Sales by product
        api.get(
          "/analytics/vendor/sales-by-product",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        // Revenue by product
        api.get(
          "/analytics/vendor/revenue-by-product",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        // Vendor benchmarking
        api.get(
          "/analytics/vendor/benchmark",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

      ]);


      setSalesByProduct(
        salesResponse.data
      );


      setRevenueByProduct(
        revenueResponse.data
      );


      setBenchmark(
        benchmarkResponse.data
      );


    } catch (error) {

      console.error(
        "Failed to fetch vendor analytics:",
        error
      );

    } finally {

      setLoading(false);

    }

  };
  // =========================================
  // EXPORT ANALYTICS CSV
  // =========================================

  const exportCSV = async () => {

    try {

      const token =
        localStorage.getItem("access_token");

      const response = await api.get(
        "/analytics/vendor/export-csv",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Create downloadable file
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "text/csv",
        })
      );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "vendor_analytics.csv"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(
        "Failed to export CSV:",
        error
      );

      alert(
        "Failed to export analytics."
      );

    }

  };

  useEffect(() => {

    fetchAnalytics();

  }, []);


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (
      <div className="vendor-loading">
        Loading analytics...
      </div>
    );

  }


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
            className="active"
            onClick={onVendorAnalytics}
          >
            My Analytics
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
          My Analytics
        </h1>


        <p className="vendor-page-subtitle">
          Monitor the performance of your products.
        </p>
        <div className="vendor-export-container">

  <button
    className="vendor-export-button"
    onClick={exportCSV}
  >
    📥 Export Analytics CSV
  </button>

</div>


        {/* =================================
            SALES BY PRODUCT
        ================================== */}

        <section className="vendor-analytics-section">

          <h2>
            Units Sold by My Products
          </h2>


          <div className="vendor-chart">

            {salesByProduct.length === 0 ? (

              <div className="vendor-empty-state">
                No sales data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={380}
              >

                <BarChart
                  data={salesByProduct}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 10,
                    bottom: 70
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.12)"
                  />

                  <XAxis
                    dataKey="product_name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 13
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 13
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#29283d",
                      border: "1px solid #696783",
                      borderRadius: "8px",
                      color: "#ffffff"
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="total_sold"
                    name="Units Sold"
                    fill="#7c5cff"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </section>


        {/* =================================
            REVENUE BY PRODUCT
        ================================== */}

        <section className="vendor-analytics-section">

          <h2>
            Revenue by My Products
          </h2>


          <div className="vendor-chart">

            {revenueByProduct.length === 0 ? (

              <div className="vendor-empty-state">
                No revenue data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={380}
              >

                <BarChart
                  data={revenueByProduct}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 10,
                    bottom: 70
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.12)"
                  />

                  <XAxis
                    dataKey="product_name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 13
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 13
                    }}
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                    contentStyle={{
                      backgroundColor: "#29283d",
                      border: "1px solid #696783",
                      borderRadius: "8px",
                      color: "#ffffff"
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="total_revenue"
                    name="Revenue"
                    fill="#9b7cff"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </section>


        {/* =================================
            PERFORMANCE BENCHMARK
        ================================== */}

        <section className="vendor-analytics-section">

          <h2>
            Performance Benchmark
          </h2>


          <p className="vendor-page-subtitle">
            Compare your performance with the marketplace average.
          </p>


          {benchmark ? (

            <div className="benchmark-grid">

              {/* ==============================
                  SALES BENCHMARK
              =============================== */}

              <div className="benchmark-card">

                <h3>
                  Sales Performance
                </h3>


                <div className="benchmark-row">

                  <span>
                    My Total Sales
                  </span>

                  <strong>
                    {Number(
                      benchmark.vendor_total_sales || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>


                <div className="benchmark-row">

                  <span>
                    Marketplace Average
                  </span>

                  <strong>
                    {Number(
                      benchmark.marketplace_average_sales || 0
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2
                    })}
                  </strong>

                </div>


                <div className="benchmark-performance">

                  <span>
                    Performance
                  </span>

                  <strong>
                    {Number(
                      benchmark.sales_performance_percentage || 0
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2
                    })}
                    %
                  </strong>

                </div>

              </div>


              {/* ==============================
                  REVENUE BENCHMARK
              =============================== */}

              <div className="benchmark-card">

                <h3>
                  Revenue Performance
                </h3>


                <div className="benchmark-row">

                  <span>
                    My Total Revenue
                  </span>

                  <strong>
                    ₹{" "}
                    {Number(
                      benchmark.vendor_total_revenue || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>


                <div className="benchmark-row">

                  <span>
                    Marketplace Average
                  </span>

                  <strong>
                    ₹{" "}
                    {Number(
                      benchmark.marketplace_average_revenue || 0
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2
                    })}
                  </strong>

                </div>


                <div className="benchmark-performance">

                  <span>
                    Performance
                  </span>

                  <strong>
                    {Number(
                      benchmark.revenue_performance_percentage || 0
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2
                    })}
                    %
                  </strong>

                </div>

              </div>

            </div>

          ) : (

            <div className="vendor-empty-state">

              No benchmarking data available.

            </div>

          )}

        </section>


      </main>

    </div>

  );

}


export default VendorAnalytics;