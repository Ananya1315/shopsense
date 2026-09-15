import os
import sys

# =========================================================
# MAKE PROJECT ROOT AVAILABLE TO PYTHON
# =========================================================

PROJECT_ROOT = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


# =========================================================
# TEST ENVIRONMENT
# =========================================================

# IMPORTANT:
# These must be set BEFORE importing app modules.

os.environ["DATABASE_URL"] = (
    "sqlite:///./test.db?check_same_thread=false"
)

os.environ["SECRET_KEY"] = "test-secret-key"

os.environ["ALGORITHM"] = "HS256"

os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"


# =========================================================
# IMPORT APPLICATION
# =========================================================

import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app


# =========================================================
# TEST DATABASE
# =========================================================

TEST_DATABASE_URL = (
    "sqlite:///./test.db"
)

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# =========================================================
# CREATE TEST DATABASE
# =========================================================

@pytest.fixture(
    scope="session",
    autouse=True
)
def setup_test_database():

    Base.metadata.create_all(
        bind=engine
    )

    yield

    Base.metadata.drop_all(
        bind=engine
    )


# =========================================================
# RESET DATABASE BEFORE EACH TEST
# =========================================================

@pytest.fixture(
    autouse=True
)
def reset_database():

    Base.metadata.drop_all(
        bind=engine
    )

    Base.metadata.create_all(
        bind=engine
    )

    yield


# =========================================================
# DATABASE SESSION
# =========================================================

@pytest.fixture
def db():

    session = TestingSessionLocal()

    try:
        yield session

    finally:
        session.close()


# =========================================================
# FASTAPI TEST CLIENT
# =========================================================

@pytest.fixture
def client():

    def override_get_db():

        db = TestingSessionLocal()

        try:
            yield db

        finally:
            db.close()


    app.dependency_overrides[
        get_db
    ] = override_get_db


    with TestClient(app) as test_client:

        yield test_client


    app.dependency_overrides.clear()