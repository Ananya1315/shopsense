from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import SQLAlchemyError

from app.utils.data_analyst import generate_sql
from app.database import get_db
from app.models.vendor import Vendor
from app.utils.security import get_current_vendor


router = APIRouter(
    prefix="/ai",
    tags=["AI Data Analyst"]
)


class AnalystRequest(BaseModel):

    question: str


@router.post("/analyze")
def analyze_question(
    request: AnalystRequest,
    db: Session = Depends(get_db),
    current_vendor: Vendor = Depends(get_current_vendor)
):

    try:

        # =========================================
        # STEP 1
        # Identify the logged-in vendor
        # =========================================

        vendor_id = current_vendor.vendor_id


        # =========================================
        # STEP 2
        # Convert natural language → vendor-specific SQL
        # =========================================

        sql = generate_sql(
            request.question,
            vendor_id
        )


        # =========================================
        # STEP 3
        # Execute the validated SQL
        # =========================================

        result = db.execute(
            text(sql)
        )

        rows = result.mappings().all()

        db.rollback()


        # =========================================
        # STEP 4
        # Convert database rows into dictionaries
        # =========================================

        data = jsonable_encoder(
            [dict(row) for row in rows]
        )


        # =========================================
        # STEP 5
        # Return response
        # =========================================

        return {
            "question": request.question,
            "sql": sql,
            "results": data
        }


    except ValueError as e:

        # SQL safety validation error
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


    except SQLAlchemyError as e:

        # Database / SQL execution error
        print("SQL ERROR:", e)

        raise HTTPException(
            status_code=400,
            detail="The generated SQL could not be executed."
        )


    except Exception as e:

        print("AI ANALYSIS ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="AI analysis failed."
        )