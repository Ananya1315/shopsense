from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import SQLAlchemyError

from app.utils.data_analyst import generate_sql
from app.database import get_db


router = APIRouter(
    prefix="/ai",
    tags=["AI Data Analyst"]
)


class AnalystRequest(BaseModel):
    question: str


@router.post("/analyze")
def analyze_question(
    request: AnalystRequest,
    db: Session = Depends(get_db)
):

    try:

        # Step 1: Convert natural language → SQL
        sql = generate_sql(request.question)

        # Step 2: Execute the validated SQL
        result = db.execute(text(sql))
        rows = result.mappings().all()
        db.rollback()

        # Step 3: Convert database rows into dictionaries
       
        # Step 4: Make the result JSON serializable
        data = jsonable_encoder(
            [dict(row) for row in rows]
        )

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
        raise HTTPException(
            status_code=400,
            detail="The generated SQL could not be executed."
        )

    except Exception as e:

        # Unexpected error
        raise HTTPException(
            status_code=500,
            detail="AI analysis failed."
        )