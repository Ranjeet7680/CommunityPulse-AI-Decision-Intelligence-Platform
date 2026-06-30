import os
from typing import List, Union
from pydantic import AnyHttpUrl, BeforeValidator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated
import json

def parse_cors_origins(v: Union[str, List[str]]) -> List[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, (list, str)):
        try:
            return json.loads(v) if isinstance(v, str) else v
        except Exception:
            return []
    return v

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # App Settings
    APP_NAME: str = "CommunityPulse AI Backend"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Google Cloud Project Configuration
    GOOGLE_CLOUD_PROJECT: str = "communitypulse-ai-demo"
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GCS_BUCKET_NAME: str = "communitypulse-datasets-bucket"
    BIGQUERY_DATASET: str = "community_analytics"
    BIGQUERY_LOCATION: str = "US"
    FIRESTORE_DATABASE: str = "(default)"
    PUBSUB_TOPIC_NOTIFICATIONS: str = "cp-notifications"
    PUBSUB_TOPIC_ANALYTICS: str = "cp-analytics"
    SECRET_MANAGER_PROJECT: str = ""

    # Firebase Config
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_PRIVATE_KEY_ID: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""

    # Gemini AI & Vertex AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_MAX_TOKENS: int = 8192
    VERTEX_AI_LOCATION: str = "us-central1"
    VERTEX_AI_MODEL: str = "gemini-2.0-flash-001"

    # Cache & Message Broker (Redis)
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Security & CORS
    CORS_ORIGINS: Annotated[
        List[str],
        BeforeValidator(parse_cors_origins)
    ] = ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:8080"]
    
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60

    # Notifications (SMTP & Twilio)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # GPU Acceleration Config
    GPU_ENABLED: bool = False
    GPU_MEMORY_LIMIT_GB: int = 16

    # Logging & Monitoring
    LOG_LEVEL: str = "INFO"
    ENABLE_CLOUD_LOGGING: bool = False
    EXPOSE_METRICS: bool = True
    METRICS_PORT: int = 9090

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

# Global Config Singleton
settings = Settings()

def get_settings() -> Settings:
    return settings
