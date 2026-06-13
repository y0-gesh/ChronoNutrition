from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas.recommendation import PlannerResponseSchema
from schemas.response import ApiResponse
from services.planner_service import PlannerService

router = APIRouter()

@router.get("", response_model=ApiResponse[PlannerResponseSchema])
def get_planner(
    goal: str = Query("health", description="weight_loss, muscle_gain, sleep, focus, immunity, health"),
    activity: str = Query("moderate", description="sedentary, moderate, active"),
    age: int = Query(30),
    gender: str = Query("unspecified"),
    db: Session = Depends(get_db)
):
    plan = PlannerService.generate_plan(db, goal, activity, age, gender)
    return ApiResponse(data=PlannerResponseSchema.from_orm(plan))
