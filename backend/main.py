from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.background_remover import remover
from models.leaf_validator import validator
from models.patch_classifier import classifier
from routers import predict


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Load ML models once at startup — not per request."""
    validator.load_model()
    classifier.load_model()
    remover.load_model()
    yield


app = FastAPI(title="PlantCare Leaf Health API", version="1.0.0", lifespan=lifespan)

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
