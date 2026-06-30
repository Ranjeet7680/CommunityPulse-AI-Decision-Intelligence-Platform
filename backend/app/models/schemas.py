from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ─── AUTH SCHEMAS ───
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str
    org_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    role: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyEmailRequest(BaseModel):
    token: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

# ─── USER SCHEMAS ───
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    org_id: str
    role: str = "member"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    org_id: str
    role: str
    created_at: datetime
    is_active: bool

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int

# ─── ORG SCHEMAS ───
class OrgCreate(BaseModel):
    name: str
    industry: str
    country: str

class OrgUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None

class OrgResponse(BaseModel):
    org_id: str
    name: str
    industry: str
    country: str
    owner_id: str
    created_at: datetime

class InviteUserRequest(BaseModel):
    email: EmailStr
    role: str = "member"

class AcceptInviteRequest(BaseModel):
    token: str

class DepartmentCreate(BaseModel):
    name: str

class RoleAssignment(BaseModel):
    user_id: str
    role: str

# ─── REFERRAL SCHEMAS ───
class ReferralCodeResponse(BaseModel):
    code: str
    share_url: str

class ReferralValidateRequest(BaseModel):
    code: str

class ReferralStats(BaseModel):
    total_referrals: int
    active_referrals: int
    credits_earned: float

class LeaderboardEntry(BaseModel):
    user_id: str
    name: str
    referral_count: int
    rank: int

class ReferralHistory(BaseModel):
    referee_name: str
    date: datetime
    status: str
    reward_amount: float

# ─── DATASET SCHEMAS ───
class DatasetUploadResponse(BaseModel):
    dataset_id: str
    filename: str
    status: str
    job_id: str

class DatasetMetadata(BaseModel):
    dataset_id: str
    name: str
    org_id: str
    row_count: int
    column_count: int
    file_size_bytes: int
    created_at: datetime
    schema_fields: Dict[str, str]

class BigQueryTableInfo(BaseModel):
    table_id: str
    dataset_id: str
    num_rows: int
    num_bytes: int
    created_at: datetime

class DataQualityReport(BaseModel):
    dataset_id: str
    completeness_score: float
    duplicate_rows: int
    null_value_counts: Dict[str, int]
    status: str

# ─── AI SCHEMAS ───
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    confidence: float
    sources: List[str]
    timestamp: datetime

class SummarizeRequest(BaseModel):
    dataset_id: str
    format: Optional[str] = "executive"

class SummarizeResponse(BaseModel):
    summary: str
    key_takeaways: List[str]

class RecommendRequest(BaseModel):
    metrics: Dict[str, Any]

class ForecastRequest(BaseModel):
    metric: str
    horizon_days: int = 7

class ForecastResponse(BaseModel):
    metric: str
    predictions: List[Dict[str, Any]]
    confidence_interval: Dict[str, List[float]]

class VoiceQueryRequest(BaseModel):
    audio_base64: str

# ─── ANALYTICS SCHEMAS ───
class KPIResponse(BaseModel):
    health_score: float
    traffic_index: float
    air_quality: float
    citizen_satisfaction: float
    timestamp: datetime

class TrendRequest(BaseModel):
    metric: str
    start_date: datetime
    end_date: datetime

class TrendResponse(BaseModel):
    metric: str
    data_points: List[Dict[str, Any]]

class AnomalyResponse(BaseModel):
    metric: str
    anomalies_detected: int
    details: List[Dict[str, Any]]

# ─── GIS SCHEMAS ───
class HeatmapRequest(BaseModel):
    layer_type: str

class GeoPoint(BaseModel):
    lat: float
    lng: float

class HeatmapResponse(BaseModel):
    layer_type: str
    features: List[Dict[str, Any]]

class RouteOptRequest(BaseModel):
    waypoints: List[GeoPoint]
    vehicle_type: str = "truck"

class RouteOptResponse(BaseModel):
    optimized_path: List[GeoPoint]
    total_distance_km: float
    estimated_duration_mins: float

# ─── NOTIFICATION SCHEMAS ───
class NotificationCreate(BaseModel):
    recipient_id: str
    title: str
    body: str
    priority: str = "normal"

class AlertCreate(BaseModel):
    metric: str
    threshold: float
    comparison_operator: str # "gt", "lt", "eq"
    channels: List[str] # "email", "sms", "push"

# ─── REPORT SCHEMAS ───
class ReportRequest(BaseModel):
    format: str # "pdf", "excel", "pptx", "csv"
    report_type: str
    date_range: Optional[str] = "last_30_days"

class ReportResponse(BaseModel):
    report_id: str
    download_url: str
    created_at: datetime

# ─── ADMIN SCHEMAS ───
class SystemHealth(BaseModel):
    cpu_utilization: float
    memory_utilization: float
    disk_utilization: float
    gpu_available: bool

class GPUStats(BaseModel):
    gpu_utilization: float
    memory_used_gb: float
    memory_total_gb: float
    temperature_celsius: float

# ─── DASHBOARD SCHEMAS ───
class CommunityHealthScore(BaseModel):
    score: float
    breakdown: Dict[str, float]

class AllKPIs(BaseModel):
    health_score: float
    traffic_index: float
    air_quality: float
    satisfaction: float
    water_usage: float
    energy_usage: float
    waste_collection: float
    emergency_status: str
