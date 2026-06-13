from pydantic import BaseModel
from typing import List, Dict
from schemas.food import FoodListSchema

class RecommendationSchema(BaseModel):
    food: FoodListSchema
    score: int
    reasons: List[str]
    quantity: str
    best_time: str

    class Config:
        from_attributes = True

class SynergySchema(BaseModel):
    title: str
    description: str
    rating: int
    food_a: FoodListSchema
    food_b: FoodListSchema

    class Config:
        from_attributes = True

class PlannerItemSchema(BaseModel):
    time: str
    meal: str
    quantity: str
    benefit: str
    food: FoodListSchema

    class Config:
        from_attributes = True

class MacrosEstimate(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float

class PlannerResponseSchema(BaseModel):
    goal: str
    age: int
    gender: str
    activity_level: str
    schedule: List[PlannerItemSchema]
    macros_estimate: MacrosEstimate

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    recommended_foods: List[FoodListSchema] = []
