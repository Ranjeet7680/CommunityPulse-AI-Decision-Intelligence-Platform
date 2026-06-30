from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import OrgResponse, OrgCreate, OrgUpdate, InviteUserRequest
from app.core.dependencies import get_db_client, get_current_user, require_role
from datetime import datetime
import uuid

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.post("/", response_model=OrgResponse)
async def create_organization(data: OrgCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    orgs = db.setdefault("organizations", {})
    users = db.setdefault("users", {})
    
    org_id = f"org_{uuid.uuid4().hex[:10]}"
    org = {
        "org_id": org_id,
        "name": data.name,
        "industry": data.industry,
        "country": data.country,
        "owner_id": current_user["user_id"],
        "created_at": datetime.utcnow()
    }
    orgs[org_id] = org
    
    # Update current user to belong to this new org
    user = users.get(current_user["user_id"])
    if user:
        user["org_id"] = org_id
        user["role"] = "admin"
        users[current_user["user_id"]] = user
        
    return OrgResponse(
        org_id=org["org_id"],
        name=org["name"],
        industry=org["industry"],
        country=org["country"],
        owner_id=org["owner_id"],
        created_at=org["created_at"]
    )

@router.get("/my", response_model=OrgResponse)
async def get_my_organization(current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    orgs = db.setdefault("organizations", {})
    org = orgs.get(current_user["org_id"])
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    return OrgResponse(
        org_id=org["org_id"],
        name=org["name"],
        industry=org["industry"],
        country=org["country"],
        owner_id=org["owner_id"],
        created_at=org["created_at"] if isinstance(org["created_at"], datetime) else datetime.utcnow()
    )

@router.put("/my", response_model=OrgResponse)
async def update_my_organization(
    data: OrgUpdate, 
    current_user: dict = Depends(require_role(["admin", "superadmin"])), 
    db = Depends(get_db_client)
):
    orgs = db.setdefault("organizations", {})
    org = orgs.get(current_user["org_id"])
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    if data.name is not None:
        org["name"] = data.name
    if data.industry is not None:
        org["industry"] = data.industry
        
    orgs[current_user["org_id"]] = org
    
    return OrgResponse(
        org_id=org["org_id"],
        name=org["name"],
        industry=org["industry"],
        country=org["country"],
        owner_id=org["owner_id"],
        created_at=org["created_at"] if isinstance(org["created_at"], datetime) else datetime.utcnow()
    )

@router.post("/invite")
async def invite_user(
    data: InviteUserRequest, 
    current_user: dict = Depends(require_role(["admin", "superadmin"])),
    db = Depends(get_db_client)
):
    users = db.setdefault("users", {})
    invites = db.setdefault("invitations", {})
    
    # Check if user already exists
    for uid, u in users.items():
        if u["email"] == data.email:
            raise HTTPException(status_code=400, detail="User already exists in system")
            
    invite_id = f"invite_{uuid.uuid4().hex[:12]}"
    invites[invite_id] = {
        "invite_id": invite_id,
        "email": data.email,
        "org_id": current_user["org_id"],
        "role": data.role,
        "invited_by": current_user["user_id"],
        "created_at": datetime.utcnow(),
        "status": "pending"
    }
    
    # Email invite simulation response
    return {
        "message": f"Invitation successfully sent to {data.email}",
        "invite_token": invite_id
    }
