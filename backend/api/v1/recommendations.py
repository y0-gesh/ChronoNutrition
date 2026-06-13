from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas.recommendation import RecommendationSchema
from schemas.response import ApiResponse
from services.recommendation_service import RecommendationService
from typing import List, Dict, Any

router = APIRouter()

@router.get("/recommendations", response_model=ApiResponse[List[RecommendationSchema]])
def get_recommendations(
    goal: str = Query(..., description="Goal: weight_loss, muscle_gain, sleep, focus, immunity, heart_health, digestion, skin_health"),
    db: Session = Depends(get_db)
):
    recommendations = RecommendationService.get_recommendations(db, goal)
    return ApiResponse(data=[RecommendationSchema.from_orm(r) for r in recommendations])

@router.get("/deficiencies", response_model=ApiResponse[Dict[str, Any]])
def get_deficiencies(
    symptoms: str = Query(..., description="Comma-separated symptoms (e.g. fatigue, hair_loss, muscle_cramps)"),
    db: Session = Depends(get_db)
):
    result = RecommendationService.get_deficiencies(db, symptoms)
    
    # Hydrate foods in results
    from schemas.food import FoodListSchema
    result_copy = result.copy()
    result_copy["recommended_foods"] = [FoodListSchema.from_orm(f) for f in result["recommended_foods"]]
    
    return ApiResponse(data=result_copy)
