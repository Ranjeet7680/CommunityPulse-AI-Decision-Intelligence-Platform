from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import UserResponse, UserListResponse, UserUpdate
from app.core.dependencies import get_db_client, get_current_user, require_role
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=UserListResponse)
async def list_users(
    skip: int = 0, 
    limit: int = 50, 
    current_user: dict = Depends(require_role(["admin", "superadmin"])), 
    db = Depends(get_db_client)
):
    users = db.setdefault("users", {})
    org_id = current_user["org_id"]
    
    org_users = []
    for uid, u in users.items():
        if u.get("org_id") == org_id:
            org_users.append(UserResponse(
                user_id=u["user_id"],
                email=u["email"],
                name=u["name"],
                org_id=u["org_id"],
                role=u["role"],
                created_at=u["created_at"] if isinstance(u["created_at"], datetime) else datetime.utcnow(),
                is_active=u.get("is_active", True)
            ))
            
    paginated_users = org_users[skip:skip + limit]
    return UserListResponse(users=paginated_users, total=len(org_users))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str, 
    current_user: dict = Depends(get_current_user), 
    db = Depends(get_db_client)
):
    users = db.setdefault("users", {})
    user = users.get(user_id)
    if not user or user.get("org_id") != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        org_id=user["org_id"],
        role=user["role"],
        created_at=user["created_at"] if isinstance(user["created_at"], datetime) else datetime.utcnow(),
        is_active=user.get("is_active", True)
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str, 
    data: UserUpdate,
    current_user: dict = Depends(require_role(["admin", "superadmin"])), 
    db = Depends(get_db_client)
):
    users = db.setdefault("users", {})
    user = users.get(user_id)
    if not user or user.get("org_id") != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.name is not None:
        user["name"] = data.name
    if data.role is not None:
        user["role"] = data.role
        
    users[user_id] = user
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        org_id=user["org_id"],
        role=user["role"],
        created_at=user["created_at"] if isinstance(user["created_at"], datetime) else datetime.utcnow(),
        is_active=user.get("is_active", True)
    )

@router.delete("/{user_id}")
async def delete_user(
    user_id: str, 
    current_user: dict = Depends(require_role(["admin", "superadmin"])), 
    db = Depends(get_db_client)
):
    users = db.setdefault("users", {})
    user = users.get(user_id)
    if not user or user.get("org_id") != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="User not found")
        
    user["is_active"] = False
    users[user_id] = user
    return {"message": "User successfully deactivated"}
