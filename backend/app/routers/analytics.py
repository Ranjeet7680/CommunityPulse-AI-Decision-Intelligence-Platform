from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import KPIResponse, TrendRequest, TrendResponse, AnomalyResponse
from app.core.dependencies import get_current_user, get_bq_client
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/analytics", tags=["Analytics Engine"])

@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(current_user: dict = Depends(get_current_user)):
    # Standard live dashboard metrics
    return KPIResponse(
        health_score=87.0,
        traffic_index=6.2,
        air_quality=42.0,
        citizen_satisfaction=78.0,
        timestamp=datetime.utcnow()
    )

@router.post("/trends", response_model=TrendResponse)
async def get_trends(data: TrendRequest):
    # Simulated trend series over time
    points = []
    current_date = data.start_date
    delta = timedelta(days=1)
    
    # Base values
    val = 80.0 if data.metric == "health" else 5.0
    
    while current_date <= data.end_date:
        # Add slight randomness
        val += random.uniform(-2, 2)
        val = max(0, min(100, val))
        
        points.append({
            "timestamp": current_date.isoformat(),
            "value": round(val, 2)
        })
        current_date += delta
        
    return TrendResponse(
        metric=data.metric,
        data_points=points
    )

@router.get("/anomalies", response_model=AnomalyResponse)
async def detect_anomalies(metric: str):
    # Mock anomaly detection
    anomalies = []
    
    # Generate 1 or 2 random anomalies
    for _ in range(random.randint(1, 2)):
        anomalies.append({
            "timestamp": (datetime.utcnow() - timedelta(days=random.randint(1, 10))).isoformat(),
            "value": round(random.uniform(90, 100) if metric == "traffic" else random.uniform(10, 20), 2),
            "expected_value": 75.0 if metric == "traffic" else 55.0,
            "deviation_percent": 24.5,
            "severity": "high"
        })
        
    return AnomalyResponse(
        metric=metric,
        anomalies_detected=len(anomalies),
        details=anomalies
    )

@router.post("/custom-sql")
async def execute_custom_sql(query: dict, bq = Depends(get_bq_client)):
    # Executing custom user-defined BigQuery query simulation
    sql = query.get("sql", "")
    if not sql:
        raise HTTPException(status_code=400, detail="SQL query string is required")
        
    return {
        "status": "success",
        "rows_returned": 3,
        "columns": ["district_id", "avg_traffic", "max_aqi"],
        "data": [
            [1, 5.4, 48],
            [2, 6.1, 35],
            [3, 8.2, 92]
        ]
    }
