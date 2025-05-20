from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import api_router
from app.core.config import settings
from app.core.database import engine, Base
from app.core.init_db import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Create database tables on startup
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Initialize test data
        logger.info("Initializing test data...")
        init_db()
    except Exception as e:
        logger.error(f"Error during startup: {e}")
    yield

app = FastAPI(
    title="PDF API",
    description="API for PDF processing",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    # Add these lines:
    swagger_ui_oauth2_redirect_url=None,
    swagger_ui_init_oauth=None,
)

# Set up CORS
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to PDF Processing API. Visit /swagger-ui.html for documentation."}
