from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from models.food import Food, FoodGoalScore

class FoodRepository:
    @staticmethod
    def get_all_foods(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[Food]:
        query = db.query(Food)
        if category:
            query = query.filter(Food.category == category)
        if search:
            query = query.filter(
                or_(
                    Food.name.ilike(f"%{search}%"),
                    Food.scientific_name.ilike(f"%{search}%"),
                    Food.description.ilike(f"%{search}%")
                )
            )
        return query.all()

    @staticmethod
    def get_food_by_id(db: Session, food_id: str) -> Optional[Food]:
        return db.query(Food).filter(Food.id == food_id).first()

    @staticmethod
    def get_foods_by_ids(db: Session, food_ids: List[str]) -> List[Food]:
        return db.query(Food).filter(Food.id.in_(food_ids)).all()

    @staticmethod
    def get_goal_scores_by_goal(db: Session, goal: str) -> List[FoodGoalScore]:
        return (
            db.query(FoodGoalScore)
            .filter(FoodGoalScore.goal == goal.lower().replace(" ", "_"))
            .order_by(FoodGoalScore.score.desc())
            .all()
        )
