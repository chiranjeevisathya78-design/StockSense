import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import db_manager
from app.routes import stocks, ml, watchlist
from app.models.schemas import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("stocksense.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("StockSense AI Backend initializing...")
    # Attempt DB connection
    db_manager.connect()
    yield
    logger.info("StockSense AI Backend shutting down...")

app = FastAPI(
    title="StockSense AI API",
    description="Intelligent AI-Based Stock Market Analysis and Prediction System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/api/health", response_model=HealthResponse, tags=["system"])
def health_check():
    return HealthResponse(
        status="healthy",
        app_name="StockSense AI",
        database_connected=db_manager.is_connected,
        version="1.0.0"
    )

# Include Routers
app.include_router(stocks.router)
app.include_router(ml.router)
app.include_router(watchlist.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
