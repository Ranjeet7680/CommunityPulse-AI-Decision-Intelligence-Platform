from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import NotificationCreate, AlertCreate
from app.core.dependencies import get_current_user, get_db_client
from datetime import datetime
import uuid

router = APIRouter(prefix="/notifications", tags=["Notification Service"])

@router.post("/send")
async def send_notification(data: NotificationCreate, db = Depends(get_db_client)):
    notifications = db.setdefault("notifications", [])
    
    notification_id = f"notif_{uuid.uuid4().hex[:12]}"
    notification_entry = {
        "id": notification_id,
        "recipient_id": data.recipient_id,
        "title": data.title,
        "body": data.body,
        "priority": data.priority,
        "status": "sent",
        "created_at": datetime.utcnow()
    }
    
    notifications.append(notification_entry)
    
    # Simulate sending email/sms notifications
    return {
        "status": "success",
        "notification_id": notification_id,
        "channels_used": ["in_app_toast", "email_smtp_relay"]
    }

@router.post("/alerts", status_code=status.HTTP_201_CREATED)
async def create_alert_rule(data: AlertCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    alert_rules = db.setdefault("alert_rules", [])
    
    rule_id = f"rule_{uuid.uuid4().hex[:12]}"
    rule = {
        "id": rule_id,
        "org_id": current_user["org_id"],
        "metric": data.metric,
        "threshold": data.threshold,
        "comparison_operator": data.comparison_operator,
        "channels": data.channels,
        "created_by": current_user["user_id"],
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    alert_rules.append(rule)
    
    return {
        "message": f"Alert rule successfully created for metric: {data.metric}",
        "rule_id": rule_id
    }

@router.get("/alerts")
async def list_alert_rules(current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    alert_rules = db.setdefault("alert_rules", [])
    user_rules = [r for r in alert_rules if r["org_id"] == current_user["org_id"]]
    return user_rules

@router.delete("/alerts/{rule_id}")
async def delete_alert_rule(rule_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    alert_rules = db.setdefault("alert_rules", [])
    
    target_idx = -1
    for idx, r in enumerate(alert_rules):
        if r["id"] == rule_id and r["org_id"] == current_user["org_id"]:
            target_idx = idx
            break
            
    if target_idx == -1:
        raise HTTPException(status_code=404, detail="Alert rule not found")
        
    del alert_rules[target_idx]
    return {"message": "Alert rule successfully deleted"}
