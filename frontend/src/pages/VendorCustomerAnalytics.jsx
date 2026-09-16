import { useEffect, useState } from "react";

import api from "../api/axios";

import "../styles/vendorDashboard.css";
import "../styles/vendorCustomerAnalytics.css";


function VendorCustomerAnalytics({
  onDashboard,
  onProducts,
  onSales,
  onAnalytics,
  onVendorAnalytics,
  onForecast,
  onLogout
}) {

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("electronics");

  const [recommendations, setRecommendations] = useState([]);

  const [recommendationLoading, setRecommendationLoading] =
    useState(false);

  const [recommendationError, setRecommendationError] =
    useState("");


  // =========================================
  // FETCH CUSTOMER ANALYTICS
  // =========================================

  const fetchCustomerAnalytics = async () => {

    try {

      const token =
        localStorage.getItem("access_token");

      const response = await api.get(
        "/analytics/customer-segmentation",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch customer analytics:",
        error
      );

      setError(
        "Failed to load customer analytics"
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // FETCH RECOMMENDATIONS
  // =========================================

  const fetchRecommendations = async () => {

    if (!category.trim()) {

      setRecommendations([]);

      return;

    }


    try {

      setRecommendationLoading(true);
      setRecommendationError("");

      const token =
        localStorage.getItem("access_token");

      const response = await api.get(
        `/analytics/recommendations/${category.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecommendations(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch recommendations:",
        error
      );

      setRecommendationError(
        "Failed to load recommendations"
      );

      setRecommendations([]);

    } finally {

      setRecommendationLoading(false);

    }

  };


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    fetchCustomerAnalytics();
    fetchRecommendations();

  }, []);


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (
      <div className="vendor-loading">
        Loading customer analytics...
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
  // CUSTOMER COUNTS
  // =========================================

  const highValueCustomers =
    customers.filter(
      (customer) =>
        customer.segment === "High Value"
    ).length;

  const mediumValueCustomers =
    customers.filter(
      (customer) =>
        customer.segment === "Medium Value"
    ).length;

  const lowValueCustomers =
    customers.filter(
      (customer) =>
        customer.segment === "Low Value"
    ).length;


  // =========================================
  // PAGE
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
            className="active"
            onClick={onAnalytics}
          >
            Customer Analytics
          </button>


          <button
            onClick={onVendorAnalytics}
          >
            My Analytics
          </button>
                  <button onClick={onForecast}>
  Sales Forecast
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

          <h1 className="vendor-page-title">
            Customer Analytics
          </h1>

          <p className="vendor-page-subtitle">
            Understand customer spending behavior and segments.
          </p>

        </div>


        {/* =================================
            SUMMARY
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Customer Overview
          </h2>


          <div className="vendor-stats">

            <div className="vendor-stat-card">

              <h3>
                Total Customers
              </h3>

              <p>
                {customers.length}
              </p>

            </div>


            <div className="vendor-stat-card">

              <h3>
                High Value Customers
              </h3>

              <p>
                {highValueCustomers}
              </p>

            </div>


            <div className="vendor-stat-card">

              <h3>
                Medium Value Customers
              </h3>

              <p>
                {mediumValueCustomers}
              </p>

            </div>


            <div className="vendor-stat-card">

              <h3>
                Low Value Customers
              </h3>

              <p>
                {lowValueCustomers}
              </p>

            </div>

          </div>

        </section>


        {/* =================================
            CUSTOMER SEGMENTATION
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Customer Segmentation
          </h2>

          <p className="analytics-section-description">
            Customers grouped according to their spending behavior.
          </p>


          <div className="vendor-table-container">

            <table className="vendor-table">

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Area
                  </th>

                  <th>
                    Orders
                  </th>

                  <th>
                    Total Spent
                  </th>

                  <th>
                    Average Order Value
                  </th>

                  <th>
                    Segment
                  </th>

                </tr>

              </thead>


              <tbody>

                {customers.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="empty-analytics"
                    >
                      No customer data available.
                    </td>

                  </tr>

                ) : (

                  customers.map((customer) => (

                    <tr
                      key={customer.customer_id}
                    >

                      <td>
                        {customer.customer_name}
                      </td>


                      <td>
                        {customer.area}
                      </td>


                      <td>
                        {customer.total_orders}
                      </td>


                      <td>
                        ₹{" "}
                        {Number(
                          customer.total_spent
                        ).toLocaleString("en-IN")}
                      </td>


                      <td>
                        ₹{" "}
                        {Number(
                          customer.average_order_value
                        ).toLocaleString("en-IN")}
                      </td>


                      <td>

                        <span
                          className={`vendor-status ${
                            customer.segment === "High Value"
                              ? "in-stock"
                              : customer.segment === "Medium Value"
                              ? "low-stock"
                              : "out-stock"
                          }`}
                        >
                          {customer.segment}
                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =================================
            PRODUCT RECOMMENDATIONS
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Product Recommendations
          </h2>

          <p className="analytics-section-description">
            View top-selling products based on historical sales.
          </p>


          {/* CATEGORY SEARCH */}

          <div className="recommendation-controls">

            <input
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="Enter category"
              className="category-input"
            />


            <button
              className="vendor-primary-button"
              onClick={fetchRecommendations}
              disabled={recommendationLoading}
            >
              {recommendationLoading
                ? "Loading..."
                : "Get Recommendations"}
            </button>

          </div>


          {/* RECOMMENDATION ERROR */}

          {recommendationError && (

            <p className="recommendation-error">
              {recommendationError}
            </p>

          )}


          {/* RECOMMENDATION TABLE */}

          {!recommendationLoading &&
            recommendations.length > 0 && (

            <div className="vendor-table-container">

              <table className="vendor-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Units Sold
                    </th>

                    <th>
                      Recommendation
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recommendations.map(
                    (product) => (

                    <tr
                      key={product.product_id}
                    >

                      <td>
                        {product.product_name}
                      </td>


                      <td>
                        {product.category}
                      </td>


                      <td>
                        {product.total_sold}
                      </td>


                      <td>

                        <span
                          className={`vendor-status ${
                            product.total_sold >= 2
                              ? "in-stock"
                              : "low-stock"
                          }`}
                        >
                          {product.total_sold >= 2
                            ? "Top Seller"
                            : "Recommended"}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}


          {/* NO RECOMMENDATIONS */}

          {!recommendationLoading &&
            !recommendationError &&
            recommendations.length === 0 && (

            <div className="analytics-empty-card">

              <h3>
                No Sales Data
              </h3>

              <p>
                No historical sales were found for this category.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>

  );

}


export default VendorCustomerAnalytics;