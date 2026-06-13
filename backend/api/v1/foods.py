from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas.food import FoodListSchema, FoodDetailSchema
from schemas.recommendation import SynergySchema
from schemas.response import ApiResponse
from services.food_service import FoodService

router = APIRouter()

@router.get("", response_model=ApiResponse[List[FoodListSchema]])
def get_foods(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    foods = FoodService.get_foods(db, category, search)
    return ApiResponse(data=[FoodListSchema.from_orm(f) for f in foods])

@router.get("/combinations", response_model=ApiResponse[List[SynergySchema]])
def get_combinations(db: Session = Depends(get_db)):
    synergies = FoodService.get_combinations(db)
    return ApiResponse(data=[SynergySchema.from_orm(s) for s in synergies])

@router.get("/{food_id}", response_model=ApiResponse[FoodDetailSchema])
def get_food_detail(food_id: str, db: Session = Depends(get_db)):
    food = FoodService.get_food_detail(db, food_id)
    return ApiResponse(data=FoodDetailSchema.from_orm(food))
