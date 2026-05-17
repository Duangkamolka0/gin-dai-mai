from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from .model import predict_food_from_bytes
from .scorer import analyze_allergens
from .schemas import AllergenResponse
import json

router = APIRouter(prefix="/api/v1", tags=["allergen"])

@router.post("/allergen", response_model=AllergenResponse)
async def get_allergen(
    file: UploadFile = File(...),
    user_data: str = Form("{}")  # 🟢 เพิ่มตรงนี้เพื่อดักรับก้อนข้อมูลคนแพ้ที่ api.js ส่งมา
):
    # ตรวจสอบประเภทไฟล์
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น")
    
    # อ่านไฟล์รูปภาพออกมาเป็น Bytes
    image_bytes = await file.read()
    
    # แปลงก้อนข้อมูล JSON String จาก Frontend กลับเป็น Python Dictionary
    try:
        allergy_data = json.loads(user_data)
        allergen_level = allergy_data.get("allergen_level", {})
        custom_ingredients = allergy_data.get("custom_ingredients", {})
    except Exception:
        allergen_level = {}
        custom_ingredients = {}

    # 🚀 Step 1: ทำการจำแนกเมนูอาหารจากรูปภาพ (Food Recognition)
    class_name, confidence = predict_food_from_bytes(image_bytes)
    
    # 🚀 Step 2: ประเมินคะแนนความเสี่ยงสารก่อภูมิแพ้ โดยส่งข้อมูลความเสี่ยงของผู้ใช้เข้าไปคำนวณจริง
    result = analyze_allergens(
        food_name=class_name, 
        allergen_level=allergen_level, 
        custom_ingredients=custom_ingredients
    )
    
    # ส่งผลลัพธ์กลับไปยังหน้าเว็บ (Frontend)
    return AllergenResponse(
        food_name=class_name,
        food_name_thai=result["food_name_thai"],
        confidence=round(confidence, 4),
        overall_risk=result["overall_risk"],
        allergens=result["allergens"]
    )