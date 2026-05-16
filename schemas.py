from pydantic import BaseModel
from typing import List


class AllergenItem(BaseModel):
    name: str
    score: int
    probability: float
    level: str
    color: str


class AllergenResponse(BaseModel):
    food_name: str
    confidence: float
    overall_risk: str
    allergens: List[AllergenItem]