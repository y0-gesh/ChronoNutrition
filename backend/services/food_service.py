from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from repositories.food_repository import FoodRepository
from core.exceptions import EntityNotFoundError
from models.food import Food

class FoodService:
    @staticmethod
    def get_foods(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[Food]:
        return FoodRepository.get_all_foods(db, category, search)

    @staticmethod
    def get_food_detail(db: Session, food_id: str) -> Food:
        food = FoodRepository.get_food_by_id(db, food_id)
        if not food:
            raise EntityNotFoundError(f"Food item '{food_id}' not found")
        return food

    @staticmethod
    def get_combinations(db: Session) -> List[Dict[str, Any]]:
        # Static synergistic pairings matching seed foods
        synergies = [
            {
                "partner_a": "spinach",
                "partner_b": "orange",
                "title": "Spinach + Orange (Iron + Vitamin C)",
                "description": "Non-heme plant iron found in spinach requires an acidic helper to convert into a soluble form. The Vitamin C in oranges multiplies iron absorption up to 300%.",
                "rating": 5
            },
            {
                "partner_a": "turmeric",
                "partner_b": "black_pepper",
                "title": "Turmeric + Black Pepper (Curcumin + Piperine)",
                "description": "Curcumin in turmeric has extremely poor default bioavailability. Piperine in black pepper temporarily inhibits liver breakdown enzymes, boosting curcumin absorption by 2000%.",
                "rating": 5
            },
            {
                "partner_a": "almonds",
                "partner_b": "carrot",
                "title": "Almonds + Carrot (Healthy Fats + Beta-Carotene)",
                "description": "Beta-carotene in carrots is a fat-soluble vitamin. Eating carrots alongside the monounsaturated fats in almonds ensures optimal micellar packaging and intestinal uptake.",
                "rating": 4
            },
            {
                "partner_a": "banana",
                "partner_b": "pumpkin_seeds",
                "title": "Banana + Pumpkin Seeds (Magnesium & Serotonin + Tryptophan)",
                "description": "An ideal pre-bed or late-evening snack. Tryptophan from pumpkin seeds pairs with carbs in banana which cross-regulate insulin, clearing competitive amino acids and letting tryptophan enter the brain.",
                "rating": 4
            }
        ]
        
        results = []
        for syn in synergies:
            food_a = FoodRepository.get_food_by_id(db, syn["partner_a"])
            food_b = FoodRepository.get_food_by_id(db, syn["partner_b"])
            if food_a and food_b:
                results.append({
                    "title": syn["title"],
                    "description": syn["description"],
                    "rating": syn["rating"],
                    "food_a": food_a,
                    "food_b": food_b
                })
        return results
