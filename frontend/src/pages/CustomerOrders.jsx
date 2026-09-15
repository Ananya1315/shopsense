import { useEffect, useState } from "react";
import axios from "axios";

import "../styles/customerOrders.css";


function CustomerOrders({
  onShop,
  onCart,
  onLogout
}) {

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================
  // GET CUSTOMER ID FROM JWT
  // =========================================

  const getCustomerId = () => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      return null;
    }

    try {

      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const base64Url = parts[1];

      let base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      // Add Base64 padding
      while (base64.length % 4) {
        base64 += "=";
      }

      const payload = JSON.parse(
        atob(base64)
      );

      return payload.customer_id || null;

    } catch (error) {

      console.error(
        "Unable to decode customer token:",
        error
      );

      return null;
    }
  };


  // =========================================
  // FETCH ORDERS
  // =========================================

  useEffect(() => {

    const fetchOrders = async () => {

      setLoading(true);
      setError("");

      try {

        const token =
          localStorage.getItem("access_token");

        const customerId =
          getCustomerId();


        if (!customerId) {

          setError(
            "Customer session not found. Please login again."
          );

          setLoading(false);

          return;
        }


        // =====================================
        // GET CUSTOMER TRANSACTIONS
        // =====================================

        const ordersResponse =
          await axios.get(
            `http://127.0.0.1:8001/transactions/customer/${customerId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        setOrders(
          ordersResponse.data || []
        );


        // =====================================
        // GET PRODUCTS
        // =====================================

        const productsResponse =
          await axios.get(
            "http://127.0.0.1:8001/products"
          );


        setProducts(
          productsResponse.data || []
        );


      } catch (error) {

        console.error(
          "Failed to fetch orders:",
          error
        );

        setError(
          error.response?.data?.detail ||
          "Unable to load your orders."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchOrders();

  }, []);


  // =========================================
  // FIND PRODUCT
  // =========================================

  const getProduct = (productId) => {

    return products.find(
      (product) =>
        product.product_id === productId
    );

  };


  // =========================================
  // TOTAL SPENT
  // =========================================

  const totalSpent =
    orders.reduce(
      (sum, order) =>
        sum + Number(
          order.total_amount || 0
        ),
      0
    );


  // =========================================
  // TOTAL ITEMS
  // =========================================

  const totalItems =
    orders.reduce(
      (sum, order) =>
        sum + Number(
          order.quantity || 0
        ),
      0
    );


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="customer-shop">

        <aside className="customer-sidebar">

          <div className="customer-logo">
            ShopSense
          </div>

          <nav className="customer-nav">

            <button
              className="customer-nav-item"
              onClick={onShop}
            >
              🛍️ Shop
            </button>

            <button
              className="customer-nav-item"
              onClick={onCart}
            >
              🛒 Cart
            </button>

            <button
              className="customer-nav-item active"
            >
              📦 My Orders
            </button>

          </nav>

          <button
            className="customer-logout"
            onClick={onLogout}
          >
            Logout
          </button>

        </aside>


        <main className="customer-main">

          <div className="orders-loading">
            Loading your orders...
          </div>

        </main>

      </div>

    );
  }


  // =========================================
  // MAIN UI
  // =========================================

  return (

    <div className="customer-shop">


      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="customer-sidebar">

        <div className="customer-logo">
          ShopSense
        </div>


        <nav className="customer-nav">

          <button
            className="customer-nav-item"
            onClick={onShop}
          >
            🛍️ Shop
          </button>


          <button
            className="customer-nav-item"
            onClick={onCart}
          >
            🛒 Cart
          </button>


          <button
            className="customer-nav-item active"
          >
            📦 My Orders
          </button>

        </nav>


        <button
          className="customer-logout"
          onClick={onLogout}
        >
          Logout
        </button>

      </aside>


      {/* =====================================
          MAIN
      ====================================== */}

      <main className="customer-main">


        <div className="customer-header">

          <div>

            <h1>
              My Orders
            </h1>

            <p>
              View your purchase history and
              order details.
            </p>

          </div>


          <button
            className="header-cart-button"
            onClick={onShop}
          >
            ← Continue Shopping
          </button>

        </div>


        {/* =====================================
            ERROR
        ====================================== */}

        {error && (

          <div className="orders-error">
            {error}
          </div>

        )}


        {/* =====================================
            SUMMARY CARDS
        ====================================== */}

        {!error &&
          orders.length > 0 && (

          <div className="orders-summary">


            <div className="orders-stat-card">

              <span className="orders-stat-icon">
                📦
              </span>

              <div>

                <p>
                  Orders
                </p>

                <strong>
                  {orders.length}
                </strong>

              </div>

            </div>


            <div className="orders-stat-card">

              <span className="orders-stat-icon">
                🛍️
              </span>

              <div>

                <p>
                  Items Purchased
                </p>

                <strong>
                  {totalItems}
                </strong>

              </div>

            </div>


            <div className="orders-stat-card">

              <span className="orders-stat-icon">
                💰
              </span>

              <div>

                <p>
                  Total Spent
                </p>

                <strong>
                  ₹{" "}
                  {totalSpent.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>


          </div>

        )}


        {/* =====================================
            EMPTY ORDERS
        ====================================== */}

        {!error &&
          orders.length === 0 && (

          <div className="empty-orders">

            <div className="empty-orders-icon">
              📦
            </div>

            <h2>
              No orders yet
            </h2>

            <p>
              Your purchased products will
              appear here.
            </p>

            <button
              className="add-cart-button"
              onClick={onShop}
            >
              Start Shopping
            </button>

          </div>

        )}


        {/* =====================================
            ORDER LIST
        ====================================== */}

        {!error &&
          orders.length > 0 && (

          <section className="orders-section">


            <div className="orders-section-header">

              <h2>
                Purchase History
              </h2>

              <span>

                {orders.length} transaction
                {orders.length !== 1
                  ? "s"
                  : ""}

              </span>

            </div>


            <div className="orders-list">

              {orders.map((order) => {

                const product =
                  getProduct(
                    order.product_id
                  );


                return (

                  <div
                    className="order-card"
                    key={
                      order.transaction_id
                    }
                  >


                    {/* PRODUCT IMAGE */}

                    <div className="order-image">

                      {product?.image_url ? (

                        <img
                          src={
                            product.image_url
                          }
                          alt={
                            product.name ||
                            "Product"
                          }
                          onError={(event) => {

                            event.currentTarget.style.display =
                              "none";

                          }}
                        />

                      ) : (

                        <span>
                          📦
                        </span>

                      )}

                    </div>


                    {/* PRODUCT DETAILS */}

                    <div className="order-details">

                      <span className="order-category">

                        {product?.category ||
                          "Product"}

                      </span>


                      <h3>

                        {product?.name ||
                          `Product #${order.product_id}`}

                      </h3>


                      <p className="order-date">

                        Ordered on{" "}

                        {order.purchase_date
                          ? new Date(
                              order.purchase_date
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              }
                            )
                          : "Date unavailable"}

                      </p>

                    </div>


                    {/* QUANTITY */}

                    <div className="order-quantity">

                      <span>
                        Quantity
                      </span>

                      <strong>
                        {order.quantity}
                      </strong>

                    </div>


                    {/* AMOUNT */}

                    <div className="order-amount">

                      <span>
                        Total
                      </span>

                      <strong>

                        ₹{" "}

                        {Number(
                          order.total_amount
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </strong>

                    </div>


                    {/* STATUS */}

                    <div className="order-status">

                      <span>
                        ✓
                      </span>

                      Completed

                    </div>


                  </div>

                );

              })}

            </div>

          </section>

        )}

      </main>

    </div>

  );

}


export default CustomerOrders;