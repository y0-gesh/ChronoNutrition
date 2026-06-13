import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.logging import setup_logging, logger
from core.exceptions import DomainException, EntityNotFoundError, ValidationError
from fastapi.responses import JSONResponse
from api import router as api_router

# Load environment variables
load_dotenv()

# Initialize structured logging
setup_logging()

app = FastAPI(
    title="ChronoNutrition API",
    version="1.0.0",
    description="Production-ready nutrition and circadian rhythms scheduling platform."
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Medical Disclaimer safety header middleware
@app.middleware("http")
async def add_medical_disclaimer_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Medical-Disclaimer"] = (
        "ChronoNutrition provides informational dietary insights and is not a medical diagnostic service. "
        "Please consult a qualified physician for specific health or medical treatments."
    )
    return response

# Standard Domain Exception handlers to return uniform API response wrapper
@app.exception_handler(EntityNotFoundError)
def entity_not_found_handler(request: Request, exc: EntityNotFoundError):
    logger.warning(f"Resource not found error: {exc.message}")
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "data": None,
            "message": exc.message
        }
    )

@app.exception_handler(ValidationError)
def validation_error_handler(request: Request, exc: ValidationError):
    logger.warning(f"Business validation error: {exc.message}")
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "data": None,
            "message": exc.message
        }
    )

@app.exception_handler(Exception)
def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "message": "An unexpected internal server error occurred."
        }
    )

# Mount API Routers
app.include_router(api_router, prefix="/api")

# --- Observability Endpoints ---
@app.get("/health", tags=["Observability"])
def health_check():
    """Simple status check to confirm server is running."""
    return {"status": "healthy", "timestamp": os.getpid()}

@app.get("/ready", tags=["Observability"])
def readiness_check():
    """Check db availability and ready state."""
    # Attempt a simple query check on database
    from database import SessionLocal
    from sqlalchemy.sql import text
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        logger.critical(f"Readiness check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "reason": "Database connection error"}
        )
    finally:
        db.close()
