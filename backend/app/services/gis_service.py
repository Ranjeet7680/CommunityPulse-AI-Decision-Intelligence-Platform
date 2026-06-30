import random

class GISService:
    def __init__(self):
        # District center coordinates mapping
        self.districts = {
            "District 1": [77.5946, 12.9716],
            "District 2": [77.6046, 12.9816],
            "District 3": [77.5846, 12.9616],
            "District 4": [77.6146, 12.9516],
            "District 5": [77.5746, 12.9916],
            "District 6": [77.6246, 12.9416]
        }

    async def get_layer_data(self, layer_type: str) -> dict:
        features = []
        for name, coords in self.districts.items():
            features.append({
                "type": "Feature",
                "properties": {
                    "district": name,
                    "intensity": round(random.uniform(0.2, 0.8), 2)
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": coords
                }
            })
        return {
            "type": "FeatureCollection",
            "features": features
        }
