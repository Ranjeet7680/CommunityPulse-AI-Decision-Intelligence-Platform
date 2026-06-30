from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import SystemHealth, GPUStats
from app.core.dependencies import get_current_user, require_role, get_db_client
import random

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

@router.get("/system-health", response_model=SystemHealth)
async def get_system_health(current_user: dict = Depends(require_role(["admin", "superadmin"]))):
    # Simulated cluster server resources
    return SystemHealth(
        cpu_utilization=round(random.uniform(20.0, 60.0), 1),
        memory_utilization=round(random.uniform(40.0, 75.0), 1),
        disk_utilization=52.4,
        gpu_available=True
    )

@router.get("/gpu-stats", response_model=GPUStats)
async def get_gpu_stats(current_user: dict = Depends(require_role(["admin", "superadmin"]))):
    # Simulated NVIDIA H100 GPU telemetry
    return GPUStats(
        gpu_utilization=round(random.uniform(10.0, 95.0), 1),
        memory_used_gb=8.2,
        memory_total_gb=80.0,
        temperature_celsius=round(random.uniform(50.0, 72.0), 1)
    )

@router.get("/bq-jobs")
async def get_bq_jobs(current_user: dict = Depends(require_role(["admin", "superadmin"]))):
    # Simulated Google BigQuery queries query run history
    return [
        {
            "job_id": "bq_job_7f8k2m9p",
            "query_snippet": "SELECT district_id, AVG(traffic_speed) FROM `community_analytics.traffic` GROUP BY 1",
            "status": "DONE",
            "bytes_processed_mb": 42.8,
            "duration_ms": 142
        },
        {
            "job_id": "bq_job_0a2n9l8z",
            "query_snippet": "SELECT date, value FROM `community_analytics.trends` WHERE metric='aqi'",
            "status": "DONE",
            "bytes_processed_mb": 12.4,
            "duration_ms": 98
        }
    ]

@router.get("/billing")
async def get_billing_data(current_user: dict = Depends(require_role(["admin", "superadmin"]))):
    # Billing metrics
    return {
        "monthly_flat_fee": 299.00,
        "additional_gpu_hours": 42.5,
        "additional_gpu_cost": round(42.5 * 2.21, 2), # $2.21 / hour standard Cloud Run GPU rate
        "bigquery_query_credits": 25.0,
        "total_outstanding_amount": round(299.00 + (42.5 * 2.21), 2)
    }

@router.get("/audit-logs")
async def get_audit_logs(
    skip: int = 0, 
    limit: int = 20, 
    current_user: dict = Depends(require_role(["admin", "superadmin"])), 
    db = Depends(get_db_client)
):
    # Simulated audit history
    logs = [
        {"timestamp": "2026-06-30T10:14:00Z", "user": "Ranjeet Kumar", "action": "CREATE_ALERT_RULE", "ip": "127.0.0.1"},
        {"timestamp": "2026-06-30T09:42:00Z", "user": "Ranjeet Kumar", "action": "UPLOAD_DATASET", "ip": "127.0.0.1"},
        {"timestamp": "2026-06-30T09:30:00Z", "user": "Ranjeet Kumar", "action": "USER_LOGIN", "ip": "127.0.0.1"}
    ]
    return logs[skip:skip + limit]
