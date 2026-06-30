from app.core.security import generate_referral_code
from datetime import datetime

class ReferralService:
    def __init__(self, db_client):
        self.db = db_client

    async def apply_referral(self, code: str, referee_id: str) -> dict:
        users = self.db.setdefault("users", {})
        wallets = self.db.setdefault("wallets", {})
        referrals = self.db.setdefault("referrals", [])
        
        # Check promo codes
        promo_rewards = {
            "GEMINI50": 5000.0,
            "PULSEPARTNER": 10000.0,
            "NVIDIA99": 15000.0,
            "GOOGLE2024": 20000.0
        }
        
        code_upper = code.upper()
        if code_upper in promo_rewards:
            reward = promo_rewards[code_upper]
            wallet = wallets.setdefault(referee_id, {"balance": 0.0})
            wallet["balance"] += reward
            return {"status": "success", "reward": reward, "new_balance": wallet["balance"]}
            
        # Check user referrals
        referrer_id = None
        for uid, u in users.items():
            if u.get("referral_code", "").upper() == code_upper:
                referrer_id = uid
                break
                
        if not referrer_id:
            raise ValueError("Invalid referral code")
            
        if referrer_id == referee_id:
            raise ValueError("Cannot refer yourself")
            
        # Apply rewards
        ref_wallet = wallets.setdefault(referrer_id, {"balance": 0.0})
        user_wallet = wallets.setdefault(referee_id, {"balance": 0.0})
        
        ref_wallet["balance"] += 5000.0
        user_wallet["balance"] += 2500.0
        
        referrals.append({
            "referrer_id": referrer_id,
            "referee_id": referee_id,
            "code": code_upper,
            "reward": 5000.0,
            "status": "completed",
            "created_at": datetime.utcnow()
        })
        
        return {"status": "success", "reward": 2500.0, "new_balance": user_wallet["balance"]}
