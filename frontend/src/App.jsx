import { useEffect, useState } from "react";

import Login from "./pages/login";

import AdminDashboard from "./pages/dashboard";
import VendorManagement from "./pages/VendorManagement";
import AdminProducts from "./pages/AdminProducts";
import AdminAnalytics from "./pages/AdminAnalytics";

import VendorDashboard from "./pages/VendorDashboard";
import VendorProducts from "./pages/VendorProducts";
import VendorSales from "./pages/VendorSales";
import VendorCustomerAnalytics from "./pages/VendorCustomerAnalytics";

import "./App.css";
import "./styles/dashboard.css";
import "./styles/vendorDashboard.css";


function App() {

  // =========================================
  // AUTHENTICATION
  // =========================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [role, setRole] = useState(null);


  // =========================================
  // GET ROLE FROM JWT
  // =========================================

  const getRoleFromToken = () => {

    const token = localStorage.getItem("access_token");

    if (!token) {
      return null;
    }

    try {

      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const base64Url = parts[1];

      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const payload = JSON.parse(
        atob(base64)
      );

      return payload.role || null;

    } catch (error) {

      console.error(
        "Failed to decode JWT:",
        error
      );

      return null;

    }

  };


  // =========================================
  // CHECK LOGIN WHEN APP LOADS
  // =========================================

  useEffect(() => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {

      setIsLoggedIn(false);
      setRole(null);

      return;

    }

    const userRole =
      getRoleFromToken();

    console.log(
      "Existing login role:",
      userRole
    );

    if (userRole) {

      setRole(userRole);
      setIsLoggedIn(true);

    } else {

      localStorage.removeItem(
        "access_token"
      );

      setRole(null);
      setIsLoggedIn(false);

    }

  }, []);


  // =========================================
  // LOGIN SUCCESS
  // =========================================

  const handleLoginSuccess = () => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {

      console.error(
        "No access token found after login."
      );

      return;

    }

    const userRole =
      getRoleFromToken();

    console.log(
      "Logged in role:",
      userRole
    );

    if (!userRole) {

      console.error(
        "No role found in JWT."
      );

      localStorage.removeItem(
        "access_token"
      );

      setIsLoggedIn(false);
      setRole(null);

      return;

    }

    setRole(userRole);
    setIsLoggedIn(true);

  };


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {

    console.log("Logging out...");

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "vendor"
    );

    setRole(null);
    setIsLoggedIn(false);

  };


  // =========================================
  // LOGIN PAGE
  // =========================================

  if (!isLoggedIn) {

    return (
      <Login
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    );

  }


  // =========================================
  // ROLE LOADING
  // =========================================

  if (!role) {

    return (
      <div className="page-loading">
        Loading...
      </div>
    );

  }


  // =========================================
  // ADMIN
  // =========================================

  if (role === "admin") {

    return (
      <AdminApp
        onLogout={handleLogout}
      />
    );

  }


  // =========================================
  // VENDOR
  // =========================================

  if (role === "vendor") {

    return (
      <VendorApp
        onLogout={handleLogout}
      />
    );

  }


  // =========================================
  // UNKNOWN ROLE
  // =========================================

  return (
    <div className="page-loading">
      Unknown user role.
    </div>
  );

}


// =====================================================
// ADMIN APPLICATION
// =====================================================

function AdminApp({ onLogout }) {

  const [activePage, setActivePage] =
    useState("dashboard");


  // =========================================
  // DASHBOARD
  // =========================================

  if (activePage === "dashboard") {

    return (
      <AdminDashboard
        onDashboard={() =>
          setActivePage("dashboard")
        }

        onVendors={() =>
          setActivePage("vendors")
        }

        onProducts={() =>
          setActivePage("products")
        }

        onAnalytics={() =>
          setActivePage("analytics")
        }

        onLogout={onLogout}
      />
    );

  }


  // =========================================
  // VENDORS
  // =========================================

  if (activePage === "vendors") {

    return (
      <VendorManagement
        onDashboard={() =>
          setActivePage("dashboard")
        }

        onProducts={() =>
          setActivePage("products")
        }

        onAnalytics={() =>
          setActivePage("analytics")
        }

        onLogout={onLogout}
      />
    );

  }


  // =========================================
  // PRODUCTS
  // =========================================

  if (activePage === "products") {

    return (
      <AdminProducts
        onDashboard={() =>
          setActivePage("dashboard")
        }

        onVendors={() =>
          setActivePage("vendors")
        }

        onAnalytics={() =>
          setActivePage("analytics")
        }

        onLogout={onLogout}
      />
    );

  }


  // =========================================
  // ANALYTICS
  // =========================================

  if (activePage === "analytics") {

    return (
      <AdminAnalytics
        onDashboard={() =>
          setActivePage("dashboard")
        }

        onVendors={() =>
          setActivePage("vendors")
        }

        onProducts={() =>
          setActivePage("products")
        }

        onLogout={onLogout}
      />
    );

  }


  return null;

}


// =====================================================
// VENDOR APPLICATION
// =====================================================

function VendorApp({ onLogout }) {

  const [activePage, setActivePage] =
    useState("dashboard");


  // =========================================
  // DASHBOARD
  // =========================================

  if (activePage === "dashboard") {

    return (
      <VendorDashboard

        onDashboard={() =>
          setActivePage("dashboard")
        }

        onProducts={() =>
          setActivePage("products")
        }

        onSales={() =>
          setActivePage("sales")
        }

        onAnalytics={() =>
          setActivePage("analytics")
        }

        onLogout={onLogout}

      />
    );

  }


  // =========================================
  // PRODUCTS
  // =========================================

  if (activePage === "products") {

    return (
      <VendorProducts

        onDashboard={() =>
          setActivePage("dashboard")
        }

        onSales={() =>
          setActivePage("sales")
        }

        onAnalytics={() =>
          setActivePage("analytics")
        }

        onLogout={onLogout}

      />
    );

  }


  // =========================================
  // SALES
  // =========================================

  if (activePage === "sales") {

    return (
      <VendorSales

        onDashboard={() =>
          setActivePage("dashboard")
        }

        onProducts={() =>
          setActivePage("products")
        }

        onAnalytics={() =>
          setActivePage("analytics")
        }

        onLogout={onLogout}

      />
    );

  }


  // =========================================
  // CUSTOMER ANALYTICS
  // =========================================

  if (activePage === "analytics") {

    return (
      <VendorCustomerAnalytics

        onDashboard={() =>
          setActivePage("dashboard")
        }

        onProducts={() =>
          setActivePage("products")
        }

        onSales={() =>
          setActivePage("sales")
        }

        onLogout={onLogout}

      />
    );

  }


  return null;

}


export default App;