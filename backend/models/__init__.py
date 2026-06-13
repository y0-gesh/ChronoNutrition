from database import Base
from models.food import Food, Nutrition, Vitamin, Mineral, Benefit, Evidence, FoodGoalScore

# Expose models so SQLAlchemy metadata compiles them easily
__all__ = ["Food", "Nutrition", "Vitamin", "Mineral", "Benefit", "Evidence", "FoodGoalScore"]
