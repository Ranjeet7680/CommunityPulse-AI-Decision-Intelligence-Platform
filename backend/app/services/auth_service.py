from app.models.schemas import RegisterRequest, LoginRequest, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, generate_referral_code
from datetime import datetime
import uuid

class AuthService:
    def __init__(self, db_client):
        self.db = db_client

    async def register_user(self, data: RegisterRequest) -> dict:
        users = self.db.setdefault("users", {})
        orgs = self.db.setdefault("organizations", {})
        
        # Check if email is already registered
        for uid, u in users.items():
            if u["email"] == data.email:
                raise ValueError("Email already registered")
                
        org_id = f"org_{uuid.uuid4().hex[:10]}"
        user_id = f"user_{uuid.uuid4().hex[:10]}"
        
        # Create Organization
        orgs[org_id] = {
            "org_id": org_id,
            "name": data.org_name,
            "industry": "General",
            "country": "India",
            "owner_id": user_id,
            "created_at": datetime.utcnow()
        }
        
        # Create User
        referral_code = generate_referral_code(user_id)
        user = {
            "user_id": user_id,
            "email": data.email,
            "password_hash": get_password_hash(data.password),
            "name": data.name,
            "org_id": org_id,
            "role": "admin",
            "referral_code": referral_code,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        users[user_id] = user
        
        access_token = create_access_token(user_id, role="admin")
        refresh_token = create_refresh_token(user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user_id,
            "role": "admin"
        }

    async def login_user(self, data: LoginRequest) -> dict:
        users = self.db.setdefault("users", {})
        
        target_user = None
        for uid, u in users.items():
            if u["email"] == data.email:
                target_user = u
                break
                
        if not target_user or not verify_password(data.password, target_user.get("password_hash", "")):
            raise ValueError("Incorrect email or password")
            
        access_token = create_access_token(target_user["user_id"], role=target_user["role"])
        refresh_token = create_refresh_token(target_user["user_id"])
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": target_user["user_id"],
            "role": target_user["role"]
        }

    async def get_user_profile(self, user_id: str) -> dict:
        users = self.db.setdefault("users", {})
        user = users.get(user_id)
        if not user:
            raise ValueError("User not found")
        return user
