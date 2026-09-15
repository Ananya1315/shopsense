import { useEffect, useState } from "react";

import api from "../api/axios";

import "../styles/AdminProducts.css";


// =====================================
// PRODUCT IMAGE COMPONENT
// =====================================

function ProductImage({ src, name }) {

  const [imageError, setImageError] = useState(false);


  // No image or broken image
  if (!src || imageError) {

    return (
      <div
        style={{
          width: "58px",
          height: "58px",
          borderRadius: "10px",
          background: "rgba(93, 34, 232, 0.12)",
          border: "1px solid rgba(93, 34, 232, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          flexShrink: 0
        }}
      >
        📦
      </div>
    );

  }


  return (
    <img
      src={src}
      alt={name}
      onError={() => setImageError(true)}
      style={{
        width: "58px",
        height: "58px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.12)",
        display: "block",
        flexShrink: 0
      }}
    />
  );

}


function AdminProducts({
  onDashboard,
  onVendors,
  onAnalytics,
  onLogout
}) {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);


  // =====================================
  // FETCH PRODUCTS
  // =====================================

  const fetchProducts = async () => {

    try {

      const response =
        await api.get("/products");


      console.log(
        "Products received:",
        response.data
      );


      setProducts(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch products:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchProducts();

  }, []);


  // =====================================
  // STOCK STATUS
  // =====================================

  const getStockStatus = (stock) => {

    if (stock === 0) {
      return "out-of-stock";
    }

    if (stock < 5) {
      return "low-stock";
    }

    return "in-stock";

  };


  const getStockText = (stock) => {

    if (stock === 0) {
      return "Out of Stock";
    }

    if (stock < 5) {
      return "Low Stock";
    }

    return "In Stock";

  };


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (
      <div className="page-loading">
        Loading products...
      </div>
    );

  }


  // =====================================
  // PAGE
  // =====================================

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
            className="nav-item active"
          >
            Products
          </button>


          {/* Analytics */}

          <button
            className="nav-item"
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
              Product Management
            </h1>

            <p>
              View and monitor all products in the marketplace.
            </p>

          </div>

        </div>


        {/* =====================================
            PRODUCT TABLE
        ====================================== */}

        <div className="product-table-container">

          <table className="product-table">


            <thead>

              <tr>

                {/* NEW IMAGE COLUMN */}

                <th>
                  Image
                </th>


                <th>
                  Product
                </th>


                <th>
                  Category
                </th>


                <th>
                  Vendor ID
                </th>


                <th>
                  Price
                </th>


                <th>
                  Stock
                </th>


                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>


              {products.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="no-products"
                  >
                    No products found.
                  </td>

                </tr>

              ) : (

                products.map((product) => (

                  <tr
                    key={
                      product.product_id
                    }
                  >


                    {/* =====================================
                        PRODUCT IMAGE
                    ====================================== */}

                    <td>

                      <ProductImage
                        src={
                          product.image_url
                        }
                        name={
                          product.name
                        }
                      />

                    </td>


                    {/* =====================================
                        PRODUCT NAME
                    ====================================== */}

                    <td>

                      <div className="product-name">

                        {product.name}

                      </div>

                    </td>


                    {/* CATEGORY */}

                    <td>
                      {product.category}
                    </td>


                    {/* VENDOR */}

                    <td>
                      #{product.vendor_id}
                    </td>


                    {/* PRICE */}

                    <td>

                      ₹{" "}

                      {Number(
                        product.price
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </td>


                    {/* STOCK */}

                    <td>
                      {product.stock}
                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`stock-status ${getStockStatus(
                          product.stock
                        )}`}
                      >

                        {getStockText(
                          product.stock
                        )}

                      </span>

                    </td>


                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </main>

    </div>

  );

}


export default AdminProducts;