import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA

from app.database import SessionLocal
from app.models.transaction import Transaction
from app.models.product import Product


# ============================================================
# STEP 1: GET DAILY SALES FOR A VENDOR
# ============================================================

def get_daily_sales(vendor_id: int):
    db = SessionLocal()

    try:
        transactions = (
            db.query(Transaction)
            .join(
                Product,
                Transaction.product_id == Product.product_id
            )
            .filter(
                Product.vendor_id == vendor_id
            )
            .order_by(Transaction.purchase_date)
            .all()
        )

        if not transactions:
            return pd.Series(dtype=float)

        data = [
            {
                "date": transaction.purchase_date,
                "total_amount": transaction.total_amount
            }
            for transaction in transactions
        ]

        df = pd.DataFrame(data)

        # Convert timestamp to date
        df["date"] = pd.to_datetime(
            df["date"]
        ).dt.date

        # Combine multiple transactions on the same day
        daily_sales = (
            df.groupby("date")["total_amount"]
            .sum()
        )

        # Convert index to datetime
        daily_sales.index = pd.to_datetime(
            daily_sales.index
        )

        # Create continuous daily date range
        full_date_range = pd.date_range(
            start=daily_sales.index.min(),
            end=daily_sales.index.max(),
            freq="D"
        )

        # Fill days without sales with zero
        daily_sales = daily_sales.reindex(
            full_date_range,
            fill_value=0
        )

        daily_sales.index.name = "date"

        return daily_sales

    finally:
        db.close()


# ============================================================
# STEP 2: CALCULATE MAE
# ============================================================

def calculate_mae(actual, predicted):

    return np.mean(
        np.abs(
            np.array(actual) -
            np.array(predicted)
        )
    )


# ============================================================
# STEP 3: CALCULATE RMSE
# ============================================================

def calculate_rmse(actual, predicted):

    return np.sqrt(
        np.mean(
            (
                np.array(actual) -
                np.array(predicted)
            ) ** 2
        )
    )


# ============================================================
# STEP 4: EVALUATE ARIMA CONFIGURATIONS
# ============================================================

def evaluate_models(sales):

    # Need enough data for train/test evaluation
    if len(sales) < 15:
        return None

    # 80% training / 20% testing
    train_size = int(
        len(sales) * 0.8
    )

    train = sales.iloc[:train_size]
    test = sales.iloc[train_size:]

    configurations = [
        (1, 1, 1),
        (1, 1, 2),
        (2, 1, 1),
        (2, 1, 2)
    ]

    results = []

    for p, d, q in configurations:

        try:

            model = ARIMA(
                train,
                order=(p, d, q)
            )

            model_fit = model.fit()

            predictions = model_fit.forecast(
                steps=len(test)
            )

            # Sales cannot be negative
            predictions = np.maximum(
                predictions,
                0
            )

            mae = calculate_mae(
                test.values,
                predictions
            )

            rmse = calculate_rmse(
                test.values,
                predictions
            )

            results.append({
                "model": f"ARIMA({p},{d},{q})",
                "p": p,
                "d": d,
                "q": q,
                "mae": float(mae),
                "rmse": float(rmse)
            })

        except Exception:
            continue

    if not results:
        return None

    results_df = pd.DataFrame(results)

    # Select configuration with lowest MAE
    best_model = (
        results_df
        .sort_values("mae")
        .iloc[0]
    )

    return {
        "best_model": str(best_model["model"]),
        "p": int(best_model["p"]),
        "d": int(best_model["d"]),
        "q": int(best_model["q"]),
        "mae": float(best_model["mae"]),
        "rmse": float(best_model["rmse"]),
        "training_points": len(train),
        "testing_points": len(test)
    }


# ============================================================
# STEP 5: GENERATE FORECAST
# ============================================================

def generate_forecast(
    sales,
    p,
    d,
    q,
    forecast_days
):

    model = ARIMA(
        sales,
        order=(p, d, q)
    )

    model_fit = model.fit()

    forecast = model_fit.forecast(
        steps=forecast_days
    )

    # Prevent negative predictions
    forecast = np.maximum(
        forecast,
        0
    )

    future_dates = pd.date_range(
        start=sales.index[-1]
        + pd.Timedelta(days=1),
        periods=forecast_days,
        freq="D"
    )

    forecast_data = []

    for date, prediction in zip(
        future_dates,
        forecast
    ):

        forecast_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted_sales": round(
                float(prediction),
                2
            )
        })

    return forecast_data


# ============================================================
# STEP 6: COMPLETE FORECAST PIPELINE
# ============================================================

def run_forecast(
    vendor_id: int,
    forecast_days: int = 7
):

    sales = get_daily_sales(
        vendor_id
    )

    if sales.empty:
        return {
            "success": False,
            "message": "No sales data available for this vendor."
        }

    # Need enough data
    if len(sales) < 15:
        return {
            "success": False,
            "message": (
                "Not enough historical data "
                "for ARIMA forecasting."
            ),
            "historical_days": len(sales)
        }

    evaluation = evaluate_models(
        sales
    )

    if evaluation is None:
        return {
            "success": False,
            "message": "Unable to train ARIMA models."
        }

    forecast = generate_forecast(
        sales=sales,
        p=evaluation["p"],
        d=evaluation["d"],
        q=evaluation["q"],
        forecast_days=forecast_days
    )

    return {
        "success": True,
        "vendor_id": vendor_id,
        "model": evaluation["best_model"],
        "parameters": {
            "p": evaluation["p"],
            "d": evaluation["d"],
            "q": evaluation["q"]
        },
        "historical_days": len(sales),
        "training_points": evaluation["training_points"],
        "testing_points": evaluation["testing_points"],
        "mae": round(
            evaluation["mae"],
            2
        ),
        "rmse": round(
            evaluation["rmse"],
            2
        ),
        "forecast_days": forecast_days,
        "forecast": forecast
    }


# ============================================================
# STANDALONE TEST
# ============================================================

if __name__ == "__main__":

    vendor_id = 1

    result = run_forecast(
        vendor_id=vendor_id,
        forecast_days=7
    )

    print("\n========== VENDOR ARIMA FORECAST ==========\n")

    print(result)

    print("\n===========================================\n")