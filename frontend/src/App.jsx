import { useState } from "react";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import VendorManagement from "./pages/VendorManagement";
import AdminProducts from "./pages/AdminProducts";
import AdminAnalytics from "./pages/AdminAnalytics";


function App() {

  const [page, setPage] = useState("login");


  // LOGIN
  const handleLoginSuccess = () => {
    setPage("dashboard");
  };


  // DASHBOARD
  const handleDashboard = () => {
    setPage("dashboard");
  };


  // VENDOR MANAGEMENT
  const handleVendorManagement = () => {
    setPage("vendors");
  };


  // PRODUCTS
  const handleProducts = () => {
    setPage("products");
  };


  // ANALYTICS
  const handleAnalytics = () => {
    setPage("analytics");
  };


  // LOGOUT
  const handleLogout = () => {

    localStorage.removeItem("access_token");

    setPage("login");

  };


  // LOGIN PAGE
  if (page === "login") {

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );

  }


  // VENDOR MANAGEMENT PAGE
  if (page === "vendors") {

    return (
      <VendorManagement
        onDashboard={handleDashboard}
        onProducts={handleProducts}
        onAnalytics={handleAnalytics}
        onLogout={handleLogout}
      />
    );

  }


  // ADMIN PRODUCTS PAGE
  if (page === "products") {

    return (
      <AdminProducts
        onDashboard={handleDashboard}
        onVendors={handleVendorManagement}
        onAnalytics={handleAnalytics}
        onLogout={handleLogout}
      />
    );

  }


  // ADMIN ANALYTICS PAGE
  if (page === "analytics") {

    return (
      <AdminAnalytics
        onDashboard={handleDashboard}
        onVendors={handleVendorManagement}
        onProducts={handleProducts}
        onLogout={handleLogout}
      />
    );

  }


  // ADMIN DASHBOARD
  return (
    <Dashboard
      onVendorManagement={handleVendorManagement}
      onProducts={handleProducts}
      onAnalytics={handleAnalytics}
      onLogout={handleLogout}
    />
  );

}


export default App;