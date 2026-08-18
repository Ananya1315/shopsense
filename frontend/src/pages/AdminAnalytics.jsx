import { useEffect, useState } from "react";

import api from "../api/axios";

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

  const [loading, setLoading] = useState(true);


  const fetchAnalytics = async () => {

    try {

      const [
        avgPriceResponse,
        inventoryResponse,
        lowStockResponse,
        outOfStockResponse,
        topVendorResponse,
        vendorInventoryResponse
      ] = await Promise.all([

        api.get("/analytics/avg-price"),

        api.get("/analytics/inventory-value"),

        api.get("/analytics/low-stock"),

        api.get("/analytics/out-of-stock"),

        api.get("/analytics/top-vendor"),

        api.get("/analytics/inventory-value-by-vendor")

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


  if (loading) {

    return (
      <div className="page-loading">
        Loading analytics...
      </div>
    );

  }


  return (

    <div className="dashboard">

      {/* SIDEBAR */}

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
  className="nav-item"
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


      {/* MAIN CONTENT */}

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


        {/* ANALYTICS CARDS */}

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


        {/* TOP VENDOR */}

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


        {/* INVENTORY BY VENDOR */}

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


      </main>

    </div>

  );

}


export default AdminAnalytics;