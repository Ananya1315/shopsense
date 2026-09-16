import { useEffect, useState } from "react";

import api from "../api/axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import "../styles/salesForecast.css";


function SalesForecast({
  onDashboard,
  onProducts,
  onSales,
  onAnalytics,
  onVendorAnalytics,
  onForecast,
  onLogout
}) {

  const [forecast, setForecast] = useState([]);

  const [model, setModel] = useState("");

  const [parameters, setParameters] = useState(null);

  const [mae, setMae] = useState(null);

  const [rmse, setRmse] = useState(null);

  const [historicalDays, setHistoricalDays] =
    useState(null);

  const [forecastDays, setForecastDays] =
    useState(7);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");


  // =====================================================
  // FETCH FORECAST
  // =====================================================

  const fetchForecast = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token");

      const response = await api.get(
        `/ml/forecast-sales?days=${forecastDays}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data = response.data;

      setForecast(data.forecast || []);

      setModel(data.model || "");

      setParameters(
        data.parameters || null
      );

      setMae(data.mae);

      setRmse(data.rmse);

      setHistoricalDays(
        data.historical_days
      );

    } catch (error) {

      console.error(
        "Forecast failed:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Failed to generate sales forecast."
      );

      setForecast([]);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // INITIAL FORECAST
  // =====================================================

  useEffect(() => {

    fetchForecast();

  }, []);


  // =====================================================
  // FORMAT CHART DATA
  // =====================================================

  const chartData = forecast.map(
    (item) => ({
      date: item.date,
      forecast: item.predicted_sales
    })
  );


  return (
    <div className="vendor-layout">

      {/* ================================================
          SIDEBAR
      ================================================= */}

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

          <button
            className="active"
            onClick={onForecast}
          >
            📈 Sales Forecast
          </button>

        </nav>

        <button
          className="vendor-logout"
          onClick={onLogout}
        >
          Logout
        </button>

      </aside>


      {/* ================================================
          MAIN CONTENT
      ================================================= */}

      <main className="vendor-main">

        <div className="forecast-header">

          <div>

            <h1 className="vendor-page-title">
              Sales Forecast
            </h1>

            <p className="vendor-page-subtitle">
              Predict future sales using ARIMA
              time-series forecasting.
            </p>

          </div>


          {/* FORECAST CONTROL */}

          <div className="forecast-control">

            <label>
              Forecast Horizon
            </label>

            <select
              value={forecastDays}
              onChange={(e) =>
                setForecastDays(
                  Number(e.target.value)
                )
              }
            >
              <option value={7}>
                7 Days
              </option>

              <option value={14}>
                14 Days
              </option>

              <option value={30}>
                30 Days
              </option>

            </select>

            <button
              className="forecast-button"
              onClick={fetchForecast}
              disabled={loading}
            >
              {loading
                ? "Generating..."
                : "Generate Forecast"}
            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="forecast-error">
            {error}
          </div>

        )}


        {/* ================================================
            MODEL SUMMARY
        ================================================= */}

        <div className="forecast-stats">

          <div className="forecast-stat-card">

            <h3>
              Model
            </h3>

            <p>
              {model || "—"}
            </p>

          </div>


          <div className="forecast-stat-card">

            <h3>
              MAE
            </h3>

            <p>
              {mae !== null
                ? `₹${Number(mae).toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2
                    }
                  )}`
                : "—"}
            </p>

          </div>


          <div className="forecast-stat-card">

            <h3>
              RMSE
            </h3>

            <p>
              {rmse !== null
                ? `₹${Number(rmse).toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2
                    }
                  )}`
                : "—"}
            </p>

          </div>


          <div className="forecast-stat-card">

            <h3>
              Historical Days
            </h3>

            <p>
              {historicalDays ?? "—"}
            </p>

          </div>

        </div>


        {/* ================================================
            MODEL PARAMETERS
        ================================================= */}

        {parameters && (

          <div className="forecast-model-info">

            <span>
              ARIMA Parameters
            </span>

            <strong>
              ({parameters.p},
              {parameters.d},
              {parameters.q})
            </strong>

          </div>

        )}


        {/* ================================================
            FORECAST CHART
        ================================================= */}

        <section className="forecast-section">

          <div className="forecast-section-header">

            <div>

              <h2>
                Predicted Sales
              </h2>

              <p>
                Estimated daily sales for
                the selected forecast period.
              </p>

            </div>

          </div>


          {loading ? (

            <div className="forecast-loading">
              Generating sales forecast...
            </div>

          ) : forecast.length === 0 ? (

            <div className="forecast-empty">
              No forecast data available.
            </div>

          ) : (

            <div className="forecast-chart">

              <ResponsiveContainer
                width="100%"
                height={420}
              >

                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2
                        }
                      )}`
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Predicted Sales"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          )}

        </section>


        {/* ================================================
            FORECAST TABLE
        ================================================= */}

        {forecast.length > 0 && (

          <section className="forecast-section">

            <h2>
              Forecast Details
            </h2>

            <div className="forecast-table-container">

              <table className="forecast-table">

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Predicted Sales
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {forecast.map(
                    (item, index) => (

                      <tr key={index}>

                        <td>
                          {item.date}
                        </td>

                        <td>
                          ₹
                          {Number(
                            item.predicted_sales
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}


export default SalesForecast;