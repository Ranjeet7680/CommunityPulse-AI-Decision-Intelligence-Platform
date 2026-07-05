from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Generator, Optional, List
from app.core.config import get_settings
from app.core.security import verify_token
import redis
from unittest.mock import MagicMock

# In a real environment, we'd import:
# from google.cloud import firestore, bigquery, storage
# To make this fully functional offline or without GCP credentials, we mock them gracefully.

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# Mock databases for offline/hackathon mode fallback
_MOCK_FIRESTORE = {}
_MOCK_REDIS = {}

class MockRedis:
    def __init__(self):
        self.db = {}
    def get(self, key):
        return self.db.get(key)
    def set(self, key, value, ex=None):
        self.db[key] = value
        return True
    def delete(self, key):
        if key in self.db:
            del self.db[key]
            return True
        return False
    def exists(self, key):
        return key in self.db

def get_redis_client():
    try:
        # In case redis is running locally
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        client.ping()
        return client
    except Exception:
        # Fallback to local mock client
        class FallbackRedis(MockRedis):
            pass
        return FallbackRedis()

def get_db_client():
    # Returns a mock Firestore database mapping or real client
    # For hackathon/dev execution, a local dict database holds simulated state
    global _MOCK_FIRESTORE
    return _MOCK_FIRESTORE

def get_bq_client():
    # Returns a mock BigQuery client for local testing or a real GCP client
    mock_client = MagicMock()
    # Mock some queries
    mock_client.query.return_value.result.return_value = []
    return mock_client

def get_gcs_client():
    # Returns a mock Google Cloud Storage client
    return MagicMock()

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    from fastapi import HTTPException, status
    from app.core.security import decode_access_token
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Decode and validate JWT token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    role = payload.get("role", "member")
    
    # Check in mock DB
    db = get_db_client()
    users = db.setdefault("users", {})
    user = users.get(user_id)
    
    if not user:
        # User not found in database
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
        
    return user

def require_role(allowed_roles: List[str]):
    def role_dependency(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return role_dependency
