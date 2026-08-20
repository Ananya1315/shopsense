import { useEffect, useState } from "react";

import api from "../api/axios";

import "../styles/vendorDashboard.css";
import "../styles/vendorProducts.css";


function VendorSales({
  onDashboard,
  onProducts,
  onLogout
}) {

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const fetchSalesData = async () => {

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );


      const response = await api.get(
        "/vendor/dashboard",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


      setDashboard(response.data);

    } catch (error) {

      console.error(
        "Failed to load sales:",
        error
      );

      setError(
        "Failed to load sales."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchSalesData();

  }, []);


  if (loading) {

    return (
      <div className="vendor-loading">
        Loading sales...
      </div>
    );

  }


  if (error) {

    return (
      <div className="vendor-loading">
        {error}
      </div>
    );

  }


  return (

    <div className="vendor-layout">


      {/* SIDEBAR */}

      <aside className="vendor-sidebar">

        <h1 className="vendor-logo">
          ShopSense
        </h1>


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


          <button className="active">
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


      {/* MAIN */}

      <main className="vendor-main">

        <h1 className="vendor-page-title">
          Sales
        </h1>


        <p className="vendor-page-subtitle">
          Track your sales and revenue.
        </p>


        <div className="vendor-stats">


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


        </div>


        <div className="vendor-section">

          <h2>
            Sales Summary
          </h2>


          <div className="vendor-table-container">

            <table className="vendor-table">

              <thead>

                <tr>

                  <th>
                    Metric
                  </th>

                  <th>
                    Value
                  </th>

                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>
                    Total Products Sold
                  </td>

                  <td>
                    {dashboard?.total_sales ?? 0}
                  </td>

                </tr>


                <tr>

                  <td>
                    Total Revenue
                  </td>

                  <td>
                    ₹{" "}
                    {Number(
                      dashboard?.total_revenue ?? 0
                    ).toLocaleString("en-IN")}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>


      </main>

    </div>

  );

}


export default VendorSales;