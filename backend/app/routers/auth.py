from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshRequest,
    ForgotPasswordRequest, VerifyEmailRequest, UserResponse, UserUpdate
)
from app.core.security import (
    create_access_token, create_refresh_token, verify_token,
    get_password_hash, verify_password, generate_referral_code, verify_firebase_token
)
from app.core.dependencies import get_db_client, get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db = Depends(get_db_client)):
    users = db.setdefault("users", {})
    orgs = db.setdefault("organizations", {})
    
    # Validate email format
    if "@" not in data.email or "." not in data.email.split("@")[1]:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Validate password strength (minimum 8 characters)
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400, 
            detail="Password must be at least 8 characters long"
        )
    
    # Check if user already exists
    for uid, u in users.items():
        if u["email"].lower() == data.email.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate organization name
    if not data.org_name or len(data.org_name.strip()) == 0:
        raise HTTPException(status_code=400, detail="Organization name is required")
            
    # Create Organization first
    org_id = f"org_{uuid.uuid4().hex[:10]}"
    orgs[org_id] = {
        "org_id": org_id,
        "name": data.org_name.strip(),
        "industry": "General",
        "country": "India",
        "owner_id": "",
        "created_at": datetime.utcnow()
    }
    
    # Create User
    user_id = f"user_{uuid.uuid4().hex[:10]}"
    orgs[org_id]["owner_id"] = user_id
    
    referral_code = generate_referral_code(user_id)
    
    users[user_id] = {
        "user_id": user_id,
        "email": data.email.lower().strip(),
        "password_hash": get_password_hash(data.password),
        "name": data.name.strip(),
        "org_id": org_id,
        "role": "admin",
        "referral_code": referral_code,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    # Generate tokens
    access_token = create_access_token(user_id, role="admin")
    refresh_token = create_refresh_token(user_id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id,
        role="admin"
    )

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db = Depends(get_db_client)):
    users = db.setdefault("users", {})
    
    # Normalize email for comparison
    email = data.email.lower().strip()
    
    target_user = None
    for uid, u in users.items():
        if u["email"].lower() == email:
            target_user = u
            break
    
    if not target_user:
        # Don't reveal whether email exists
        raise HTTPException(
            status_code=400, 
            detail="Incorrect email or password"
        )
    
    if not target_user.get("is_active", False):
        raise HTTPException(
            status_code=403,
            detail="Account is inactive. Please contact support."
        )
    
    # Verify password
    if not verify_password(data.password, target_user.get("password_hash", "")):
        raise HTTPException(
            status_code=400, 
            detail="Incorrect email or password"
        )
        
    access_token = create_access_token(target_user["user_id"], role=target_user["role"])
    refresh_token = create_refresh_token(target_user["user_id"])
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=target_user["user_id"],
        role=target_user["role"]
    )

@router.post("/google-login", response_model=TokenResponse)
async def google_login(data: VerifyEmailRequest, db = Depends(get_db_client)):
    # token string is Firebase ID Token
    decoded_token = verify_firebase_token(data.token)
    email = decoded_token.get("email")
    uid = decoded_token.get("uid")
    name = decoded_token.get("name", "Google User")
    
    users = db.setdefault("users", {})
    orgs = db.setdefault("organizations", {})
    
    target_user = None
    for uid_key, u in users.items():
        if u["email"] == email:
            target_user = u
            break
            
    if not target_user:
        # Sign up user automatically on google login
        org_id = f"org_{uuid.uuid4().hex[:10]}"
        orgs[org_id] = {
            "org_id": org_id,
            "name": f"{name}'s Org",
            "industry": "General",
            "country": "India",
            "owner_id": uid,
            "created_at": datetime.utcnow()
        }
        
        referral_code = generate_referral_code(uid)
        target_user = {
            "user_id": uid,
            "email": email,
            "name": name,
            "org_id": org_id,
            "role": "admin",
            "referral_code": referral_code,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        users[uid] = target_user
        
    access_token = create_access_token(target_user["user_id"], role=target_user["role"])
    refresh_token = create_refresh_token(target_user["user_id"])
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=target_user["user_id"],
        role=target_user["role"]
    )

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db = Depends(get_db_client)):
    payload = verify_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user_id = payload.get("sub")
    users = db.setdefault("users", {})
    user = users.get(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    access = create_access_token(user_id, role=user["role"])
    refresh = create_refresh_token(user_id)
    
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        user_id=user_id,
        role=user["role"]
    )

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        user_id=current_user["user_id"],
        email=current_user["email"],
        name=current_user["name"],
        org_id=current_user["org_id"],
        role=current_user["role"],
        created_at=current_user["created_at"] if isinstance(current_user["created_at"], datetime) else datetime.utcnow(),
        is_active=current_user.get("is_active", True)
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(data: UserUpdate, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    users = db.setdefault("users", {})
    user = users.get(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.name is not None:
        user["name"] = data.name
    if data.role is not None:
        user["role"] = data.role
        
    users[current_user["user_id"]] = user
    
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        org_id=user["org_id"],
        role=user["role"],
        created_at=user["created_at"] if isinstance(user["created_at"], datetime) else datetime.utcnow(),
        is_active=user.get("is_active", True)
    )

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    users = db.setdefault("users", {})
    if current_user["user_id"] in users:
        users[current_user["user_id"]]["is_active"] = False
    return {"message": "Account successfully deactivated"}
