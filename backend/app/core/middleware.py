from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging
from app.core.config import get_settings
from app.core.dependencies import get_redis_client

settings = get_settings()
logger = logging.getLogger("communitypulse")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        
        # Extract metadata
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        status_code = response.status_code
        
        logger.info(
            f"IP: {client_ip} | Method: {method} | Path: {path} | "
            f"Status: {status_code} | Duration: {process_time:.2f}ms"
        )
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Rate limit skip on docs
        if request.url.path in ["/docs", "/redoc", "/openapi.json", "/health"]:
            return await call_next(request)
            
        client = get_redis_client()
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{client_ip}"
        
        try:
            current = client.get(key)
            if current and int(current) >= settings.RATE_LIMIT_REQUESTS:
                return Response(
                    content='{"detail": "Rate limit exceeded. Try again in a minute."}',
                    status_code=429,
                    media_type="application/json"
                )
            
            # Increment request counter
            if not current:
                client.set(key, 1, ex=settings.RATE_LIMIT_WINDOW)
            else:
                # Basic mock/fallback support
                if hasattr(client, 'db'): # Mock client
                    client.set(key, int(current) + 1, ex=settings.RATE_LIMIT_WINDOW)
                else: # Real redis client
                    client.incr(key)
        except Exception as e:
            # Fallback gracefully if redis hits a glitch
            logger.warning(f"Rate limiting error: {e}")
            
        return await call_next(request)
