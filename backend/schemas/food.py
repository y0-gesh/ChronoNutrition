from pydantic import BaseModel
from typing import List, Optional

class NutritionSchema(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: float
    sugar: float

    class Config:
        from_attributes = True

class VitaminSchema(BaseModel):
    name: str
    amount_value: float
    unit: str

    class Config:
        from_attributes = True

class MineralSchema(BaseModel):
    name: str
    amount_value: float
    unit: str

    class Config:
        from_attributes = True

class BenefitSchema(BaseModel):
    title: str
    description: str
    evidence_links: str

    class Config:
        from_attributes = True

class EvidenceSchema(BaseModel):
    title: str
    url: str
    source_type: str

    class Config:
        from_attributes = True

class FoodGoalScoreSchema(BaseModel):
    goal: str
    score: int
    quantity: str
    reasons: List[str]

    class Config:
        from_attributes = True

class FoodListSchema(BaseModel):
    id: str
    name: str
    scientific_name: str
    category: str
    image: str
    description: str
    glycemic_index: int
    water_content: float
    antioxidant_score: int
    best_time_to_eat: str
    avoid_time: str

    class Config:
        from_attributes = True

class FoodDetailSchema(FoodListSchema):
    nutrition: Optional[NutritionSchema] = None
    vitamins: List[VitaminSchema] = []
    minerals: List[MineralSchema] = []
    benefits: List[BenefitSchema] = []
    evidences: List[EvidenceSchema] = []

    class Config:
        from_attributes = True
