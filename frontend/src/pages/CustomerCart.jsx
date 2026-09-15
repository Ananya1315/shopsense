import { useState } from "react";
import axios from "axios";

import "../styles/customerCart.css";


function CustomerCart({
  cart,
  onShop,
  onOrders,
  onRemove,
  onUpdateQuantity,
  onClearCart,
  onLogout
}) {


  // =========================================
  // CHECKOUT STATE
  // =========================================

  const [checkingOut, setCheckingOut] =
    useState(false);

  const [checkoutMessage, setCheckoutMessage] =
    useState("");

  const [checkoutError, setCheckoutError] =
    useState("");


  // =========================================
  // CART TOTAL
  // =========================================

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );


  // =========================================
  // TOTAL ITEMS
  // =========================================

  const totalItems = cart.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );


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

      const parts =
        token.split(".");

      if (parts.length !== 3) {
        return null;
      }


      // JWT uses URL-safe Base64

      const base64Url =
        parts[1];

      let base64 =
        base64Url
          .replace(/-/g, "+")
          .replace(/_/g, "/");


      // Add Base64 padding if necessary

      while (base64.length % 4) {
        base64 += "=";
      }


      const payload =
        JSON.parse(
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
  // CHECKOUT
  // =========================================

  const handleCheckout = async () => {

    if (cart.length === 0) {
      return;
    }


    setCheckingOut(true);

    setCheckoutMessage("");

    setCheckoutError("");


    // -----------------------------------------
    // GET CUSTOMER ID
    // -----------------------------------------

    const customerId =
      getCustomerId();


    if (!customerId) {

      setCheckoutError(
        "Customer session not found. Please login again."
      );

      setCheckingOut(false);

      return;
    }


    try {

      const token =
        localStorage.getItem(
          "access_token"
        );


      // ---------------------------------------
      // CREATE TRANSACTIONS
      // ---------------------------------------

      for (const item of cart) {

        await axios.post(

          "http://127.0.0.1:8001/transactions",

          {
            customer_id:
              Number(customerId),

            product_id:
              Number(item.product_id),

            quantity:
              Number(item.quantity)
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }

        );

      }


      // ---------------------------------------
      // SUCCESS
      // ---------------------------------------

      setCheckoutMessage(
        "Order placed successfully! 🎉"
      );


      // Clear React cart

      onClearCart();


      // ---------------------------------------
      // GO TO ORDERS
      // ---------------------------------------

      setTimeout(() => {

        onOrders();

      }, 1200);


    } catch (error) {

      console.error(
        "Checkout failed:",
        error
      );


      const detail =
        error.response?.data?.detail;


      setCheckoutError(

        detail ||
        "Checkout failed. Please try again."

      );

    } finally {

      setCheckingOut(false);

    }

  };


  // =========================================
  // UI
  // =========================================

  return (

    <div className="customer-shop">


      {/* ================================
          SIDEBAR
      ================================= */}

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
            className="customer-nav-item active"
          >
            🛒 Cart
          </button>


          <button
            className="customer-nav-item"
            onClick={onOrders}
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


      {/* ================================
          MAIN
      ================================= */}

      <main className="customer-main">


        <div className="customer-header">


          <div>

            <h1>
              Your Cart
            </h1>

            <p>
              Review your selected products.
            </p>

          </div>


          <button
            className="header-cart-button"
            onClick={onShop}
          >
            ← Continue Shopping
          </button>


        </div>


        {/* ================================
            SUCCESS MESSAGE
        ================================= */}

        {checkoutMessage && (

          <div className="checkout-success">

            {checkoutMessage}

          </div>

        )}


        {/* ================================
            ERROR MESSAGE
        ================================= */}

        {checkoutError && (

          <div className="checkout-error">

            {checkoutError}

          </div>

        )}


        {cart.length === 0 ? (


          /* ============================
             EMPTY CART
          ============================ */

          <div className="empty-cart">


            <div className="empty-cart-icon">
              🛒
            </div>


            <h2>
              Your cart is empty
            </h2>


            <p>
              Browse our products and add
              something you love.
            </p>


            <button
              className="add-cart-button"
              onClick={onShop}
            >
              Start Shopping
            </button>


          </div>


        ) : (


          <div className="cart-layout">


            {/* ==========================
                CART ITEMS
            ========================== */}

            <section className="cart-items">


              <div className="cart-section-title">


                <h2>
                  Cart Items
                </h2>


                <span>

                  {totalItems} item
                  {totalItems !== 1
                    ? "s"
                    : ""}

                </span>


              </div>


              {cart.map((item) => (


                <div
                  className="cart-item"
                  key={item.product_id}
                >


                  {/* IMAGE */}

                  <div className="cart-item-image">


                    {item.image_url ? (


                      <img
                        src={item.image_url}
                        alt={item.name}
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


                  {/* DETAILS */}

                  <div className="cart-item-details">


                    <span className="cart-category">

                      {item.category ||
                        "General"}

                    </span>


                    <h3>
                      {item.name}
                    </h3>


                    <p>

                      ₹{" "}

                      {Number(item.price)
                        .toLocaleString(
                          "en-IN"
                        )}

                    </p>


                  </div>


                  {/* QUANTITY */}

                  <div className="quantity-control">


                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.product_id,
                          item.quantity - 1
                        )
                      }
                      disabled={
                        item.quantity <= 1
                      }
                    >
                      −
                    </button>


                    <span>
                      {item.quantity}
                    </span>


                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.product_id,
                          item.quantity + 1
                        )
                      }
                      disabled={
                        item.quantity >=
                        item.stock
                      }
                    >
                      +
                    </button>


                  </div>


                  {/* ITEM TOTAL */}

                  <div className="cart-item-total">

                    ₹{" "}

                    {(
                      Number(item.price) *
                      item.quantity
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </div>


                  {/* REMOVE */}

                  <button
                    className="remove-cart-item"
                    onClick={() =>
                      onRemove(
                        item.product_id
                      )
                    }
                  >
                    ×
                  </button>


                </div>

              ))}


            </section>


            {/* ==========================
                SUMMARY
            ========================== */}

            <aside className="cart-summary">


              <h2>
                Order Summary
              </h2>


              <div className="summary-row">

                <span>
                  Items
                </span>

                <span>
                  {totalItems}
                </span>

              </div>


              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <span>

                  ₹{" "}

                  {total.toLocaleString(
                    "en-IN"
                  )}

                </span>

              </div>


              <div className="summary-divider" />


              <div className="summary-total">

                <span>
                  Total
                </span>

                <strong>

                  ₹{" "}

                  {total.toLocaleString(
                    "en-IN"
                  )}

                </strong>

              </div>


              {/* ==========================
                  CHECKOUT BUTTON
              ========================== */}

              <button
                className="checkout-button"
                onClick={handleCheckout}
                disabled={checkingOut}
              >

                {checkingOut
                  ? "Processing Order..."
                  : "Proceed to Checkout"}

              </button>


            </aside>


          </div>

        )}

      </main>

    </div>

  );

}


export default CustomerCart;