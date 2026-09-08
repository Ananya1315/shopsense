import { useEffect, useState } from "react";

import api from "../api/axios";

import "../styles/dashboard.css";
import "../styles/vendorDashboard.css";


function VendorDashboard({
  onDashboard,
  onProducts,
  onSales,
  onAnalytics,
  onVendorAnalytics,
  onLogout
}) {

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================
  // AI CHAT STATE
  // =========================================

  const [chatOpen, setChatOpen] = useState(false);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text:
        "Hi! I'm your ShopSense AI Analyst 🤖 Ask me about your sales, revenue, products, inventory, or customers."
    }
  ]);

  const [aiLoading, setAiLoading] = useState(false);


  // =========================================
  // FETCH VENDOR DASHBOARD
  // =========================================

  const fetchDashboard = async () => {

    try {

      const token = localStorage.getItem("access_token");

      const response = await api.get(
        "/vendor/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch vendor dashboard:",
        error
      );

      setError("Failed to load dashboard");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchDashboard();

  }, []);


  // =========================================
  // ASK AI
  // =========================================

  const askAI = async (customQuestion = null) => {

    const userQuestion =
      customQuestion !== null
        ? customQuestion
        : question.trim();


    if (!userQuestion || aiLoading) {
      return;
    }


    // Add user message
    setMessages((previousMessages) => [

      ...previousMessages,

      {
        sender: "user",
        text: userQuestion
      }

    ]);


    setQuestion("");

    setAiLoading(true);


    try {

      const response = await api.post(
        "/ai/analyze",
        {
          question: userQuestion
        }
      );


      const data = response.data;


      let answer = "";


      // =====================================
      // FORMAT AI RESULT
      // =====================================

      if (
        data.results &&
        data.results.length > 0
      ) {

        const firstResult =
          data.results[0];


        const entries =
          Object.entries(firstResult);


        if (entries.length === 1) {

          const [key, value] =
            entries[0];


          if (
            key.toLowerCase().includes("revenue") ||
            key.toLowerCase().includes("amount") ||
            key.toLowerCase().includes("price")
          ) {

            answer =
              `${key.replaceAll("_", " ")}: ₹${Number(value).toLocaleString("en-IN")}`;

          } else {

            answer =
              `${key.replaceAll("_", " ")}: ${value}`;

          }

        } else {

          answer =
            data.results
              .map((row) => {

                return Object.entries(row)
                  .map(([key, value]) => {

                    if (
                      key.toLowerCase().includes("revenue") ||
                      key.toLowerCase().includes("amount") ||
                      key.toLowerCase().includes("price")
                    ) {

                      return `${key.replaceAll("_", " ")}: ₹${Number(value).toLocaleString("en-IN")}`;

                    }

                    return `${key.replaceAll("_", " ")}: ${value}`;

                  })
                  .join(" | ");

              })
              .join("\n");

        }

      } else {

        answer =
          "I couldn't find any matching data.";
      }


      setMessages((previousMessages) => [

        ...previousMessages,

        {
          sender: "ai",
          text: answer,
          sql: data.sql,
          results: data.results
        }

      ]);


    } catch (error) {

      console.error(
        "AI analysis failed:",
        error
      );


      setMessages((previousMessages) => [

        ...previousMessages,

        {
          sender: "ai",
          text:
            "Sorry, I couldn't analyze that question. Please try again."
        }

      ]);

    } finally {

      setAiLoading(false);

    }

  };


  // =========================================
  // HANDLE ENTER KEY
  // =========================================

  const handleKeyDown = (event) => {

    if (event.key === "Enter") {

      event.preventDefault();

      askAI();

    }

  };


  // =========================================
  // SUGGESTED QUESTIONS
  // =========================================

  const suggestedQuestions = [

    "Which product sold the most?",

    "What is my total revenue?",

    "Which products are low in stock?"

  ];


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (
      <div className="vendor-loading">
        Loading dashboard...
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

        <h2 className="vendor-logo">
          ShopSense
        </h2>


        <nav className="vendor-nav">

          <button
            className="active"
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


          <button
            onClick={onAnalytics}
          >
            Customer Analytics
          </button>


          <button
            onClick={onVendorAnalytics}
          >
            My Analytics
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

        <div className="vendor-header">

          <h1 className="vendor-page-title">
            Vendor Dashboard
          </h1>

          <p className="vendor-page-subtitle">
            Welcome back, {dashboard.vendor_name} 👋
          </p>

        </div>


        {/* =================================
            OVERVIEW STATISTICS
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Overview
          </h2>


          <div className="vendor-stats">

            <div className="vendor-stat-card">

              <h3>
                My Products
              </h3>

              <p>
                {dashboard.total_products}
              </p>

            </div>


            <div className="vendor-stat-card">

              <h3>
                Total Sales
              </h3>

              <p>
                {dashboard.total_sales}
              </p>

            </div>


            <div className="vendor-stat-card">

              <h3>
                Total Revenue
              </h3>

              <p>
                ₹{" "}
                {Number(
                  dashboard.total_revenue
                ).toLocaleString("en-IN")}
              </p>

            </div>


            <div className="vendor-stat-card">

              <h3>
                Inventory Value
              </h3>

              <p>
                ₹{" "}
                {Number(
                  dashboard.inventory_value
                ).toLocaleString("en-IN")}
              </p>

            </div>

          </div>

        </section>


        {/* =================================
            INVENTORY STATUS
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Inventory Status
          </h2>


          <div className="inventory-status-grid">

            <div className="vendor-stat-card inventory-card">

              <div>

                <h3>
                  Low Stock Products
                </h3>

                <span className="inventory-description">
                  Products that need restocking
                </span>

              </div>

              <p>
                {dashboard.low_stock_count}
              </p>

            </div>


            <div className="vendor-stat-card inventory-card">

              <div>

                <h3>
                  Total Products
                </h3>

                <span className="inventory-description">
                  Products currently listed
                </span>

              </div>

              <p>
                {dashboard.total_products}
              </p>

            </div>

          </div>

        </section>


        {/* =================================
            QUICK ACTIONS
        ================================== */}

        <section className="vendor-section">

          <h2 className="vendor-section-title">
            Quick Actions
          </h2>


          <div className="vendor-actions">

            <button
              className="vendor-primary-button"
              onClick={onProducts}
            >
              + Add Product
            </button>


            <button
              className="vendor-action-button"
              onClick={onProducts}
            >
              Manage Products
            </button>

          </div>

        </section>

      </main>


      {/* =====================================
          AI CHATBOT
      ====================================== */}

      {!chatOpen && (

        <button
          className="ai-chat-button"
          onClick={() => setChatOpen(true)}
          title="Open ShopSense AI Analyst"
        >
          🤖
        </button>

      )}


      {/* =====================================
          AI CHAT WINDOW
      ====================================== */}

      {chatOpen && (

        <div className="ai-chat-window">

          {/* CHAT HEADER */}

          <div className="ai-chat-header">

            <div>

              <h3>
                🤖 ShopSense AI
              </h3>

              <span>
                AI Data Analyst
              </span>

            </div>


            <button
              className="ai-chat-close"
              onClick={() => setChatOpen(false)}
            >
              ×
            </button>

          </div>


          {/* CHAT MESSAGES */}

          <div className="ai-chat-messages">

            {messages.map((message, index) => (

              <div
                key={index}
                className={
                  message.sender === "user"
                    ? "ai-message user-message"
                    : "ai-message bot-message"
                }
              >

                <div className="message-bubble">

                  {message.text
                    .split("\n")
                    .map((line, lineIndex) => (

                      <div key={lineIndex}>
                        {line}
                      </div>

                    ))
                  }

                </div>


                {/* GENERATED SQL */}

                {message.sender === "ai" &&
                  message.sql && (

                  <details className="sql-details">

                    <summary>
                      View generated SQL
                    </summary>

                    <pre>
                      {message.sql}
                    </pre>

                  </details>

                )}

              </div>

            ))}


            {/* LOADING */}

            {aiLoading && (

              <div className="ai-message bot-message">

                <div className="message-bubble ai-typing">

                  ShopSense AI is analyzing...

                </div>

              </div>

            )}

          </div>


          {/* SUGGESTED QUESTIONS */}

          {messages.length === 1 && (

            <div className="ai-suggestions">

              <p>
                Try asking:
              </p>


              {suggestedQuestions.map(
                (suggestion, index) => (

                  <button
                    key={index}
                    onClick={() =>
                      askAI(suggestion)
                    }
                  >
                    {suggestion}
                  </button>

                )
              )}

            </div>

          )}


          {/* CHAT INPUT */}

          <div className="ai-chat-input">

            <input
              type="text"
              placeholder="Ask about your business..."
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={aiLoading}
            />


            <button
              onClick={() => askAI()}
              disabled={
                !question.trim() ||
                aiLoading
              }
            >
              ➤
            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default VendorDashboard;