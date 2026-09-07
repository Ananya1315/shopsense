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

import "../styles/adminAnalytics.css";


function AdminAnalytics({
  onDashboard,
  onVendors,
  onProducts,
  onAnalytics,
  onLogout
}) {

  const [averagePrice, setAveragePrice] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  const [topVendor, setTopVendor] = useState(null);
  const [vendorInventory, setVendorInventory] = useState([]);

  const [salesByProduct, setSalesByProduct] = useState([]);
  const [revenueByProduct, setRevenueByProduct] = useState([]);

  const [loading, setLoading] = useState(true);


  /* =========================================
     FETCH ANALYTICS
  ========================================= */

  const fetchAnalytics = async () => {

    try {

      const [
        avgPriceResponse,
        inventoryResponse,
        lowStockResponse,
        outOfStockResponse,
        topVendorResponse,
        vendorInventoryResponse,
        salesByProductResponse,
        revenueByProductResponse
      ] = await Promise.all([

        api.get("/analytics/avg-price"),

        api.get("/analytics/inventory-value"),

        api.get("/analytics/low-stock"),

        api.get("/analytics/out-of-stock"),

        api.get("/analytics/top-vendor"),

        api.get("/analytics/inventory-value-by-vendor"),

        api.get("/analytics/sales-by-product"),

        api.get("/analytics/revenue-by-product")

      ]);


      setAveragePrice(
        avgPriceResponse.data.average_price || 0
      );


      setInventoryValue(
        inventoryResponse.data.inventory_value || 0
      );


      setLowStockCount(
        lowStockResponse.data.length
      );


      setOutOfStockCount(
        outOfStockResponse.data.length
      );


      setTopVendor(
        topVendorResponse.data
      );


      setVendorInventory(
        vendorInventoryResponse.data
      );


      setSalesByProduct(
        salesByProductResponse.data
      );


      setRevenueByProduct(
        revenueByProductResponse.data
      );


    } catch (error) {

      console.error(
        "Failed to fetch analytics:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchAnalytics();

  }, []);


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (
      <div className="page-loading">
        Loading analytics...
      </div>
    );

  }


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
            className="nav-item"
            onClick={onDashboard}
          >
            Dashboard
          </button>


          {/* Vendors */}

          <button
            className="nav-item"
            onClick={onVendors}
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
            className="nav-item active"
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

        <div className="page-header">

          <div>

            <h1>
              Analytics
            </h1>

            <p>
              Monitor marketplace performance and inventory insights.
            </p>

          </div>

        </div>


        {/* =====================================
            ANALYTICS CARDS
        ====================================== */}

        <section className="analytics-grid">

          <div className="analytics-card">

            <p>
              Average Product Price
            </p>

            <h2>
              ₹{" "}
              {averagePrice.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2
                }
              )}
            </h2>

          </div>


          <div className="analytics-card">

            <p>
              Total Inventory Value
            </p>

            <h2>
              ₹{" "}
              {inventoryValue.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>


          <div className="analytics-card warning-card">

            <p>
              Low Stock Products
            </p>

            <h2>
              {lowStockCount}
            </h2>

          </div>


          <div className="analytics-card danger-card">

            <p>
              Out of Stock
            </p>

            <h2>
              {outOfStockCount}
            </h2>

          </div>

        </section>


        {/* =====================================
            TOP VENDOR
        ====================================== */}

        <section className="analytics-section">

          <h2>
            Top Vendor
          </h2>


          {topVendor ? (

            <div className="top-vendor-card">

              <div>

                <p>
                  Vendor
                </p>

                <h3>
                  {topVendor.vendor_name}
                </h3>

              </div>


              <div>

                <p>
                  Inventory Value
                </p>

                <h3>
                  ₹{" "}
                  {Number(
                    topVendor.inventory_value || 0
                  ).toLocaleString("en-IN")}
                </h3>

              </div>

            </div>

          ) : (

            <div className="empty-state">
              No vendor data available.
            </div>

          )}

        </section>


        {/* =====================================
            INVENTORY BY VENDOR
        ====================================== */}

        <section className="analytics-section">

          <h2>
            Inventory Value by Vendor
          </h2>


          <div className="vendor-inventory-container">

            <table className="vendor-inventory-table">

              <thead>

                <tr>

                  <th>
                    Vendor
                  </th>

                  <th>
                    Inventory Value
                  </th>

                </tr>

              </thead>


              <tbody>

                {vendorInventory.length === 0 ? (

                  <tr>

                    <td
                      colSpan="2"
                      className="empty-state"
                    >
                      No inventory data available.
                    </td>

                  </tr>

                ) : (

                  vendorInventory.map(
                    (vendor, index) => (

                      <tr key={index}>

                        <td>
                          {vendor.vendor_name}
                        </td>

                        <td>
                          ₹{" "}
                          {Number(
                            vendor.inventory_value || 0
                          ).toLocaleString("en-IN")}
                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =====================================
            SALES BY PRODUCT
        ====================================== */}

        <section className="analytics-section">

          <h2>
            Sales by Product
          </h2>


          <div className="analytics-chart">

            {salesByProduct.length === 0 ? (

              <div className="empty-state">
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
                    bottom: 35
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.12)"
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
                    axisLine={{
                      stroke: "#666681"
                    }}
                    tickLine={{
                      stroke: "#666681"
                    }}
                  />


                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 12
                    }}
                    axisLine={{
                      stroke: "#666681"
                    }}
                    tickLine={{
                      stroke: "#666681"
                    }}
                  />


                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#29283d",
                      border: "1px solid #696783",
                      borderRadius: "8px",
                      color: "#ffffff"
                    }}
                    labelStyle={{
                      color: "#ffffff"
                    }}
                  />


                  <Legend
                    verticalAlign="bottom"
                    height={20}
                    wrapperStyle={{
                      color: "#d8d7ed",
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


        {/* =====================================
            REVENUE BY PRODUCT
        ====================================== */}

        <section className="analytics-section">

          <h2>
            Revenue by Product
          </h2>


          <div className="analytics-chart">

            {revenueByProduct.length === 0 ? (

              <div className="empty-state">
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
                    bottom: 35
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.12)"
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
                    axisLine={{
                      stroke: "#666681"
                    }}
                    tickLine={{
                      stroke: "#666681"
                    }}
                  />


                  <YAxis
                    tick={{
                      fill: "#b8b8d1",
                      fontSize: 12
                    }}
                    axisLine={{
                      stroke: "#666681"
                    }}
                    tickLine={{
                      stroke: "#666681"
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
                    labelStyle={{
                      color: "#ffffff"
                    }}
                  />


                  <Legend
                    verticalAlign="bottom"
                    height={20}
                    wrapperStyle={{
                      color: "#d8d7ed",
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


      </main>

    </div>

  );

}


export default AdminAnalytics;