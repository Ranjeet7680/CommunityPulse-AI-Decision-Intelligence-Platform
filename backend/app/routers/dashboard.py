from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from app.models.schemas import AllKPIs
from app.core.dependencies import get_current_user
from datetime import datetime
import asyncio
import json
import random

router = APIRouter(prefix="/dashboard", tags=["Dashboard APIs"])

@router.get("/kpis", response_model=AllKPIs)
async def get_kpis(current_user: dict = Depends(get_current_user)):
    return AllKPIs(
        health_score=87.0,
        traffic_index=6.2,
        air_quality=42.0,
        satisfaction=78.0,
        water_usage=55.0,
        energy_usage=61.0,
        waste_collection=89.0,
        emergency_status="Normal"
    )

@router.get("/recommendations")
async def get_dashboard_recommendations():
    return [
        {"id": 1, "text": "Optimize waste collection Route 7 — 23% potential fuel savings"},
        {"id": 2, "text": "Air quality alert in District 3 — pre-emptively deploy local filters"},
        {"id": 3, "text": "Traffic congestion spike predicted tomorrow morning 8-10 AM"}
    ]

# WebSocket live data streaming endpoint
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Initial parameters
        health = 87.0
        traffic = 6.2
        aqi = 42.0
        
        while True:
            # Simulate real-time metric drift
            health += random.uniform(-0.5, 0.5)
            traffic += random.uniform(-0.2, 0.2)
            aqi += random.uniform(-1, 1)
            
            data = {
                "health_score": round(max(0, min(100, health)), 1),
                "traffic_index": round(max(0, min(10, traffic)), 1),
                "air_quality": round(max(0, min(500, aqi)), 1),
                "satisfaction": round(random.uniform(75, 80), 1),
                "water_usage": round(random.uniform(50, 60), 1),
                "energy_usage": round(random.uniform(58, 64), 1),
                "waste_collection": round(random.uniform(85, 92), 1),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await websocket.send_text(json.dumps(data))
            # Send stream update every 3 seconds
            await asyncio.sleep(3.0)
    except WebSocketDisconnect:
        # Connection closed cleanly by client
        pass
    except Exception:
        await websocket.close()
