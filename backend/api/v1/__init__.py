from fastapi import APIRouter
from api.v1.foods import router as foods_router
from api.v1.recommendations import router as recommendations_router
from api.v1.planner import router as planner_router
from api.v1.chat import router as chat_router

router = APIRouter()

router.include_router(foods_router, prefix="/foods", tags=["foods"])
router.include_router(recommendations_router, prefix="", tags=["recommendations"])
router.include_router(planner_router, prefix="/planner", tags=["planner"])
router.include_router(chat_router, prefix="/chat", tags=["chat"])
