import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/customerShop.css";

function CustomerShop({ onCart, onOrders, onLogout }) {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStockStatus = (stock) => {
    if (stock === 0) return "out-of-stock";
    if (stock < 5) return "low-stock";
    return "in-stock";
  };

  const getStockText = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 5) return `Only ${stock} left`;
    return "In Stock";
  };

  if (loading) {
    return (
      <div className="customer-loading">
        Loading ShopSense...
      </div>
    );
  }

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

          <button className="customer-nav-item active">
            🛍️ Shop
          </button>

          <button
            className="customer-nav-item"
            onClick={onCart}
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
          MAIN CONTENT
      ================================= */}

      <main className="customer-main">

        <div className="customer-header">

          <div>
            <h1>Shop</h1>

            <p>
              Discover products from our marketplace.
            </p>
          </div>

          <button
            className="header-cart-button"
            onClick={onCart}
          >
            🛒 Cart
          </button>

        </div>


        {/* ================================
            PRODUCTS
        ================================= */}

        <section className="customer-products-section">

          <div className="products-heading">

            <h2>All Products</h2>

            <span>
              {products.length} products
            </span>

          </div>


          <div className="customer-product-grid">

            {products.length === 0 ? (

              <div className="no-customer-products">
                No products available.
              </div>

            ) : (

              products.map((product) => (

                <div
                  className="customer-product-card"
                  key={product.product_id}
                >

                  {/* IMAGE */}

                  <div className="customer-product-image">

                    {product.image_url ? (

                      <img
                        src={product.image_url}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.parentElement.classList.add(
                            "image-fallback"
                          );
                        }}
                      />

                    ) : (

                      <div className="image-placeholder">
                        📦
                      </div>

                    )}

                  </div>


                  {/* PRODUCT INFO */}

                  <div className="customer-product-info">

                    <span className="product-category">
                      {product.category || "General"}
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="product-description">
                      {product.description ||
                        "Quality product available on ShopSense."}
                    </p>

                    <div className="product-price">

                      ₹{" "}
                      {Number(product.price).toLocaleString("en-IN")}

                    </div>


                    {/* STOCK */}

                    <div
                      className={`customer-stock ${getStockStatus(
                        product.stock
                      )}`}
                    >
                      {getStockText(product.stock)}
                    </div>


                    {/* CART BUTTON */}

                    <button
                      className="add-cart-button"
                      disabled={product.stock === 0}
                      onClick={() => onCart(product)}
                    >
                      {product.stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default CustomerShop;