import { useEffect, useState } from "react";

import api from "../api/axios";

import "../styles/adminProducts.css";


function AdminProducts({
  onDashboard,
  onVendors,
  onLogout
}) {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);


  const fetchProducts = async () => {

    try {

      const response = await api.get("/products");

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


  if (loading) {

    return (
      <div className="page-loading">
        Loading products...
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


          <button className="nav-item active">
            Products
          </button>


          <button className="nav-item">
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
              Product Management
            </h1>

            <p>
              View and monitor all products in the marketplace.
            </p>

          </div>

        </div>


        {/* PRODUCT TABLE */}

        <div className="product-table-container">

          <table className="product-table">

            <thead>

              <tr>

                <th>Product</th>

                <th>Category</th>

                <th>Vendor ID</th>

                <th>Price</th>

                <th>Stock</th>

                <th>Status</th>

              </tr>

            </thead>


            <tbody>

              {products.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="no-products"
                  >
                    No products found.
                  </td>

                </tr>

              ) : (

                products.map((product) => (

                  <tr
                    key={product.product_id}
                  >

                    <td>

                      <div className="product-name">

                        {product.name}

                      </div>

                    </td>


                    <td>
                      {product.category}
                    </td>


                    <td>
                      #{product.vendor_id}
                    </td>


                    <td>
                      ₹{" "}
                      {product.price.toLocaleString(
                        "en-IN"
                      )}
                    </td>


                    <td>
                      {product.stock}
                    </td>


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