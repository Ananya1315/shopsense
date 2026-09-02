import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/vendorDashboard.css";


function VendorCustomerAnalytics({
  onDashboard,
  onProducts,
  onSales,
  onLogout
}) {

  // =========================================
  // CUSTOMER ANALYTICS
  // =========================================

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================
  // RECOMMENDATIONS
  // =========================================

  const [category, setCategory] =
    useState("electronics");

  const [recommendations, setRecommendations] =
    useState([]);

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


          <button className="active">
            Customer Analytics
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
          Customer Analytics
        </h1>


        <p className="vendor-page-subtitle">
          Understand customer spending behavior and segments.
        </p>


        {/* =================================
            SUMMARY CARDS
        ================================== */}

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
              {
                customers.filter(
                  (customer) =>
                    customer.segment === "High Value"
                ).length
              }
            </p>

          </div>


          <div className="vendor-stat-card">

            <h3>
              Medium Value Customers
            </h3>

            <p>
              {
                customers.filter(
                  (customer) =>
                    customer.segment === "Medium Value"
                ).length
              }
            </p>

          </div>


          <div className="vendor-stat-card">

            <h3>
              Low Value Customers
            </h3>

            <p>
              {
                customers.filter(
                  (customer) =>
                    customer.segment === "Low Value"
                ).length
              }
            </p>

          </div>

        </div>


        {/* =================================
            CUSTOMER SEGMENTATION
        ================================== */}

        <div className="vendor-section">

          <h2>
            Customer Segmentation
          </h2>


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

                {customers.map((customer) => (

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

                ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================
            RULE-BASED RECOMMENDATIONS
        ================================== */}

        <div className="vendor-section">

          <h2>
            Product Recommendations
          </h2>


          <p className="vendor-page-subtitle">
            Top-selling products based on historical sales.
          </p>


          {/* Category input */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginBottom: "25px",
              marginTop: "20px"
            }}
          >

            <input
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="Enter category"
              style={{
                padding: "13px 16px",
                borderRadius: "9px",
                border: "1px solid #666680",
                background: "#38384f",
                color: "white",
                fontSize: "16px",
                outline: "none",
                width: "250px"
              }}
            />


            <button
              className="vendor-primary-button"
              onClick={fetchRecommendations}
            >
              Get Recommendations
            </button>

          </div>


          {/* Recommendation loading */}

          {recommendationLoading && (

            <div className="vendor-loading">
              Loading recommendations...
            </div>

          )}


          {/* Recommendation error */}

          {recommendationError && (

            <p>
              {recommendationError}
            </p>

          )}


          {/* Recommendations table */}

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


          {/* No recommendations */}

          {!recommendationLoading &&
            !recommendationError &&
            recommendations.length === 0 && (

            <div className="vendor-stat-card">

              <h3>
                No Sales Data
              </h3>

              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#b8b8d0"
                }}
              >
                No historical sales were found
                for this category.
              </p>

            </div>

          )}

        </div>

      </main>

    </div>

  );

}


export default VendorCustomerAnalytics;