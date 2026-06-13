from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.recommendation import ChatRequest, ChatResponse
from schemas.response import ApiResponse
from services.chat_service import ChatService

router = APIRouter()

@router.post("", response_model=ApiResponse[ChatResponse])
def run_chat(request: ChatRequest, db: Session = Depends(get_db)):
    result = ChatService.run_chat(db, request.message)
    
    # Hydrate foods in results
    from schemas.food import FoodListSchema
    result_copy = result.copy()
    result_copy["recommended_foods"] = [FoodListSchema.from_orm(f) for f in result["recommended_foods"]]
    
    return ApiResponse(data=ChatResponse.from_orm(result_copy))
