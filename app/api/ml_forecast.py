from fastapi import APIRouter, Depends, HTTPException

from app.models.vendor import Vendor
from app.utils.security import get_current_vendor
from app.ml.arima_forecast import run_forecast


router = APIRouter()


# =====================================================
# VENDOR SALES FORECAST
# =====================================================

@router.get("/ml/forecast-sales")
def forecast_vendor_sales(
    days: int = 7,
    current_vendor: Vendor = Depends(get_current_vendor)
):

    # Validate forecast horizon
    if days < 1 or days > 30:
        raise HTTPException(
            status_code=400,
            detail="Forecast days must be between 1 and 30."
        )

    result = run_forecast(
        vendor_id=current_vendor.vendor_id,
        forecast_days=days
    )

    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )

    return result