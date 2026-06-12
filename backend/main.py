import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import pydantic
import json
import random
from datetime import datetime

from database import engine, get_db, SessionLocal
import models

# Load environment variables
load_dotenv()

app = FastAPI(title="ChronoNutrition API", version="1.0.0")

# Enable CORS for Next.js frontend
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schemas for serialization
class NutritionSchema(pydantic.BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: float
    sugar: float

    class Config:
        from_attributes = True

class VitaminSchema(pydantic.BaseModel):
    name: str
    amount: str

    class Config:
        from_attributes = True

class MineralSchema(pydantic.BaseModel):
    name: str
    amount: str

    class Config:
        from_attributes = True

class BenefitSchema(pydantic.BaseModel):
    title: str
    description: str
    evidence_links: str

    class Config:
        from_attributes = True

class FoodListSchema(pydantic.BaseModel):
    id: str
    name: str
    scientific_name: str
    category: str
    image: str
    description: str
    glycemic_index: int
    water_content: float
    antioxidant_score: int
    best_time_to_eat: str
    avoid_time: str

    class Config:
        from_attributes = True

class FoodDetailSchema(FoodListSchema):
    nutrition: Optional[NutritionSchema] = None
    vitamins: List[VitaminSchema] = []
    minerals: List[MineralSchema] = []
    benefits: List[BenefitSchema] = []

    class Config:
        from_attributes = True

class ChatRequest(pydantic.BaseModel):
    message: str

class ChatResponse(pydantic.BaseModel):
    reply: str
    recommended_foods: List[FoodListSchema] = []

# --- API ENDPOINTS ---

@app.get("/api/foods", response_model=List[FoodListSchema])
def get_foods(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Food)
    if category:
        query = query.filter(models.Food.category == category)
    if search:
        query = query.filter(
            (models.Food.name.ilike(f"%{search}%")) |
            (models.Food.scientific_name.ilike(f"%{search}%")) |
            (models.Food.description.ilike(f"%{search}%"))
        )
    return query.all()

@app.get("/api/foods/{food_id}", response_model=FoodDetailSchema)
def get_food_detail(food_id: str, db: Session = Depends(get_db)):
    food = db.query(models.Food).filter(models.Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    return food

@app.get("/api/recommendations")
def get_recommendations(
    goal: str = Query(..., description="Goal: Weight Loss, Muscle Gain, Sleep, Focus, Immunity, Heart Health, Digestion, Skin Health"),
    db: Session = Depends(get_db)
):
    all_foods = db.query(models.Food).all()
    results = []

    goal_normalized = goal.lower().replace(" ", "_")

    for food in all_foods:
        score = 0
        reasons = []
        quantity = "100g"

        # Rule engine based on nutritional details and categories
        if goal_normalized == "weight_loss":
            # High fiber, high water, low calorie
            if food.water_content > 80:
                score += 4
                reasons.append("High water content assists in natural hydration and calorie control.")
            if food.nutrition and food.nutrition.fiber > 2.5:
                score += 4
                reasons.append("High soluble/insoluble fiber enhances gut satiety.")
            if food.nutrition and food.nutrition.calories < 70:
                score += 3
                reasons.append("Low caloric density allows volume eating without energy surpluses.")
            if food.id == "chia_seeds":
                score += 8
                reasons.append("Soluble fiber expands in water, prolonging fullness.")
                quantity = "1-2 tbsp (soaked)"

        elif goal_normalized == "muscle_gain":
            # High protein, good carbs
            if food.nutrition and food.nutrition.protein > 2.5:
                score += 5
                reasons.append(f"Provides {food.nutrition.protein}g of plant protein per 100g.")
            if food.category == "nuts_seeds":
                score += 4
                reasons.append("Rich in healthy fats and dense amino acids supporting tissue recovery.")
                quantity = "30g (handful)"
            if food.id in ["banana", "sweet_potato"]:
                score += 5
                reasons.append("Excellent complex carb source to refuel muscle glycogen post-exercise.")
                quantity = "1 medium banana / 150g sweet potato"

        elif goal_normalized == "sleep":
            # High Magnesium, Serotonin precursor, Tryptophan
            if food.id == "kiwi":
                score += 10
                reasons.append("Serotonin and antioxidants improve sleep onset and sleep duration.")
                quantity = "2 kiwis before bed"
            elif food.id == "pumpkin_seeds":
                score += 9
                reasons.append("Rich source of tryptophan which converts to serotonin and melatonin.")
                quantity = "30g"
            elif food.id == "walnuts":
                score += 8
                reasons.append("Contains natural plant-based melatonin and healthy fats for cellular rest.")
                quantity = "3-4 kernels"
            elif food.id == "banana":
                score += 5
                reasons.append("Contains potassium and magnesium which act as natural muscle relaxants.")
                quantity = "1 banana"

        elif goal_normalized == "focus":
            # Brain antioxidants, Omega-3s, magnesium
            if food.id == "blueberries":
                score += 10
                reasons.append("Anthocyanin antioxidants cross the blood-brain barrier, boosting cognitive signals.")
                quantity = "1 cup (150g)"
            elif food.id == "walnuts":
                score += 9
                reasons.append("Omega-3 (ALA) is critical for structural brain lipids and cognitive agility.")
                quantity = "30g"
            elif food.id in ["almonds", "pumpkin_seeds"]:
                score += 7
                reasons.append("Vitamin E and Zinc protect neural tissue from cellular oxidative stress.")
                quantity = "30g"

        elif goal_normalized == "immunity":
            # Vitamin C, Zinc, Allicin/Gingerol
            c_amount = 0
            for vit in food.vitamins:
                if vit.name == "Vitamin C":
                    # parse float amount
                    try:
                        c_amount = float(vit.amount.replace("mg", "").strip())
                    except:
                        pass
            
            if c_amount > 25:
                score += 8
                reasons.append(f"Rich in Vitamin C ({vit.amount}) stimulating white blood cell production.")
            
            if food.id in ["garlic", "ginger", "turmeric"]:
                score += 10
                reasons.append("Bioactive organosulfur / phenolic agents exhibit potent antiviral and antimicrobial properties.")
                quantity = "1-2 cloves raw / 5g ginger extract / 1/2 tsp golden spice"
            elif food.id == "broccoli":
                score += 6
                reasons.append("Cruciferous sulforaphane supports cellular defenses and liver pathways.")
                quantity = "100g steamed"

        elif goal_normalized == "heart_health":
            # Omega-3, Potassium, Polyphenols
            if food.category == "nuts_seeds":
                score += 5
                reasons.append("Monounsaturated and polyunsaturated fats help reduce LDL cholesterol.")
                quantity = "30g"
            if food.id == "pomegranate":
                score += 8
                reasons.append("Punicalagins support nitric oxide synthesis, reducing blood pressure and arterial stiffness.")
                quantity = "1 cup arils / 150ml juice"
            elif food.id == "beetroot":
                score += 8
                reasons.append("Nitrates act as a powerful vasodilator, relaxing arterial walls and lowering pressure.")
                quantity = "100g raw/steamed or juiced"

        elif goal_normalized == "digestion":
            # Enzymes, fiber, stomach-calming
            if food.id == "ginger":
                score += 9
                reasons.append("Accelerates gastric emptying and eases nausea/bloating.")
                quantity = "5g ginger slice"
            elif food.id == "kiwi":
                score += 8
                reasons.append("Actinidin enzyme aids the rapid breakdown of dietary proteins.")
                quantity = "1-2 kiwis"
            elif food.nutrition and food.nutrition.fiber > 3.0:
                score += 7
                reasons.append(f"High dietary fiber ({food.nutrition.fiber}g) feeds healthy gut microflora.")
                quantity = "100g"

        elif goal_normalized == "skin_health":
            # Vitamin E, Beta-carotene, Vitamin C, Hydration
            if food.id == "almonds":
                score += 9
                reasons.append("Packed with Vitamin E which protects dermal lipids from UV damage.")
                quantity = "30g (preferably soaked)"
            elif food.id == "carrot":
                score += 8
                reasons.append("Beta-carotene converts to retinol, maintaining skin repair and cellular turn-over.")
                quantity = "100g raw"
            elif food.id in ["orange", "pomegranate"]:
                score += 7
                reasons.append("Vitamin C boosts collagen synthesis, preserving skin structure and elasticity.")
                quantity = "1 fruit"

        if score > 0:
            results.append({
                "food": FoodListSchema.from_orm(food),
                "score": score,
                "reasons": reasons,
                "quantity": quantity,
                "best_time": food.best_time_to_eat.split(", ")[0] if food.best_time_to_eat else "Anytime"
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:5]

@app.get("/api/deficiencies")
def get_deficiencies(symptoms: str = Query(..., description="Comma-separated symptoms (e.g. fatigue, hair_loss, muscle_cramps)")):
    symptom_list = [s.strip().lower().replace(" ", "_") for s in symptoms.split(",")]
    
    analysis = {}
    
    # Mapping table
    deficiency_map = {
        "fatigue": {
            "deficiencies": ["Iron", "Magnesium", "Vitamin B6 / B12"],
            "foods": ["spinach", "beetroot", "pumpkin_seeds", "dates", "banana"],
            "description": "Fatigue is often tied to low oxygen carrying capacity (Iron) or diminished mitochondrial ATP production (Magnesium)."
        },
        "hair_loss": {
            "deficiencies": ["Zinc", "Vitamin E", "Iron"],
            "foods": ["almonds", "walnuts", "pumpkin_seeds", "spinach"],
            "description": "Healthy follicles require structural support from zinc, vascular flow from iron, and lipid barrier support from Vitamin E."
        },
        "muscle_cramps": {
            "deficiencies": ["Magnesium", "Potassium", "Calcium"],
            "foods": ["banana", "spinach", "pumpkin_seeds", "sweet_potato", "almonds", "chia_seeds"],
            "description": "Electrolytic imbalances in potassium and magnesium impede proper neural signal transitions to muscle spindles, prompting involuntary contractions."
        },
        "dry_skin": {
            "deficiencies": ["Vitamin E", "Vitamin A", "Omega-3 Fatty Acids"],
            "foods": ["almonds", "carrot", "walnuts", "chia_seeds", "spinach"],
            "description": "Inadequate cellular lipid protection (Vitamin E) or structural renewal (Vitamin A) leads to dry epidermal peeling and barrier breakdown."
        },
        "frequent_illness": {
            "deficiencies": ["Vitamin C", "Zinc", "Selenium"],
            "foods": ["orange", "kiwi", "broccoli", "garlic", "pomegranate"],
            "description": "Weakened defenses often result from low phagocyte activity (Vitamin C) or sluggish T-cell growth/activation (Zinc)."
        },
        "weakness": {
            "deficiencies": ["Protein", "Iron", "Calcium"],
            "foods": ["pumpkin_seeds", "almonds", "spinach", "chia_seeds", "broccoli"],
            "description": "General weakness can point to poor muscular tissue maintenance (protein) or lowered blood oxygen levels (iron)."
        }
    }

    detected_deficiencies = set()
    recommended_food_ids = set()
    summaries = []

    for symptom in symptom_list:
        if symptom in deficiency_map:
            mapping = deficiency_map[symptom]
            detected_deficiencies.update(mapping["deficiencies"])
            recommended_food_ids.update(mapping["foods"])
            summaries.append({
                "symptom": symptom.replace("_", " ").title(),
                "likely_deficiencies": mapping["deficiencies"],
                "reasoning": mapping["description"]
            })

    # Fetch food details for recommendations
    db = SessionLocal()
    recommended_foods = db.query(models.Food).filter(models.Food.id.in_(list(recommended_food_ids))).all()
    db.close()

    return {
        "symptoms_analyzed": [s.replace("_", " ").title() for s in symptom_list],
        "likely_deficiencies": list(detected_deficiencies),
        "summaries": summaries,
        "recommended_foods": [FoodListSchema.from_orm(f) for f in recommended_foods],
        "medical_disclaimer": "Disclaimer: ChronoNutrition provides informational dietary insights and is not a medical diagnostic service. Please consult a qualified physician for specific health/medical treatments."
    }

@app.get("/api/combinations")
def get_combinations(db: Session = Depends(get_db)):
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
    
    # Hydrate partner details
    results = []
    for syn in synergies:
        food_a = db.query(models.Food).filter(models.Food.id == syn["partner_a"]).first()
        food_b = db.query(models.Food).filter(models.Food.id == syn["partner_b"]).first()
        if food_a and food_b:
            results.append({
                "title": syn["title"],
                "description": syn["description"],
                "rating": syn["rating"],
                "food_a": FoodListSchema.from_orm(food_a),
                "food_b": FoodListSchema.from_orm(food_b)
            })
    return results

@app.get("/api/planner")
def get_planner(
    goal: str = Query("health", description="weight_loss, muscle_gain, sleep, focus, immunity, health"),
    activity: str = Query("moderate", description="sedentary, moderate, active"),
    age: int = Query(30),
    gender: str = Query("unspecified"),
    db: Session = Depends(get_db)
):
    goal_norm = goal.lower().replace(" ", "_")
    
    # We construct a plan consisting of 5 blocks: Morning, Mid-Morning, Lunch, Evening, Dinner/Pre-sleep
    plan = []
    
    # Helper to select foods by category/timing
    def get_food_by_id(fid):
        return db.query(models.Food).filter(models.Food.id == fid).first()

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
    total_calories = 0
    total_protein = 0
    total_carbs = 0
    total_fats = 0
    
    for item in plan:
        food = get_food_by_id(item["food_id"])
        if food:
            hydrated_plan.append({
                "time": item["time"],
                "meal": item["meal"],
                "quantity": item["quantity"],
                "benefit": item["benefit"],
                "food": FoodListSchema.from_orm(food)
            })
            if food.nutrition:
                total_calories += food.nutrition.calories
                total_protein += food.nutrition.protein
                total_carbs += food.nutrition.carbs
                total_fats += food.nutrition.fats

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

@app.post("/api/chat", response_model=ChatResponse)
def run_chat(request: ChatRequest, db: Session = Depends(get_db)):
    msg = request.message.lower()
    
    # Rule/Keyword matcher to fetch foods
    matched_ids = []
    reply = ""

    # Exercise keywords
    if "gym" in msg or "workout" in msg or "exercise" in msg or "pre-workout" in msg or "post-workout" in msg:
        matched_ids = ["banana", "dates", "sweet_potato", "beetroot"]
        reply = "For exercises and athletic workouts, timing is critical. Before a workout (30-60 minutes), focus on fast-digesting carbohydrates like **Bananas** and **Dates** to rapidly top up glycogen levels. For long-term vascular dilation, drinking/eating **Beetroot** 2 hours prior improves nitric oxide flow. Post-workout, consume **Sweet Potatoes** alongside high plant-proteins to recover tissues."
    
    # Sleep keywords
    elif "sleep" in msg or "insomnia" in msg or "night" in msg or "bedtime" in msg or "bed" in msg:
        matched_ids = ["kiwi", "pumpkin_seeds", "walnuts", "banana"]
        reply = "To support deep, restful sleep naturally, look for foods rich in serotonin, tryptophan, or muscle-relaxing minerals. **Kiwis** eaten 1-2 hours before bed significantly enhance sleep quality due to their serotonin concentration. **Pumpkin Seeds** supply magnesium and tryptophan, which convert to sleep-inducing melatonin. **Walnuts** provide direct plant-based melatonin, and **Bananas** contain potassium/magnesium to ease muscular tension."

    # Study/Focus keywords
    elif "concentration" in msg or "study" in msg or "focus" in msg or "brain" in msg or "memory" in msg or "productivity" in msg:
        matched_ids = ["blueberries", "walnuts", "almonds", "pumpkin_seeds"]
        reply = "Optimal brain health and focus require essential omega-3 fatty acids, protective antioxidants, and vital minerals. **Blueberries** are the premier choice, containing anthocyanins that pass the blood-brain barrier to sharpen neural communication. **Walnuts** deliver critical plant omega-3s (ALA) to enhance cognitive agility. **Almonds** and **Pumpkin Seeds** supply Vitamin E and Zinc to combat brain tissue oxidation."

    # Cold/Immunity keywords
    elif "cold" in msg or "flu" in msg or "sick" in msg or "illness" in msg or "immunity" in msg or "immune" in msg:
        matched_ids = ["orange", "kiwi", "garlic", "ginger", "turmeric"]
        reply = "To bolster your immune response and recover faster, target high-strength Vitamin C and natural antiviral herbs. **Oranges** and **Kiwis** provide exceptional Vitamin C density. **Garlic** contains active allicin, a heavy organosulfur antimicrobial that suppresses cold viruses. **Ginger** reduces throat inflammation and nausea, while **Turmeric** controls systemic inflammation."

    # Digestion keywords
    elif "digestion" in msg or "bloating" in msg or "gut" in msg or "stomach" in msg or "indigestion" in msg:
        matched_ids = ["ginger", "kiwi", "apple", "chia_seeds"]
        reply = "For digestive comfort, we focus on gas relief, active enzymes, and healthy fibers. **Ginger** speeds gastric emptying, stopping fermentation. **Kiwis** contain actinidin, a proteolytic enzyme that breaks down heavy proteins. **Apples** (pectin) and **Chia Seeds** are exceptional prebiotics, feeding healthy gut bacteria and promoting bowel regularity."

    # Fatigue / tiredness
    elif "fatigue" in msg or "tired" in msg or "energy" in msg or "weakness" in msg:
        matched_ids = ["spinach", "beetroot", "dates", "banana"]
        reply = "Fatigue can indicate a lack of oxygen carrier density (iron) or metabolic conversion fuel. **Spinach** is packed with non-heme iron and magnesium. **Beetroot** expands blood vessels to improve oxygen delivery. **Dates** and **Bananas** offer immediate carbohydrate fuel to counter mid-day fatigue drops."

    # Skin health
    elif "skin" in msg or "acne" in msg or "wrinkles" in msg or "aging" in msg or "hair" in msg:
        matched_ids = ["almonds", "carrot", "pomegranate", "orange"]
        reply = "Radiant skin and hair depend on cellular antioxidant protection and strong collagen support. **Almonds** provide skin-shielding Vitamin E. **Carrots** supply beta-carotene which helps generate and repair skin tissues. **Oranges** and **Pomegranates** provide high Vitamin C to boost collagen building and prevent cellular signs of aging."

    # General catch-all
    else:
        matched_ids = ["banana", "blueberries", "spinach", "turmeric", "almonds"]
        reply = "Hello! I am your ChronoNutrition Assistant. You can ask me questions like:\n- *'What foods improve my sleep?'*\n- *'What should I eat before going to the gym?'*\n- *'Which foods help with brain focus while studying?'*\n- *'I feel fatigued, what should I eat?'*\n\nBased on general health, some of our premier timing-aware superfoods are **Bananas** (pre-workout energy), **Blueberries** (morning focus), **Spinach** (nitrate stamina at lunch), **Turmeric** (anti-inflammatory), and **Almonds** (brain/skin health)."

    # Fetch hydrated foods from DB
    foods = db.query(models.Food).filter(models.Food.id.in_(matched_ids)).all()
    
    # Match the order of matched_ids if possible
    hydrated_foods = []
    for mid in matched_ids:
        for f in foods:
            if f.id == mid:
                hydrated_foods.append(FoodListSchema.from_orm(f))
                break

    return {
        "reply": reply,
        "recommended_foods": hydrated_foods
    }
