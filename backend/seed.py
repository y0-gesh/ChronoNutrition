import json
import re
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models

# Parse legacy string amount (e.g. "53.2 mg" -> 53.2, "mg")
def parse_amount(amount_str: str):
    if not amount_str:
        return 0.0, ""
    amount_str = amount_str.strip()
    # Find match: decimal/float followed by spaces and a word
    m = re.match(r"([0-9.]+)\s*(.*)", amount_str)
    if m:
        try:
            val = float(m.group(1))
            unit = m.group(2).strip()
            return val, unit
        except ValueError:
            pass
    return 0.0, amount_str

def seed_database():
    # Drop and recreate schema on manual seed run
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Load data files
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        
        with open(os.path.join(data_dir, "foods.json"), "r", encoding="utf-8") as f:
            foods_data = json.load(f)
            
        with open(os.path.join(data_dir, "vitamins.json"), "r", encoding="utf-8") as f:
            vitamins_data = json.load(f)
            
        with open(os.path.join(data_dir, "minerals.json"), "r", encoding="utf-8") as f:
            minerals_data = json.load(f)
            
        with open(os.path.join(data_dir, "food_benefits.json"), "r", encoding="utf-8") as f:
            benefits_data = json.load(f)

        with open(os.path.join(data_dir, "food_goal_scores.json"), "r", encoding="utf-8") as f:
            goal_scores_data = json.load(f)

        print(f"Seeding {len(foods_data)} foods...")
        
        # 2. Add Foods and Nutrition
        for food_item in foods_data:
            db_food = models.Food(
                id=food_item["id"],
                name=food_item["name"],
                scientific_name=food_item["scientific_name"],
                category=food_item["category"],
                image=food_item["image"],
                description=food_item["description"],
                glycemic_index=food_item["glycemic_index"],
                water_content=food_item["water_content"],
                antioxidant_score=food_item["antioxidant_score"],
                best_time_to_eat=food_item["best_time_to_eat"],
                avoid_time=food_item["avoid_time"]
            )
            db.add(db_food)
            db.flush()

            # Add Nutrition
            nut = food_item["nutrition"]
            db_nutrition = models.Nutrition(
                food_id=db_food.id,
                calories=nut["calories"],
                protein=nut["protein"],
                carbs=nut["carbs"],
                fats=nut["fats"],
                fiber=nut["fiber"],
                sugar=nut["sugar"]
            )
            db.add(db_nutrition)

        # 3. Add Vitamins
        for vit in vitamins_data:
            val, unit = parse_amount(vit["amount"])
            db_vit = models.Vitamin(
                food_id=vit["food_id"],
                name=vit["name"],
                amount_value=val,
                unit=unit
            )
            db.add(db_vit)

        # 4. Add Minerals
        for minl in minerals_data:
            val, unit = parse_amount(minl["amount"])
            db_minl = models.Mineral(
                food_id=minl["food_id"],
                name=minl["name"],
                amount_value=val,
                unit=unit
            )
            db.add(db_minl)

        # 5. Add Benefits & Evidence
        for ben in benefits_data:
            db_ben = models.Benefit(
                food_id=ben["food_id"],
                title=ben["title"],
                description=ben["description"],
                evidence_links=ben["evidence_links"]
            )
            db.add(db_ben)
            db.flush()

            # Create an Evidence record
            links = [link.strip() for link in ben["evidence_links"].split(",") if link.strip()]
            for idx, link in enumerate(links):
                # Infer source type from domain name
                source = "Research Study"
                if "nih.gov" in link:
                    source = "NIH Publication"
                elif "who.int" in link:
                    source = "WHO Guidelines"
                
                db_ev = models.Evidence(
                    food_id=ben["food_id"],
                    title=f"Evidence Link {idx + 1} for {ben['title']}",
                    url=link,
                    source_type=source
                )
                db.add(db_ev)

        # 6. Add FoodGoalScores
        for gs in goal_scores_data:
            db_gs = models.FoodGoalScore(
                food_id=gs["food_id"],
                goal=gs["goal"],
                score=gs["score"],
                quantity=gs["quantity"],
                reasons=json.dumps(gs["reasons"])
            )
            db.add(db_gs)

        db.commit()
        print("Database successfully seeded.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
