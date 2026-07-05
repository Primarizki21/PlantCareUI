from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import predict

app = FastAPI(title="PlantCare Leaf Health API", version="1.0.0")

# Setup CORS to allow React Frontend to connect from any local port (5173, 5174, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api", tags=["predict"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to the PlantCare Leaf Health Assessment API",
        "endpoints": {
            "predict": "/api/predict (POST)",
            "validate-leaf": "/api/validate-leaf (POST)",
            "health": "/api/health (GET)"
        }
    }
