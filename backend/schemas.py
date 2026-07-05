from pydantic import BaseModel
from typing import List, Literal

class Patch(BaseModel):
    id: int
    x: int  # column index 0-7
    y: int  # row index 0-7
    status: Literal["healthy", "unhealthy"]
    confidence: float

class PatchSummary(BaseModel):
    healthy_patches: int
    unhealthy_patches: int
    total_patches: int
    healthy_area: float  # percentage
    unhealthy_area: float  # percentage
    average_confidence: float

class DetectionResult(BaseModel):
    is_leaf: bool
    plant_name: str
    confidence: float
    health_score: float
    healthy_percentage: float
    unhealthy_percentage: float
    severity: Literal["None", "Low", "Medium", "High", "Critical"]
    patches: List[Patch]
    patch_summary: PatchSummary

class LeafValidationResult(BaseModel):
    is_leaf: bool
    confidence: float
    message: str
