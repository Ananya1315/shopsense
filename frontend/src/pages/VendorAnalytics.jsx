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

import "../styles/vendorDashboard.css";
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

  const [benchmark, setBenchmark] = useState(null);

  const [loading, setLoading] = useState(true);

  // WebSocket connection status
  const [isLive, setIsLive] = useState(false);


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

        api.get(
          "/analytics/vendor/sales-by-product",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        api.get(
          "/analytics/vendor/revenue-by-product",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

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


      const url =
        window.URL.createObjectURL(
          new Blob(
            [response.data],
            {
              type: "text/csv",
            }
          )
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


  // =========================================
  // FETCH ANALYTICS + WEBSOCKET
  // =========================================

  useEffect(() => {

    // Load analytics when page opens
    fetchAnalytics();


    const token =
      localStorage.getItem("access_token");


    if (!token) {

      console.error(
        "Access token not found."
      );

      return;

    }


    let ws;


    try {

      // -----------------------------------------
      // DECODE JWT
      // -----------------------------------------

      const payload =
        JSON.parse(
          atob(
            token.split(".")[1]
          )
        );


      const vendorId =
        payload.vendor_id;


      if (!vendorId) {

        console.error(
          "Vendor ID not found in JWT."
        );

        return;

      }




      ws =
  new WebSocket(
    `ws://127.0.0.1:8001/ws/vendor/${vendorId}`
  );



      ws.onopen = () => {

        console.log(
          "WebSocket connected for vendor:",
          vendorId
        );

        setIsLive(true);

      };


      // -----------------------------------------
      // MESSAGE RECEIVED
      // -----------------------------------------

      ws.onmessage = (event) => {

        try {

          const data =
            JSON.parse(
              event.data
            );


          console.log(
            "WebSocket event received:",
            data
          );


          // -----------------------------------------
          // NEW TRANSACTION
          // -----------------------------------------

          if (
            data.event ===
            "new_transaction"
          ) {

            console.log(
              "New transaction detected. Refreshing analytics..."
            );

            fetchAnalytics();

          }

        } catch (error) {

          console.error(
            "Failed to process WebSocket message:",
            error
          );

        }

      };


      // -----------------------------------------
      // WEBSOCKET ERROR
      // -----------------------------------------

      ws.onerror = (error) => {

        console.error(
          "WebSocket error:",
          error
        );

        setIsLive(false);

      };


      // -----------------------------------------
      // WEBSOCKET CLOSED
      // -----------------------------------------

      ws.onclose = () => {

        console.log(
          "WebSocket connection closed."
        );

        setIsLive(false);

      };


    } catch (error) {

      console.error(
        "Failed to initialize WebSocket:",
        error
      );

      setIsLive(false);

    }


    // -----------------------------------------
    // CLEANUP
    // -----------------------------------------

    return () => {

      if (ws) {

        ws.close();

      }

    };

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


  // =========================================
  // PAGE
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

        <div className="vendor-header">

          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >

              <h1 className="vendor-page-title">
                My Analytics
              </h1>


              {/* =================================
                  LIVE STATUS
              ================================== */}

              <span
                style={{
                  fontSize: "13px",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  background: isLive
                    ? "rgba(46, 204, 113, 0.15)"
                    : "rgba(255, 255, 255, 0.08)",
                  color: isLive
                    ? "#2ecc71"
                    : "#aaa"
                }}
              >
                {isLive
                  ? "🟢 Live"
                  : "⚪ Offline"}
              </span>

            </div>


            <p className="vendor-page-subtitle">
              Monitor the performance of your products.
            </p>

          </div>


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

          <p className="analytics-description">
            Compare the number of units sold across your products.
          </p>


          <div className="vendor-chart">

            {salesByProduct.length === 0 ? (

              <div className="vendor-empty-state">
                No sales data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={salesByProduct}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 5,
                    bottom: 45
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.10)"
                  />

                  <XAxis
                    dataKey="product_name"
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                    height={50}
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 11
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 11
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

                  <Legend
                    verticalAlign="bottom"
                    height={20}
                    wrapperStyle={{
                      fontSize: "12px"
                    }}
                  />

                  <Bar
                    dataKey="total_sold"
                    name="Units Sold"
                    fill="#7c5cff"
                    radius={[5, 5, 0, 0]}
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

          <p className="analytics-description">
            Compare the revenue generated by each product.
          </p>


          <div className="vendor-chart">

            {revenueByProduct.length === 0 ? (

              <div className="vendor-empty-state">
                No revenue data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={revenueByProduct}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 5,
                    bottom: 45
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.10)"
                  />

                  <XAxis
                    dataKey="product_name"
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                    height={50}
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 11
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 11
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

                  <Legend
                    verticalAlign="bottom"
                    height={20}
                    wrapperStyle={{
                      fontSize: "12px"
                    }}
                  />

                  <Bar
                    dataKey="total_revenue"
                    name="Revenue"
                    fill="#9b7cff"
                    radius={[5, 5, 0, 0]}
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

          <p className="analytics-description">
            Compare your performance with the marketplace average.
          </p>


          {benchmark ? (

            <div className="benchmark-grid">

              {/* SALES */}

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

                  <strong
                    className={
                      Number(
                        benchmark.sales_performance_percentage || 0
                      ) >= 0
                        ? "performance-positive"
                        : "performance-negative"
                    }
                  >
                    {Number(
                      benchmark.sales_performance_percentage || 0
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2
                    })}
                    %
                  </strong>

                </div>

              </div>


              {/* REVENUE */}

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

                  <strong
                    className={
                      Number(
                        benchmark.revenue_performance_percentage || 0
                      ) >= 0
                        ? "performance-positive"
                        : "performance-negative"
                    }
                  >
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