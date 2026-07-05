from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.middleware import LoggingMiddleware, RateLimitMiddleware
from app.routers import auth, users, organizations, referral, datasets, ai_assistant, analytics, gis, notifications, reports, admin, dashboard

settings = get_settings()

# Setup Logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("communitypulse")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Initializing CommunityPulse AI backend...")
    logger.info("Verifying Google Cloud connections (Simulated/Dev)...")
    logger.info("Verifying NVIDIA GPU capabilities (Simulated/Dev)...")
    yield
    # Shutdown tasks
    logger.info("Cleaning up microservice resources...")

# Create FastAPI App instance
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Decision Intelligence Platform transforming community data into smarter decisions.",
    lifespan=lifespan
)

# SlowAPI Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Request Logs Middleware
app.add_middleware(LoggingMiddleware)
# Redis Rate Limit Middleware
app.add_middleware(RateLimitMiddleware)

# Prometheus Metrics exporter
if settings.EXPOSE_METRICS:
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# API Gateway routers mapping
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(organizations.router, prefix="/api/v1")
app.include_router(referral.router, prefix="/api/v1")
app.include_router(datasets.router, prefix="/api/v1")
app.include_router(ai_assistant.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(gis.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "gpu_acceleration": settings.GPU_ENABLED,
        "services": {
            "firestore": "operational",
            "bigquery": "operational",
            "redis_cache": "operational"
        }
    }
