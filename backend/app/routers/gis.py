from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import HeatmapRequest, HeatmapResponse, RouteOptRequest, RouteOptResponse
from app.core.dependencies import get_current_user
import random

router = APIRouter(prefix="/gis", tags=["GIS & Maps"])

# Simulated districts geojson center coordinates
DISTRICT_CENTERS = {
    "District 1": {"lat": 12.9716, "lng": 77.5946},
    "District 2": {"lat": 12.9816, "lng": 77.6046},
    "District 3": {"lat": 12.9616, "lng": 77.5846},
    "District 4": {"lat": 12.9516, "lng": 77.6146},
    "District 5": {"lat": 12.9916, "lng": 77.5746},
    "District 6": {"lat": 12.9416, "lng": 77.6246}
}

@router.get("/heatmap", response_model=HeatmapResponse)
async def get_heatmap(layer: str = "traffic"):
    # Generate mock GeoJSON coordinates for districts
    features = []
    
    for district, coords in DISTRICT_CENTERS.items():
        intensity = random.uniform(0.1, 0.9)
        if layer == "traffic" and district == "District 3":
            intensity = 0.95  # Congested
        elif layer == "flood" and district == "District 5":
            intensity = 0.85  # Vulnerable
            
        features.append({
            "type": "Feature",
            "properties": {
                "district": district,
                "intensity": intensity,
                "metric_value": round(intensity * 100, 1)
            },
            "geometry": {
                "type": "Point",
                "coordinates": [coords["lng"], coords["lat"]]
            }
        })
        
    return HeatmapResponse(
        layer_type=layer,
        features=features
    )

@router.post("/route-optimize", response_model=RouteOptResponse)
async def optimize_route(data: RouteOptRequest):
    if len(data.waypoints) < 2:
        raise HTTPException(status_code=400, detail="At least 2 waypoints are required to optimize path")
        
    # Nearest-neighbor TSP simulation
    optimized = list(data.waypoints)
    # Shuffle middle waypoints to simulate routing TSP optimization
    if len(optimized) > 2:
        start = optimized[0]
        end = optimized[-1]
        mid = optimized[1:-1]
        random.shuffle(mid)
        optimized = [start] + mid + [end]
        
    return RouteOptResponse(
        optimized_path=optimized,
        total_distance_km=round(len(data.waypoints) * 2.85, 2),
        estimated_duration_mins=round(len(data.waypoints) * 8.5, 1)
    )

@router.get("/nearby")
async def get_nearby_services(lat: float, lng: float, service_type: str = "hospital", radius_km: float = 5.0):
    # Simulated spatial POI lookup
    services = []
    names = {
        "hospital": ["City Hospital", "Metropolitan Health Clinic", "District Medical Center"],
        "school": ["National Public School", "Central Academy", "District Primary School"],
        "police": ["Station A HQ", "District 3 Precinct", "Traffic Division HQ"]
    }
    
    selected_names = names.get(service_type, ["Emergency Services Post"])
    
    for i, name in enumerate(selected_names):
        offset_lat = random.uniform(-0.01, 0.01)
        offset_lng = random.uniform(-0.01, 0.01)
        
        services.append({
            "id": f"poi_{service_type}_{i}",
            "name": name,
            "type": service_type,
            "coordinates": {"lat": lat + offset_lat, "lng": lng + offset_lng},
            "distance_km": round(random.uniform(0.5, radius_km), 2),
            "status": "active"
        })
        
    return {
        "center": {"lat": lat, "lng": lng},
        "service_type": service_type,
        "results": services
    }
