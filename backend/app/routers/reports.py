from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import ReportRequest, ReportResponse
from app.core.dependencies import get_current_user, get_db_client
from datetime import datetime
import uuid

router = APIRouter(prefix="/reports", tags=["Report Generation"])

@router.post("/generate", response_model=ReportResponse)
async def generate_report(data: ReportRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    reports = db.setdefault("reports", {})
    report_id = f"rep_{uuid.uuid4().hex[:10]}"
    
    # Simulate generating report file and storing it in Google Cloud Storage
    filename = f"report_{data.report_type}_{datetime.utcnow().strftime('%Y%m%d')}.{data.format}"
    gcs_url = f"https://storage.googleapis.com/communitypulse-datasets-bucket/reports/{current_user['org_id']}/{filename}"
    
    report_entry = {
        "report_id": report_id,
        "format": data.format,
        "report_type": data.report_type,
        "download_url": gcs_url,
        "org_id": current_user["org_id"],
        "created_at": datetime.utcnow()
    }
    
    reports[report_id] = report_entry
    
    return ReportResponse(
        report_id=report_id,
        download_url=gcs_url,
        created_at=report_entry["created_at"]
    )

@router.get("/", response_model=list[ReportResponse])
async def list_reports(current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    reports = db.setdefault("reports", {})
    user_reports = []
    
    for rid, r in reports.items():
        if r["org_id"] == current_user["org_id"]:
            user_reports.append(ReportResponse(
                report_id=r["report_id"],
                download_url=r["download_url"],
                created_at=r["created_at"] if isinstance(r["created_at"], datetime) else datetime.utcnow()
            ))
            
    return user_reports

@router.delete("/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    reports = db.setdefault("reports", {})
    r = reports.get(report_id)
    if not r or r["org_id"] != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="Report not found")
        
    del reports[report_id]
    return {"message": "Report record deleted"}
