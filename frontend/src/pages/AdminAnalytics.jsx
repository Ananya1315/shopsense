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

  const [vendorPerformance, setVendorPerformance] = useState([]);

  const [loading, setLoading] = useState(true);


  // =========================================
  // FETCH ANALYTICS
  // =========================================

  const fetchAnalytics = async () => {

    try {

      // -----------------------------------------
      // FETCH BASIC ANALYTICS
      // -----------------------------------------

      const [
        avgPriceResponse,
        inventoryResponse,
        lowStockResponse,
        outOfStockResponse,
        topVendorResponse,
        vendorInventoryResponse,
        vendorsResponse
      ] = await Promise.all([

        api.get("/analytics/avg-price"),

        api.get("/analytics/inventory-value"),

        api.get("/analytics/low-stock"),

        api.get("/analytics/out-of-stock"),

        api.get("/analytics/top-vendor"),

        api.get("/analytics/inventory-value-by-vendor"),

        api.get("/vendors")

      ]);


      // -----------------------------------------
      // SET BASIC ANALYTICS
      // -----------------------------------------

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


      // -----------------------------------------
      // FETCH SALES + REVENUE FOR EACH VENDOR
      // -----------------------------------------

      const vendors =
        vendorsResponse.data;


      const vendorData =
        await Promise.all(

          vendors.map(async (vendor) => {

            try {

              const [
                salesResponse,
                revenueResponse
              ] = await Promise.all([

                api.get(
                  `/analytics/vendor/${vendor.vendor_id}/sales`
                ),

                api.get(
                  `/analytics/vendor/${vendor.vendor_id}/revenue`
                )

              ]);


              return {

                vendor_name: vendor.name,

                total_sales:
                  salesResponse.data.total_sales || 0,

                total_revenue:
                  revenueResponse.data.total_revenue || 0

              };

            } catch (error) {

              console.error(
                `Failed to fetch analytics for vendor ${vendor.vendor_id}:`,
                error
              );


              return {

                vendor_name: vendor.name,

                total_sales: 0,

                total_revenue: 0

              };

            }

          })

        );


      // Sort vendors by revenue
      vendorData.sort(
        (a, b) =>
          b.total_revenue - a.total_revenue
      );


      setVendorPerformance(
        vendorData
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


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="page-loading">

        Loading analytics...

      </div>

    );

  }


  // =========================================
  // PAGE
  // =========================================

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

          <button
            className="nav-item"
            onClick={onDashboard}
          >
            Dashboard
          </button>


          <button
            className="nav-item"
            onClick={onVendors}
          >
            Vendors
          </button>


          <button
            className="nav-item"
            onClick={onProducts}
          >
            Products
          </button>


          <button
            className="nav-item active"
            onClick={onAnalytics}
          >
            Analytics
          </button>

        </nav>


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
            VENDOR PERFORMANCE
        ====================================== */}

        <section className="analytics-section">

          <h2>
            Vendor Performance
          </h2>

          <p className="analytics-description">
            Compare sales and revenue generated by each vendor.
          </p>


          {vendorPerformance.length === 0 ? (

            <div className="empty-state">
              No vendor performance data available.
            </div>

          ) : (

            <div className="vendor-performance-grid">


              {/* =================================
                  SALES BY VENDOR
              ================================== */}

              <div className="vendor-performance-card">

                <h3>
                  Sales by Vendor
                </h3>


                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={vendorPerformance}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 5,
                      bottom: 35
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.12)"
                    />


                    <XAxis
                      dataKey="vendor_name"
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
                      dataKey="total_sales"
                      name="Total Sales"
                      fill="#7c5cff"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>


              {/* =================================
                  REVENUE BY VENDOR
              ================================== */}

              <div className="vendor-performance-card">

                <h3>
                  Revenue by Vendor
                </h3>


                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={vendorPerformance}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 5,
                      bottom: 35
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.12)"
                    />


                    <XAxis
                      dataKey="vendor_name"
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
                      name="Total Revenue"
                      fill="#9b7cff"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>


            </div>

          )}

        </section>


      </main>

    </div>

  );

}


export default AdminAnalytics;