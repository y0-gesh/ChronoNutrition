import json
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from repositories.food_repository import FoodRepository
from models.food import Food

class RecommendationService:
    @staticmethod
    def get_recommendations(db: Session, goal: str) -> List[Dict[str, Any]]:
        # Retrieve scores from database
        goal_scores = FoodRepository.get_goal_scores_by_goal(db, goal)
        
        results = []
        for gs in goal_scores:
            food = FoodRepository.get_food_by_id(db, gs.food_id)
            if not food:
                continue
            
            # Safely parse JSON reasons
            try:
                reasons_list = json.loads(gs.reasons) if gs.reasons else []
            except Exception:
                reasons_list = [gs.reasons] if gs.reasons else []

            results.append({
                "food": food,
                "score": gs.score,
                "reasons": reasons_list,
                "quantity": gs.quantity,
                "best_time": food.best_time_to_eat.split(", ")[0] if food.best_time_to_eat else "Anytime"
            })
            
        return results[:5]

    @staticmethod
    def get_deficiencies(db: Session, symptoms: str) -> Dict[str, Any]:
        symptom_list = [s.strip().lower().replace(" ", "_") for s in symptoms.split(",")]
        
        # Deficiency mapping table (adapted for medical safety)
        deficiency_map = {
            "fatigue": {
                "factors": ["Iron", "Magnesium", "Vitamin B6 / B12"],
                "foods": ["spinach", "beetroot", "pumpkin_seeds", "dates", "banana"],
                "description": "Fatigue is often tied to low oxygen carrying capacity (Iron) or diminished mitochondrial ATP production (Magnesium)."
            },
            "hair_loss": {
                "factors": ["Zinc", "Vitamin E", "Iron"],
                "foods": ["almonds", "walnuts", "pumpkin_seeds", "spinach"],
                "description": "Healthy follicles require structural support from zinc, vascular flow from iron, and lipid barrier support from Vitamin E."
            },
            "muscle_cramps": {
                "factors": ["Magnesium", "Potassium", "Calcium"],
                "foods": ["banana", "spinach", "pumpkin_seeds", "sweet_potato", "almonds", "chia_seeds"],
                "description": "Electrolytic imbalances in potassium and magnesium impede proper neural signal transitions to muscle spindles, prompting involuntary contractions."
            },
            "dry_skin": {
                "factors": ["Vitamin E", "Vitamin A", "Omega-3 Fatty Acids"],
                "foods": ["almonds", "carrot", "walnuts", "chia_seeds", "spinach"],
                "description": "Inadequate cellular lipid protection (Vitamin E) or structural renewal (Vitamin A) leads to dry epidermal peeling and barrier breakdown."
            },
            "frequent_illness": {
                "factors": ["Vitamin C", "Zinc", "Selenium"],
                "foods": ["orange", "kiwi", "broccoli", "garlic", "pomegranate"],
                "description": "Weakened defenses often result from low phagocyte activity (Vitamin C) or sluggish T-cell growth/activation (Zinc)."
            },
            "weakness": {
                "factors": ["Protein", "Iron", "Calcium"],
                "foods": ["pumpkin_seeds", "almonds", "spinach", "chia_seeds", "broccoli"],
                "description": "General weakness can point to poor muscular tissue maintenance (protein) or lowered blood oxygen levels (iron)."
            }
        }

        detected_factors = set()
        recommended_food_ids = set()
        summaries = []

        for symptom in symptom_list:
            if symptom in deficiency_map:
                mapping = deficiency_map[symptom]
                detected_factors.update(mapping["factors"])
                recommended_food_ids.update(mapping["foods"])
                summaries.append({
                    "symptom": symptom.replace("_", " ").title(),
                    "possible_nutritional_factors_associated_with_symptoms": mapping["factors"],
                    "reasoning": mapping["description"]
                })

        # Fetch food details
        recommended_foods = FoodRepository.get_foods_by_ids(db, list(recommended_food_ids))

        return {
            "symptoms_analyzed": [s.replace("_", " ").title() for s in symptom_list],
            "possible_nutritional_factors_associated_with_symptoms": list(detected_factors),
            "summaries": summaries,
            "recommended_foods": recommended_foods,
            "medical_disclaimer": "Disclaimer: ChronoNutrition provides informational dietary insights and is not a medical diagnostic service. Please consult a qualified physician for specific health/medical treatments."
        }
