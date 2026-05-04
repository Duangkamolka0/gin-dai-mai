from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import HTTPException

from model import predict_food_from_bytes
from scorer import analyze_allergens
from schemas import AllergenResponse
import io

router = APIRouter(prefix="/api/v1", tags=["allergen"])

@router.post("/allergen", response_model = AllergenResponse)
async def get_allergen(file: UploadFile = File(...)):
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail = "กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น")
    
    image_bytes = await file.read()
    
    # step 1 predict food
    class_name, confidence = predict_food_from_bytes(image_bytes)
    
    # step 2 analyze allergen
    result = analyze_allergens(class_name)
    
    return AllergenResponse(
        food_name = class_name,
        food_name_thai= result["food_name_thai"],
        confidence = round(confidence, 4),
        overall_risk=  result["overall_risk"],
        allergens = result["allergens"]
    )