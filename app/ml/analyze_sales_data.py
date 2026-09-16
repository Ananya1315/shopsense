import pandas as pd

from app.database import SessionLocal
from app.models.transaction import Transaction


def analyze_sales_data():
    db = SessionLocal()

    try:
        # Get all transactions
        transactions = db.query(Transaction).order_by(
            Transaction.purchase_date
        ).all()

        if not transactions:
            print("No transactions found.")
            return

        # Convert database records into a DataFrame
        data = [
            {
                "date": transaction.purchase_date,
                "total_amount": transaction.total_amount
            }
            for transaction in transactions
        ]

        df = pd.DataFrame(data)

        # Convert timestamp to date
        df["date"] = pd.to_datetime(df["date"]).dt.date

        # Aggregate multiple transactions occurring on the same day
        daily_sales = (
            df.groupby("date")["total_amount"]
            .sum()
            .reset_index()
        )

        daily_sales["date"] = pd.to_datetime(daily_sales["date"])

        # Create continuous daily date range
        full_date_range = pd.date_range(
            start=daily_sales["date"].min(),
            end=daily_sales["date"].max(),
            freq="D"
        )

        daily_sales = (
            daily_sales
            .set_index("date")
            .reindex(full_date_range, fill_value=0)
            .rename_axis("date")
            .reset_index()
        )

        daily_sales.rename(
            columns={"total_amount": "daily_sales"},
            inplace=True
        )

        # Basic statistics
        total_transactions = len(transactions)
        total_days = len(daily_sales)
        days_with_sales = (daily_sales["daily_sales"] > 0).sum()
        days_without_sales = (daily_sales["daily_sales"] == 0).sum()

        print("\n========== SALES DATA ANALYSIS ==========\n")

        print(f"Total transactions : {total_transactions}")
        print(f"Date range         : {daily_sales['date'].min().date()} "
              f"to {daily_sales['date'].max().date()}")
        print(f"Total calendar days: {total_days}")
        print(f"Days with sales    : {days_with_sales}")
        print(f"Days without sales : {days_without_sales}")

        print("\n========== DAILY SALES ==========\n")

        print(
            daily_sales.to_string(
                index=False,
                formatters={
                    "daily_sales": lambda x: f"₹{x:,.2f}"
                }
            )
        )

        print("\n==========================================\n")

        return daily_sales

    finally:
        db.close()


if __name__ == "__main__":
    analyze_sales_data()