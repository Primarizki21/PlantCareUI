import io
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from PIL import Image
from models.leaf_validator import validator
from models.patch_classifier import classifier
from schemas import DetectionResult, PatchSummary, LeafValidationResult, Patch

router = APIRouter()

def calculate_severity(unhealthy_pct: float) -> str:
    if unhealthy_pct <= 2.0:
        return "None"
    elif unhealthy_pct <= 15.0:
        return "Low"
    elif unhealthy_pct <= 35.0:
        return "Medium"
    elif unhealthy_pct <= 60.0:
        return "High"
    else:
        return "Critical"

@router.post("/predict", response_model=DetectionResult)
async def predict_leaf_health(
    file: UploadFile = File(...),
    plant_name: str = Form("Unknown")
):
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file uploaded.")
        
    # Step 1: Validate if it's a leaf
    try:
        validation = validator.predict(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf validation failed: {str(e)}")
        
    if not validation["is_leaf"]:
        # If not leaf, return validation failed state immediately
        return DetectionResult(
            is_leaf=False,
            plant_name=plant_name,
            confidence=validation["confidence"] * 100,
            health_score=0.0,
            healthy_percentage=0.0,
            unhealthy_percentage=0.0,
            severity="None",
            patches=[],
            patch_summary=PatchSummary(
                healthy_patches=0,
                unhealthy_patches=0,
                total_patches=0,
                healthy_area=0.0,
                unhealthy_area=0.0,
                average_confidence=0.0
            )
        )
        
    # Step 2: Crop into 8x8 patches and classify
    try:
        patches_data = classifier.classify_patches(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Patch classification failed: {str(e)}")
        
    # Step 3: Compute summary stats
    total_patches = len(patches_data)
    healthy_patches = sum(1 for p in patches_data if p["status"] == "healthy")
    unhealthy_patches = total_patches - healthy_patches
    
    healthy_area = (healthy_patches / total_patches) * 100 if total_patches > 0 else 0.0
    unhealthy_area = (unhealthy_patches / total_patches) * 100 if total_patches > 0 else 0.0
    avg_conf = sum(p["confidence"] for p in patches_data) / total_patches if total_patches > 0 else 0.0
    
    severity = calculate_severity(unhealthy_area)
    
    # Map to schema classes
    patches = [
        Patch(
            id=p["id"],
            x=p["x"],
            y=p["y"],
            status=p["status"],
            confidence=p["confidence"]
        ) for p in patches_data
    ]
    
    patch_summary = PatchSummary(
        healthy_patches=healthy_patches,
        unhealthy_patches=unhealthy_patches,
        total_patches=total_patches,
        healthy_area=round(healthy_area, 2),
        unhealthy_area=round(unhealthy_area, 2),
        average_confidence=round(avg_conf * 100, 2)
    )
    
    return DetectionResult(
        is_leaf=True,
        plant_name=plant_name,
        confidence=round(validation["confidence"] * 100, 2),
        health_score=round(healthy_area, 2),
        healthy_percentage=round(healthy_area, 2),
        unhealthy_percentage=round(unhealthy_area, 2),
        severity=severity,
        patches=patches,
        patch_summary=patch_summary
    )

@router.post("/validate-leaf", response_model=LeafValidationResult)
async def validate_leaf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file uploaded.")
        
    try:
        validation = validator.predict(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf validation failed: {str(e)}")
        
    return LeafValidationResult(
        is_leaf=validation["is_leaf"],
        confidence=round(validation["confidence"] * 100, 2),
        message=validation["message"]
    )

@router.get("/health")
async def health_check():
    try:
        validator.load_model()
        classifier.load_model()
        models_loaded = True
    except Exception:
        models_loaded = False
        
    return {
        "status": "ok",
        "models_loaded": models_loaded
    }
