import os
from contextlib import contextmanager

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/DBMS")

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency – yields a SQLAlchemy session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """Context-manager version for use inside service functions that need
    explicit transaction control (BEGIN / COMMIT / ROLLBACK)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def query(db, sql: str, params: dict | None = None):
    """Helper that mirrors the JS `query(sql, params)` pattern.
    Accepts a SQLAlchemy session and returns a list of RowMapping objects."""
    result = db.execute(text(sql), params or {})
    try:
        return result.mappings().all()
    except Exception:
        return []
