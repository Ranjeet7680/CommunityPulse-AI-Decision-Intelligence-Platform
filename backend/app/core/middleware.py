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
        # Skip rate limiting on health checks, docs, and metrics
        exempt_paths = ["/docs", "/redoc", "/openapi.json", "/health", "/metrics"]
        if request.url.path in exempt_paths:
            return await call_next(request)
            
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{client_ip}"
        
        try:
            client = get_redis_client()
            current = client.get(key)
            
            if current:
                current_count = int(current)
                if current_count >= settings.RATE_LIMIT_REQUESTS:
                    logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                    return Response(
                        content='{"detail": "Rate limit exceeded. Try again in a minute."}',
                        status_code=429,
                        media_type="application/json",
                        headers={"Retry-After": str(settings.RATE_LIMIT_WINDOW)}
                    )
                
                # Increment counter
                if hasattr(client, 'db'):  # Mock client
                    client.set(key, current_count + 1, ex=settings.RATE_LIMIT_WINDOW)
                else:  # Real Redis client
                    client.incr(key)
            else:
                # First request from this IP in the window
                client.set(key, 1, ex=settings.RATE_LIMIT_WINDOW)
                
        except Exception as e:
            # Fallback gracefully if Redis is unavailable
            logger.warning(f"Rate limiting unavailable (Redis error): {e}")
            # Continue processing request even if rate limiting fails
            
        return await call_next(request)
