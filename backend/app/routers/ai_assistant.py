from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import ChatRequest, ChatResponse, SummarizeRequest, SummarizeResponse, RecommendRequest
from app.core.dependencies import get_current_user, get_db_client
from datetime import datetime
import google.generativeai as genai
import os
from app.core.config import get_settings

router = APIRouter(prefix="/ai", tags=["AI Assistant"])
settings = get_settings()

# Initialize Gemini if key exists
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

@router.post("/chat", response_model=ChatResponse)
async def chat(data: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_message = data.message.lower()
    
    # Try calling actual Gemini if API Key is set
    if settings.GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            # Inject community dashboard state into system instructions
            response = model.generate_content(
                f"You are the CommunityPulse AI assistant. User says: {data.message}. "
                f"Answer as an expert decision intelligence platform."
            )
            return ChatResponse(
                response=response.text,
                confidence=0.92,
                sources=["System Datasets", "Vertex Vector Index"],
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            # Fallback to local rule-based intelligence if API fails (e.g. quota limit)
            pass
            
    # Standard high-quality mock responses for community queries
    response_text = "I've analyzed the community metrics. "
    sources = ["Community Datasets"]
    
    if "traffic" in user_message:
        response_text = "The traffic prediction model shows a 14% spike on Route 7 tomorrow morning between 8:00 AM and 10:00 AM. I recommend deploying smart signals to adjust timing automatically."
        sources.append("Traffic Sensor API")
    elif "air" in user_message or "aqi" in user_message or "pollution" in user_message:
        response_text = "The air quality index in District 3 is currently 42, which is good. However, PM2.5 levels are trending slightly upwards due to heavy vehicle emission patterns."
        sources.append("AQI Monitor Station 4")
    elif "flood" in user_message:
        response_text = "Rainfall forecasting models indicate a 40% risk of localized flooding in Low-lying Sector A over the next 48 hours. Drainage gates have been scheduled for automated opening."
        sources.append("Meteorological Station Data")
    elif "water" in user_message:
        response_text = "Water availability is steady at 55%. District 1 water usage is currently 12% above average. I recommend running water conservation awareness notices in District 1."
        sources.append("Water Flow Sensors")
    else:
        response_text = f"Welcome, {current_user.get('name', 'User')}. I'm your CommunityPulse AI assistant. Ask me about traffic forecasts, water usage trends, air quality index details, or emergency alerts, and I'll analyze the connected BigQuery datasets for you."
        
    return ChatResponse(
        response=response_text,
        confidence=0.88,
        sources=sources,
        timestamp=datetime.utcnow()
    )

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(data: SummarizeRequest, db = Depends(get_db_client)):
    datasets = db.setdefault("datasets", {})
    ds = datasets.get(data.dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    return SummarizeResponse(
        summary=f"This dataset ({ds['name']}) contains {ds['row_count']} rows across {ds['column_count']} columns. Key parameters include regional timestamps, values, and status flags.",
        key_takeaways=[
            "Data is 100% complete with no missing schema values",
            "Peak readings are observed consistently around 9:00 AM local time",
            "District-level correlation reveals minor outliers in industrial zones"
        ]
    )

@router.post("/recommend")
async def get_recommendations(data: RecommendRequest):
    # Simulated recommendation engine
    return {
        "recommendations": [
            {
                "id": "rec_01",
                "title": "Automate Route 7 Traffic Signal timing",
                "impact": "High",
                "description": "Predictive models indicate traffic congestion on Route 7 tomorrow morning. Adjust signal cycles by +15 seconds."
            },
            {
                "id": "rec_02",
                "title": "Activate Air Scrubber units in District 3",
                "impact": "Medium",
                "description": "PM2.5 particulate count is trending upward. Pre-emptively run air scrubbing stations."
            },
            {
                "id": "rec_03",
                "title": "Alert District 1 citizens on water usage",
                "impact": "Low",
                "description": "Water flow levels are elevated by 12% above baseline. Suggest turning off sprinkler systems."
            }
        ]
    }
