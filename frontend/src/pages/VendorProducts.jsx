import { useEffect, useState } from "react";

import api from "../api/axios";

import "../styles/vendorProducts.css";


function VendorProducts({
  onDashboard,
  onSales,
  onLogout
}) {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  // AI GENERATION LOADING STATE
  const [generatingAI, setGeneratingAI] =
    useState(false);


  const [form, setForm] = useState({

    name: "",
    description: "",
    seo_tags: "",
    seo_keywords: "",
    price: "",
    stock: "",
    category: ""

  });


  // =========================================
  // FETCH PRODUCTS
  // =========================================

  const fetchProducts = async () => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem("access_token");


      const response = await api.get(
        "/vendor/products",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


      setProducts(response.data);

      setError("");

    } catch (error) {

      console.error(
        "Failed to fetch products:",
        error
      );

      setError(
        "Failed to load products."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchProducts();

  }, []);


  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm((previous) => ({

      ...previous,

      [name]: value

    }));

  };


  // =========================================
  // GENERATE AI SEO CONTENT
  // =========================================

  const generateAIContent = async () => {

    // Product name is required
    if (!form.name.trim()) {

      alert(
        "Please enter the product name first."
      );

      return;

    }


    // Category is required
    if (!form.category.trim()) {

      alert(
        "Please enter the category first."
      );

      return;

    }


    try {

      setGeneratingAI(true);


      const token =
        localStorage.getItem("access_token");


      const response = await api.post(

        "/vendor/products/generate-seo",

        null,

        {
          params: {
            product_name:
              form.name,

            category:
              form.category
          },

          headers: {
            Authorization:
              `Bearer ${token}`
          }

        }

      );


      // Put AI-generated values
      // directly into the form

      setForm((previous) => ({

        ...previous,

        description:
          response.data.description || "",

        seo_tags:
          response.data.seo_tags || "",

        seo_keywords:
          response.data.seo_keywords || ""

      }));


      alert(
        "AI content generated successfully!"
      );

    } catch (error) {

      console.error(
        "AI content generation failed:",
        error
      );


      alert(

        error.response?.data?.detail ||

        "Failed to generate AI content."

      );

    } finally {

      setGeneratingAI(false);

    }

  };


  // =========================================
  // OPEN ADD FORM
  // =========================================

  const openAddForm = () => {

    setEditingProduct(null);

    setForm({

      name: "",
      description: "",
      seo_tags: "",
      seo_keywords: "",
      price: "",
      stock: "",
      category: ""

    });

    setShowForm(true);

  };


  // =========================================
  // OPEN EDIT FORM
  // =========================================

  const openEditForm = (product) => {

    setEditingProduct(product);

    setForm({

      name:
        product.name || "",

      description:
        product.description || "",

      seo_tags:
        product.seo_tags || "",

      seo_keywords:
        product.seo_keywords || "",

      price:
        product.price ?? "",

      stock:
        product.stock ?? "",

      category:
        product.category || ""

    });

    setShowForm(true);

  };


  // =========================================
  // SUBMIT PRODUCT
  // =========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    try {

      const token =
        localStorage.getItem("access_token");


      const productData = {

        name:
          form.name,

        description:
          form.description,

        seo_tags:
          form.seo_tags,

        seo_keywords:
          form.seo_keywords,

        price:
          Number(form.price),

        stock:
          Number(form.stock),

        category:
          form.category

      };


      if (editingProduct) {

        await api.put(

          `/vendor/products/${editingProduct.product_id}`,

          productData,

          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }

        );

        alert(
          "Product updated successfully!"
        );

      } else {

        await api.post(

          "/vendor/products",

          productData,

          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }

        );

        alert(
          "Product added successfully!"
        );

      }


      setShowForm(false);

      setEditingProduct(null);

      await fetchProducts();

    } catch (error) {

      console.error(
        "Product save failed:",
        error
      );

      alert(

        error.response?.data?.detail ||

        "Failed to save product."

      );

    }

  };


  // =========================================
  // DELETE PRODUCT
  // =========================================

  const deleteProduct = async (productId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );


    if (!confirmed) {
      return;
    }


    try {

      const token =
        localStorage.getItem("access_token");


      await api.delete(

        `/vendor/products/${productId}`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );


      alert(
        "Product deleted successfully!"
      );


      await fetchProducts();

    } catch (error) {

      console.error(
        "Delete failed:",
        error
      );

      alert(

        error.response?.data?.detail ||

        "Failed to delete product."

      );

    }

  };


  // =========================================
  // UPDATE STOCK
  // =========================================

  const updateStock = async (product) => {

    const newStock =
      window.prompt(
        "Enter new stock:",
        product.stock
      );


    if (newStock === null) {
      return;
    }


    const stock =
      Number(newStock);


    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {

      alert(
        "Stock must be a non-negative integer."
      );

      return;

    }


    try {

      const token =
        localStorage.getItem("access_token");


      await api.put(

        `/vendor/products/${product.product_id}/stock`,

        {
          stock: stock
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );


      await fetchProducts();

    } catch (error) {

      console.error(
        "Stock update failed:",
        error
      );

      alert(

        error.response?.data?.detail ||

        "Failed to update stock."

      );

    }

  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="vendor-loading">

        Loading products...

      </div>

    );

  }


  // =========================================
  // PAGE
  // =========================================

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
            className="active"
          >
            My Products
          </button>


          <button
            onClick={onSales}
          >
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

        <div className="products-header">

          <div>

            <h1 className="vendor-page-title">
              My Products
            </h1>

            <p className="vendor-page-subtitle">
              Manage the products you sell on ShopSense.
            </p>

          </div>


          <button
            className="vendor-primary-button"
            onClick={openAddForm}
          >
            + Add Product
          </button>

        </div>


        {error && (

          <p className="product-error">
            {error}
          </p>

        )}


        {/* PRODUCT TABLE */}

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
                  Price
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {products.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="empty-products"
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

                    <td>
                      {product.name}
                    </td>

                    <td>
                      {product.category}
                    </td>

                    <td>

                      ₹{" "}

                      {Number(
                        product.price
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </td>

                    <td>
                      {product.stock}
                    </td>

                    <td>

                      <span
                        className={
                          product.stock === 0
                            ? "vendor-status out-stock"
                            : product.stock < 5
                            ? "vendor-status low-stock"
                            : "vendor-status in-stock"
                        }
                      >

                        {product.stock === 0
                          ? "Out of Stock"
                          : product.stock < 5
                          ? "Low Stock"
                          : "In Stock"}

                      </span>

                    </td>

                    <td>

                      <div className="product-actions">

                        <button
                          className="vendor-action-button"
                          onClick={() =>
                            openEditForm(
                              product
                            )
                          }
                        >
                          Edit
                        </button>


                        <button
                          className="vendor-action-button"
                          onClick={() =>
                            updateStock(
                              product
                            )
                          }
                        >
                          Stock
                        </button>


                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteProduct(
                              product.product_id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* ADD / EDIT FORM */}

        {showForm && (

          <div className="product-modal">

            <div className="product-form-card">

              <h2>

                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}

              </h2>


              <form
                onSubmit={handleSubmit}
              >


                {/* PRODUCT NAME */}

                <label>
                  Product Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />


                {/* CATEGORY */}

                <label>
                  Category
                </label>

                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />


                {/* PRICE */}

                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />


                {/* STOCK */}

                <label>
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  required
                />


                {/* AI GENERATION */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "10px",
                    marginBottom: "8px"
                  }}
                >

                  <label
                    style={{
                      margin: 0
                    }}
                  >
                    Description
                  </label>


                  <button
                    type="button"
                    className="vendor-primary-button"
                    onClick={generateAIContent}
                    disabled={generatingAI}
                    style={{
                      padding: "8px 14px",
                      fontSize: "14px"
                    }}
                  >

                    {generatingAI
                      ? "Generating..."
                      : "✨ Generate AI Content"}

                  </button>

                </div>


                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Leave empty and let AI generate the description."
                />


                {/* SEO TAGS */}

                <label>
                  SEO Tags
                </label>

                <input
                  name="seo_tags"
                  value={form.seo_tags}
                  onChange={handleChange}
                  placeholder="wireless, headphones, bluetooth"
                />


                {/* SEO KEYWORDS */}

                <label>
                  SEO Keywords
                </label>

                <input
                  name="seo_keywords"
                  value={form.seo_keywords}
                  onChange={handleChange}
                  placeholder="best wireless headphones"
                />


                {/* FORM BUTTONS */}

                <div className="form-buttons">

                  <button
                    type="submit"
                    className="vendor-primary-button"
                  >

                    {editingProduct
                      ? "Update Product"
                      : "Add Product"}

                  </button>


                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() =>
                      setShowForm(false)
                    }
                  >
                    Cancel
                  </button>

                </div>


              </form>

            </div>

          </div>

        )}

      </main>

    </div>

  );

}


export default VendorProducts;