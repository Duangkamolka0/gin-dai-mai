from pydantic import BaseModel
from typing import List
from typing import List, Optional


class IngredientItem(BaseModel):
    ingredient: str      # ชื่ออังกฤษ เช่น "shrimp"
    thai: str            # ชื่อไทย เช่น "กุ้ง"
    prob: float          # ความมั่นใจ 0–1
    
class AllergenItem(BaseModel):
    name: str
    score: int
    level: str
    color: str
    certainty: Optional[str] = None

class RiskSummary(BaseModel):
    level: str
    color: str

class AllergenResponse(BaseModel):
    food_name: str
    food_name_thai: str
    confidence: float
    overall_risk: RiskSummary
    allergens: List[AllergenItem]
    detected_ingredients: List[IngredientItem] = []
