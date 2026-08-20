import { useEffect, useState } from "react";

import api from "../api/axios";

import "../styles/vendorManagement.css";
;


function VendorManagement({
  onDashboard,
  onProducts,
  onAnalytics,
  onLogout
}) {

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchVendors = async () => {

    try {

      const token = localStorage.getItem("access_token");

      const response = await api.get("/vendors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Vendors received:", response.data);

      setVendors(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch vendors:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchVendors();

  }, []);


  const approveVendor = async (vendorId) => {

    try {

      const token = localStorage.getItem("access_token");

      await api.put(
        `/vendors/${vendorId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchVendors();

    } catch (error) {

      console.error(
        "Failed to approve vendor:",
        error
      );

    }

  };


  const rejectVendor = async (vendorId) => {

    try {

      const token = localStorage.getItem("access_token");

      await api.put(
        `/vendors/${vendorId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchVendors();

    } catch (error) {

      console.error(
        "Failed to reject vendor:",
        error
      );

    }

  };


  if (loading) {

    return (
      <div className="page-loading">
        Loading vendors...
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


          <button className="nav-item active">
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
              Vendor Management
            </h1>

            <p>
              Manage vendor accounts and registration requests.
            </p>

          </div>

        </div>


        <div className="vendor-table-container">

          <table className="vendor-table">

            <thead>

              <tr>

                <th>Name</th>

                <th>Email</th>

                <th>Phone</th>

                <th>Role</th>

                <th>Status</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {vendors.map((vendor) => (

                <tr key={vendor.vendor_id}>

                  <td>
                    {vendor.name}
                  </td>


                  <td>
                    {vendor.email}
                  </td>


                  <td>
                    {vendor.phone}
                  </td>


                  <td>
                    {vendor.role}
                  </td>


                  <td>

                    <span
                      className={`status ${vendor.status}`}
                    >
                      {vendor.status}
                    </span>

                  </td>


                  <td>

                    {vendor.status === "pending" ? (

                      <div className="vendor-actions">

                        <button
                          className="approve-button"
                          onClick={() =>
                            approveVendor(
                              vendor.vendor_id
                            )
                          }
                        >
                          Approve
                        </button>


                        <button
                          className="reject-button"
                          onClick={() =>
                            rejectVendor(
                              vendor.vendor_id
                            )
                          }
                        >
                          Reject
                        </button>

                      </div>

                    ) : (

                      <span className="no-action">
                        —
                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </main>

    </div>

  );

}


export default VendorManagement;