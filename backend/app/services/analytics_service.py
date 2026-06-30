import random
from datetime import datetime, timedelta

class AnalyticsService:
    def __init__(self, bq_client):
        self.bq = bq_client

    async def get_live_kpis(self) -> dict:
        return {
            "health_score": 87.0,
            "traffic_index": 6.2,
            "air_quality": 42.0,
            "citizen_satisfaction": 78.0
        }

    async def detect_anomalies(self, metric: str) -> list:
        # Standard anomaly generation logic
        anomalies = []
        for _ in range(random.randint(1, 2)):
            anomalies.append({
                "timestamp": (datetime.utcnow() - timedelta(days=random.randint(1, 10))).isoformat(),
                "value": round(random.uniform(85, 95) if metric == "traffic" else random.uniform(15, 25), 2),
                "expected_value": 75.0 if metric == "traffic" else 55.0,
                "deviation": 22.4,
                "severity": "high"
            })
        return anomalies
