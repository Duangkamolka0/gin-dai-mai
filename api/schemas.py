from pydantic import BaseModel
from typing import List


class AllergenItem(BaseModel):
    name: str
    score: int
    level: str
    color: str

class RiskSummary(BaseModel):
    level: str
    color: str

class AllergenResponse(BaseModel):
    food_name: str
    food_name_thai: str
    confidence: float
    overall_risk: RiskSummary
    allergens: List[AllergenItem]