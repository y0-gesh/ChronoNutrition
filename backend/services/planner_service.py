from sqlalchemy.orm import Session
from typing import Dict, Any, List
from repositories.food_repository import FoodRepository

class PlannerService:
    @staticmethod
    def generate_plan(
        db: Session,
        goal: str,
        activity: str,
        age: int,
        gender: str
    ) -> Dict[str, Any]:
        goal_norm = goal.lower().replace(" ", "_")
        
        # We construct a plan consisting of 5 blocks: Morning, Mid-Morning, Lunch, Evening, Dinner/Pre-sleep
        if goal_norm == "weight_loss":
            plan = [
                {"time": "08:00 AM", "meal": "Morning Hydration", "food_id": "cucumber", "quantity": "150g sliced", "benefit": "Starts metabolism and hydrates the system."},
                {"time": "11:00 AM", "meal": "Mid-Morning Snack", "food_id": "apple", "quantity": "1 medium", "benefit": "Pectin fiber holds back hunger pangs."},
                {"time": "01:30 PM", "meal": "Lunch", "food_id": "spinach", "quantity": "150g salad with lemon", "benefit": "Rich iron-boosting volume meal with low caloric impact."},
                {"time": "05:00 PM", "meal": "Evening Crunch", "food_id": "chia_seeds", "quantity": "1 tbsp soaked in water", "benefit": "Soluble fibers prolong afternoon satisfaction."},
                {"time": "08:00 PM", "meal": "Dinner", "food_id": "broccoli", "quantity": "150g steamed", "benefit": "Fibers and micronutrients facilitate overnight repair without heavy sugars."}
            ]
        elif goal_norm == "muscle_gain":
            plan = [
                {"time": "08:00 AM", "meal": "Morning Fuel", "food_id": "banana", "quantity": "1 large", "benefit": "Restores liver glycogen levels quickly."},
                {"time": "11:00 AM", "meal": "Pre-Workout Snack", "food_id": "dates", "quantity": "3 dates", "benefit": "Fast carbs for high intensity muscle contractions."},
                {"time": "01:30 PM", "meal": "Lunch", "food_id": "sweet_potato", "quantity": "200g baked", "benefit": "Complex starches replenish muscle fibers."},
                {"time": "05:00 PM", "meal": "Post-Workout Recovery", "food_id": "pumpkin_seeds", "quantity": "50g raw", "benefit": "Substantial plant protein and zinc for protein synthesis."},
                {"time": "08:00 PM", "meal": "Dinner", "food_id": "almonds", "quantity": "30g", "benefit": "Slow digesting healthy fats keep nitrogen balance positive."}
            ]
        elif goal_norm == "sleep":
            plan = [
                {"time": "08:00 AM", "meal": "Morning Wakeup", "food_id": "orange", "quantity": "1 medium", "benefit": "Bright Vitamin C wakes neural cells."},
                {"time": "11:00 AM", "meal": "Mid-Morning", "food_id": "apple", "quantity": "1 medium", "benefit": "Prebiotics balance gut flora for serotonin precursors."},
                {"time": "01:30 PM", "meal": "Lunch", "food_id": "spinach", "quantity": "100g salad", "benefit": "Magnesium begins muscular relaxation."},
                {"time": "06:00 PM", "meal": "Evening Snack", "food_id": "walnuts", "quantity": "30g", "benefit": "Provides plant omega-3s and structural cell materials."},
                {"time": "09:00 PM", "meal": "Pre-Sleep Relaxer", "food_id": "kiwi", "quantity": "2 kiwis", "benefit": "Direct serotonin and vitamins significantly improve sleep onset."}
            ]
        else:  # Focus or General Health
            plan = [
                {"time": "08:00 AM", "meal": "Morning Activation", "food_id": "blueberries", "quantity": "100g", "benefit": "Anthocyanins immediately activate brain neural pathways."},
                {"time": "11:00 AM", "meal": "Mid-Morning Energy", "food_id": "almonds", "quantity": "30g", "benefit": "Monounsaturated fats feed focus chemistry."},
                {"time": "01:30 PM", "meal": "Lunch", "food_id": "broccoli", "quantity": "100g steamed", "benefit": "Cruciferous compounds prevent liver oxidation."},
                {"time": "05:00 PM", "meal": "Brain Charger", "food_id": "walnuts", "quantity": "30g", "benefit": "Omega-3s enhance brain membrane fluidity."},
                {"time": "08:00 PM", "meal": "Dinner", "food_id": "pumpkin_seeds", "quantity": "30g", "benefit": "Tryptophan sets up evening relaxation and rest."}
            ]
            
        hydrated_plan = []
        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fats = 0.0
        
        for item in plan:
            food = FoodRepository.get_food_by_id(db, item["food_id"])
            if food:
                hydrated_plan.append({
                    "time": item["time"],
                    "meal": item["meal"],
                    "quantity": item["quantity"],
                    "benefit": item["benefit"],
                    "food": food
                })
                if food.nutrition:
                    total_calories += food.nutrition.calories or 0.0
                    total_protein += food.nutrition.protein or 0.0
                    total_carbs += food.nutrition.carbs or 0.0
                    total_fats += food.nutrition.fats or 0.0

        return {
            "goal": goal.title(),
            "age": age,
            "gender": gender.title(),
            "activity_level": activity.title(),
            "schedule": hydrated_plan,
            "macros_estimate": {
                "calories": round(total_calories, 1),
                "protein": round(total_protein, 1),
                "carbs": round(total_carbs, 1),
                "fats": round(total_fats, 1)
            }
        }
