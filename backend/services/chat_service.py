from sqlalchemy.orm import Session
from typing import Dict, Any, List
from ai.gemini_client import GeminiClient
from repositories.food_repository import FoodRepository

class ChatService:
    @staticmethod
    def run_chat(db: Session, message: str) -> Dict[str, Any]:
        # Fetch food summary info to optimize tokens for AI
        all_foods = FoodRepository.get_all_foods(db)
        foods_info = [
            {"id": f.id, "name": f.name, "category": f.category}
            for f in all_foods
        ]

        # 1. Try Gemini AI integration
        ai_response = GeminiClient.run_chat_query(message, foods_info)

        if ai_response:
            reply = ai_response["reply"]
            matched_ids = ai_response["recommended_foods"]
        else:
            # Fallback to local rule/keyword matcher
            msg_lower = message.lower()
            matched_ids = []
            reply = ""

            # Exercise keywords
            if any(k in msg_lower for k in ["gym", "workout", "exercise", "pre-workout", "post-workout"]):
                matched_ids = ["banana", "dates", "sweet_potato", "beetroot"]
                reply = "For exercises and athletic workouts, timing is critical. Before a workout (30-60 minutes), focus on fast-digesting carbohydrates like **Bananas** and **Dates** to rapidly top up glycogen levels. For long-term vascular dilation, drinking/eating **Beetroot** 2 hours prior improves nitric oxide flow. Post-workout, consume **Sweet Potatoes** alongside high plant-proteins to recover tissues."
            
            # Sleep keywords
            elif any(k in msg_lower for k in ["sleep", "insomnia", "night", "bedtime", "bed"]):
                matched_ids = ["kiwi", "pumpkin_seeds", "walnuts", "banana"]
                reply = "To support deep, restful sleep naturally, look for foods rich in serotonin, tryptophan, or muscle-relaxing minerals. **Kiwis** eaten 1-2 hours before bed significantly enhance sleep quality due to their serotonin concentration. **Pumpkin Seeds** supply magnesium and tryptophan, which convert to sleep-inducing melatonin. **Walnuts** provide direct plant-based melatonin, and **Bananas** contain potassium/magnesium to ease muscular tension."

            # Study/Focus keywords
            elif any(k in msg_lower for k in ["concentration", "study", "focus", "brain", "memory", "productivity"]):
                matched_ids = ["blueberries", "walnuts", "almonds", "pumpkin_seeds"]
                reply = "Optimal brain health and focus require essential omega-3 fatty acids, protective antioxidants, and vital minerals. **Blueberries** are the premier choice, containing anthocyanins that pass the blood-brain barrier to sharpen neural communication. **Walnuts** deliver critical plant omega-3s (ALA) to enhance cognitive agility. **Almonds** and **Pumpkin Seeds** supply Vitamin E and Zinc to combat brain tissue oxidation."

            # Cold/Immunity keywords
            elif any(k in msg_lower for k in ["cold", "flu", "sick", "illness", "immunity", "immune"]):
                matched_ids = ["orange", "kiwi", "garlic", "ginger", "turmeric"]
                reply = "To bolster your immune response and recover faster, target high-strength Vitamin C and natural antiviral herbs. **Oranges** and **Kiwis** provide exceptional Vitamin C density. **Garlic** contains active allicin, a heavy organosulfur antimicrobial that suppresses cold viruses. **Ginger** reduces throat inflammation and nausea, while **Turmeric** controls systemic inflammation."

            # Digestion keywords
            elif any(k in msg_lower for k in ["digestion", "bloating", "gut", "stomach", "indigestion"]):
                matched_ids = ["ginger", "kiwi", "apple", "chia_seeds"]
                reply = "For digestive comfort, we focus on gas relief, active enzymes, and healthy fibers. **Ginger** speeds gastric emptying, stopping fermentation. **Kiwis** contain actinidin, a proteolytic enzyme that breaks down heavy proteins. **Apples** (pectin) and **Chia Seeds** are exceptional prebiotics, feeding healthy gut bacteria and promoting bowel regularity."

            # Fatigue / tiredness
            elif any(k in msg_lower for k in ["fatigue", "tired", "energy", "weakness"]):
                matched_ids = ["spinach", "beetroot", "dates", "banana"]
                reply = "Fatigue can indicate a lack of oxygen carrier density (iron) or metabolic conversion fuel. **Spinach** is packed with non-heme iron and magnesium. **Beetroot** expands blood vessels to improve oxygen delivery. **Dates** and **Bananas** offer immediate carbohydrate fuel to counter mid-day fatigue drops."

            # Skin health
            elif any(k in msg_lower for k in ["skin", "acne", "wrinkles", "aging", "hair"]):
                matched_ids = ["almonds", "carrot", "pomegranate", "orange"]
                reply = "Radiant skin and hair depend on cellular antioxidant protection and strong collagen support. **Almonds** provide skin-shielding Vitamin E. **Carrots** supply beta-carotene which helps generate and repair skin tissues. **Oranges** and **Pomegranates** provide high Vitamin C to boost collagen building and prevent cellular signs of aging."

            # General catch-all
            else:
                matched_ids = ["banana", "blueberries", "spinach", "turmeric", "almonds"]
                reply = "Hello! I am your ChronoNutrition Assistant. You can ask me questions like:\n- *'What foods improve my sleep?'*\n- *'What should I eat before going to the gym?'*\n- *'Which foods help with brain focus while studying?'*\n- *'I feel fatigued, what should I eat?'*\n\nBased on general health, some of our premier timing-aware superfoods are **Bananas** (pre-workout energy), **Blueberries** (morning focus), **Spinach** (nitrate stamina at lunch), **Turmeric** (anti-inflammatory), and **Almonds** (brain/skin health)."

        # Fetch hydrated foods from DB
        foods = FoodRepository.get_foods_by_ids(db, matched_ids)
        
        # Sort/order to match matched_ids mapping
        hydrated_foods = []
        for mid in matched_ids:
            for f in foods:
                if f.id == mid:
                    hydrated_foods.append(f)
                    break

        return {
            "reply": reply,
            "recommended_foods": hydrated_foods
        }
