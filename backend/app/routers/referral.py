from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import ReferralCodeResponse, ReferralValidateRequest, ReferralStats, LeaderboardEntry, ReferralHistory
from app.core.dependencies import get_db_client, get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/referral", tags=["Referrals"])

@router.get("/my-code", response_model=ReferralCodeResponse)
async def get_my_code(current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    users = db.setdefault("users", {})
    user = users.get(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    code = user.get("referral_code", f"PULSE_{user['user_id'][:5].upper()}")
    return ReferralCodeResponse(
        code=code,
        share_url=f"https://communitypulse.ai/onboarding?ref={code}"
    )

@router.post("/validate")
async def validate_code(data: ReferralValidateRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    users = db.setdefault("users", {})
    referrals = db.setdefault("referrals", [])
    wallets = db.setdefault("wallets", {})
    
    code = data.code.strip().upper()
    
    # Supported promo codes or user referrals
    promo_rewards = {
        "GEMINI50": 5000.0,
        "PULSEPARTNER": 10000.0,
        "NVIDIA99": 15000.0,
        "GOOGLE2024": 20000.0,
        "COMMUNITY": 3000.0
    }
    
    if code in promo_rewards:
        reward = promo_rewards[code]
        # Credit user's wallet
        user_wallet = wallets.setdefault(current_user["user_id"], {"balance": 0.0})
        user_wallet["balance"] += reward
        
        # Log referral history
        referrals.append({
            "referrer_id": "promo_system",
            "referee_id": current_user["user_id"],
            "code": code,
            "reward": reward,
            "status": "completed",
            "created_at": datetime.utcnow()
        })
        return {
            "status": "valid",
            "reward_amount": reward,
            "new_balance": user_wallet["balance"],
            "message": f"Successfully applied code {code}! Credited {reward} tokens."
        }
        
    # Check if it belongs to another user
    referrer = None
    for uid, u in users.items():
        if u.get("referral_code", "").upper() == code:
            referrer = u
            break
            
    if not referrer:
        raise HTTPException(status_code=400, detail="Invalid referral code")
        
    if referrer["user_id"] == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="You cannot use your own referral code")
        
    # Valid user referral - credit both
    referrer_reward = 5000.0
    referee_reward = 2500.0
    
    ref_wallet = wallets.setdefault(referrer["user_id"], {"balance": 0.0})
    user_wallet = wallets.setdefault(current_user["user_id"], {"balance": 0.0})
    
    ref_wallet["balance"] += referrer_reward
    user_wallet["balance"] += referee_reward
    
    referrals.append({
        "referrer_id": referrer["user_id"],
        "referee_id": current_user["user_id"],
        "code": code,
        "reward": referrer_reward,
        "status": "completed",
        "created_at": datetime.utcnow()
    })
    
    return {
        "status": "valid",
        "reward_amount": referee_reward,
        "new_balance": user_wallet["balance"],
        "message": f"Code applied! You received {referee_reward} credits, and {referrer['name']} received {referrer_reward} credits."
    }

@router.get("/stats", response_model=ReferralStats)
async def get_stats(current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    referrals = db.setdefault("referrals", [])
    wallets = db.setdefault("wallets", {})
    
    user_ref = [r for r in referrals if r["referrer_id"] == current_user["user_id"]]
    wallet = wallets.get(current_user["user_id"], {"balance": 0.0})
    
    return ReferralStats(
        total_referrals=len(user_ref),
        active_referrals=len([r for r in user_ref if r["status"] == "completed"]),
        credits_earned=wallet["balance"]
    )

@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(db = Depends(get_db_client)):
    referrals = db.setdefault("referrals", [])
    users = db.setdefault("users", {})
    
    # Calculate totals
    ref_counts = {}
    for r in referrals:
        ref_id = r["referrer_id"]
        if ref_id != "promo_system":
            ref_counts[ref_id] = ref_counts.get(ref_id, 0) + 1
            
    # Sort
    sorted_refs = sorted(ref_counts.items(), key=lambda x: x[1], reverse=True)
    
    leaderboard = []
    for rank, (uid, count) in enumerate(sorted_refs[:10], start=1):
        u = users.get(uid, {"name": "Anonymous User"})
        leaderboard.append(LeaderboardEntry(
            user_id=uid,
            name=u.get("name", "Anonymous"),
            referral_count=count,
            rank=rank
        ))
    return leaderboard

@router.get("/history", response_model=list[ReferralHistory])
async def get_history(current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    referrals = db.setdefault("referrals", [])
    users = db.setdefault("users", {})
    
    user_ref = [r for r in referrals if r["referrer_id"] == current_user["user_id"]]
    
    history = []
    for r in user_ref:
        referee = users.get(r["referee_id"], {"name": "New Signup"})
        history.append(ReferralHistory(
            referee_name=referee.get("name", "New Member"),
            date=r["created_at"] if isinstance(r["created_at"], datetime) else datetime.utcnow(),
            status=r["status"],
            reward_amount=r["reward"]
        ))
    return history
