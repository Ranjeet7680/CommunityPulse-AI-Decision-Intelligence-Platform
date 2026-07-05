from datetime import datetime, timedelta
from typing import Union, Any, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
import hashlib
import time
from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], role: str = "member", expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate JWT access token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None

def verify_token(token: str) -> Optional[dict]:
    """Legacy token verification - use decode_access_token instead"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def verify_firebase_token(id_token: str) -> Optional[dict]:
    """
    Verify Firebase ID token
    WARNING: This is a development/demo implementation
    In production, use firebase_admin.auth.verify_id_token(id_token)
    """
    # For production, uncomment and configure firebase-admin:
    # try:
    #     from firebase_admin import auth
    #     decoded_token = auth.verify_id_token(id_token)
    #     return {
    #         "uid": decoded_token["uid"],
    #         "email": decoded_token.get("email"),
    #         "name": decoded_token.get("name"),
    #         "email_verified": decoded_token.get("email_verified", False)
    #     }
    # except Exception as e:
    #     return None
    
    # Development fallback - creates deterministic user from token
    if not id_token or len(id_token) < 10:
        return None
        
    return {
        "uid": f"user_{hashlib.md5(id_token.encode()).hexdigest()[:10]}",
        "email": "dev@communitypulse.ai",
        "name": "Development User",
        "email_verified": True
    }

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_referral_code(user_id: str) -> str:
    # Creates a unique referral code, e.g. PULSE_4A32B
    hash_object = hashlib.md5(user_id.encode())
    hex_dig = hash_object.hexdigest().upper()
    return f"PULSE_{hex_dig[:5]}"
