import base64
import io
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from PIL import Image
from backend.models.background_remover import remover
from backend.models.leaf_validator import validator
from backend.models.patch_classifier import classifier
from backend.schemas import DetectionResult, PatchSummary, LeafValidationResult, Patch

router = APIRouter()

NOT_LEAF_MESSAGE = "The uploaded image is not a valid leaf image."


def open_upload_image(contents: bytes) -> Image.Image:
    """Open and verify an uploaded image; raise ValueError on invalid data."""
    if not contents:
        raise ValueError("Empty file uploaded.")
    try:
        image = Image.open(io.BytesIO(contents))
        image.load()
    except Exception as exc:
        raise ValueError("Invalid or corrupted image file.") from exc
    return image

def pil_to_base64_png(image: Image.Image) -> str:
    buf = io.BytesIO()
    image.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode("ascii")

def flatten_to_black(rgba: Image.Image) -> Image.Image:
    """Composite RGBA onto solid black so transparent areas render as black."""
    bg = Image.new("RGB", rgba.size, (0, 0, 0))
    bg.paste(rgba, mask=rgba.split()[3])
    return bg

def calculate_severity(unhealthy_pct: float) -> str:
    if unhealthy_pct <= 3.0:
        return "None"
    elif unhealthy_pct <= 15.0:
        return "Low"
    elif unhealthy_pct <= 40.0:
        return "Medium"
    elif unhealthy_pct <= 70.0:
        return "High"
    else:
        return "Critical"

@router.post("/predict", response_model=DetectionResult)
async def predict_leaf_health(
    file: UploadFile = File(...),
    plant_name: str = Form("Unknown")
):
    try:
        contents = await file.read()
        image = open_upload_image(contents)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # Step 1: Validate if it's a leaf
    try:
        validation = validator.predict(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf validation failed: {str(e)}")
        
    if not validation["is_leaf"]:
        return DetectionResult(
            is_leaf=False,
            message=NOT_LEAF_MESSAGE,
            plant_name=plant_name,
            confidence=round(validation["confidence"] * 100, 2),
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
                average_confidence=0.0,
                analyzed_count=0,
                skipped_count=0
            )
        )

    # Step 2: Remove background so the patch classifier sees the leaf only
    try:
        leaf_rgba = remover.remove(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")

    processed_b64 = pil_to_base64_png(flatten_to_black(leaf_rgba))

    # Step 3: Crop into 8x8 patches and classify (RGBA so alpha can filter bg)
    try:
        patches_data, analyzed_count, skipped_count = classifier.classify_patches(leaf_rgba)
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
        average_confidence=round(avg_conf * 100, 2),
        analyzed_count=analyzed_count,
        skipped_count=skipped_count
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
        patch_summary=patch_summary,
        processed_image_base64=processed_b64
    )

@router.post("/validate-leaf", response_model=LeafValidationResult)
async def validate_leaf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = open_upload_image(contents)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        validation = validator.predict(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf validation failed: {str(e)}")

    message = (
        "The uploaded image appears to contain a plant leaf."
        if validation["is_leaf"]
        else NOT_LEAF_MESSAGE
    )

    return LeafValidationResult(
        is_leaf=validation["is_leaf"],
        confidence=round(validation["confidence"] * 100, 2),
        message=message
    )

@router.post("/remove-background", responses={200: {"content": {"image/png": {}}}})
async def remove_background(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = open_upload_image(contents)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        validation = validator.predict(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf validation failed: {str(e)}")

    if not validation["is_leaf"]:
        raise HTTPException(status_code=400, detail=NOT_LEAF_MESSAGE)

    try:
        leaf_rgba = remover.remove(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")

    buf = io.BytesIO()
    leaf_rgba.save(buf, format="PNG", optimize=True)
    return Response(content=buf.getvalue(), media_type="image/png")

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
