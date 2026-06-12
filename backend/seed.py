import json
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models

# Drop all and recreate to ensure clean database
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        # Define foods data
        foods_data = [
            # --- FRUITS ---
            {
                "id": "banana",
                "name": "Banana",
                "scientific_name": "Musa acuminata",
                "category": "fruits",
                "image": "🍌",
                "description": "A popular, nutrient-dense fruit rich in potassium and quick-releasing carbohydrates, making it an excellent energy source.",
                "glycemic_index": 51,
                "water_content": 75.0,
                "antioxidant_score": 1037,
                "best_time_to_eat": "Morning, Pre-workout, Afternoon",
                "avoid_time": "Late night, Immediately before sleep",
                "nutrition": {"calories": 89.0, "protein": 1.1, "carbs": 22.8, "fats": 0.3, "fiber": 2.6, "sugar": 12.2},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "8.7 mg"},
                    {"name": "Vitamin B6", "amount": "0.4 mg"},
                    {"name": "Vitamin A", "amount": "64 IU"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "358 mg"},
                    {"name": "Magnesium", "amount": "27 mg"},
                    {"name": "Manganese", "amount": "0.3 mg"}
                ],
                "benefits": [
                    {
                        "title": "Immediate Energy Booster",
                        "description": "High carbohydrate content in the form of sucrose, fructose, and glucose provides quick, sustainable energy.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3355124/"
                    },
                    {
                        "title": "Supports Heart & Muscle Function",
                        "description": "Rich in potassium, which helps regulate heartbeat, fluid balance, and muscle contractions, preventing cramps during exercise.",
                        "evidence_links": "https://www.nih.gov/"
                    }
                ]
            },
            {
                "id": "apple",
                "name": "Apple",
                "scientific_name": "Malus domestica",
                "category": "fruits",
                "image": "🍎",
                "description": "An exceptionally healthy fruit rich in soluble fiber (pectin) and antioxidants like quercetin that support heart and gut health.",
                "glycemic_index": 36,
                "water_content": 86.0,
                "antioxidant_score": 3049,
                "best_time_to_eat": "Morning, Mid-day snack",
                "avoid_time": "Late night (high pectin can be heavy on digestion)",
                "nutrition": {"calories": 52.0, "protein": 0.3, "carbs": 13.8, "fats": 0.2, "fiber": 2.4, "sugar": 10.4},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "4.6 mg"},
                    {"name": "Vitamin K", "amount": "2.2 mcg"},
                    {"name": "Vitamin B6", "amount": "0.04 mg"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "107 mg"},
                    {"name": "Calcium", "amount": "6 mg"},
                    {"name": "Magnesium", "amount": "5 mg"}
                ],
                "benefits": [
                    {
                        "title": "Improves Gut Health",
                        "description": "Pectin acts as a prebiotic, feeding the friendly bacteria in your gut and improving overall digestion.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4852413/"
                    },
                    {
                        "title": "Supports Cardiovascular Health",
                        "description": "Soluble fiber helps lower blood cholesterol levels, while polyphenols like quercetin reduce blood pressure.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/22400181/"
                    }
                ]
            },
            {
                "id": "orange",
                "name": "Orange",
                "scientific_name": "Citrus sinensis",
                "category": "fruits",
                "image": "🍊",
                "description": "Vibrant citrus fruit widely celebrated for its high Vitamin C content, providing robust immune support and enhancing skin health.",
                "glycemic_index": 43,
                "water_content": 87.0,
                "antioxidant_score": 2103,
                "best_time_to_eat": "Morning, Mid-day snack",
                "avoid_time": "Empty stomach (for sensitive individuals due to citric acid)",
                "nutrition": {"calories": 47.0, "protein": 0.9, "carbs": 11.8, "fats": 0.1, "fiber": 2.4, "sugar": 9.4},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "53.2 mg"},
                    {"name": "Folate (B9)", "amount": "30 mcg"},
                    {"name": "Vitamin A", "amount": "225 IU"}
                ],
                "minerals": [
                    {"name": "Calcium", "amount": "40 mg"},
                    {"name": "Potassium", "amount": "181 mg"},
                    {"name": "Magnesium", "amount": "10 mg"}
                ],
                "benefits": [
                    {
                        "title": "Enhances Immune System",
                        "description": "Vitamin C stimulates the production of white blood cells and acts as a powerful antioxidant, protecting cells from damage.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/29099763/"
                    },
                    {
                        "title": "Improves Iron Absorption",
                        "description": "Consuming Vitamin C alongside iron-rich plant foods significantly enhances non-heme iron absorption.",
                        "evidence_links": "https://www.who.int/"
                    }
                ]
            },
            {
                "id": "kiwi",
                "name": "Kiwi",
                "scientific_name": "Actinidia deliciosa",
                "category": "fruits",
                "image": "🥝",
                "description": "Small nutrient-dense fruit packed with Vitamin C, Vitamin K, and serotonin, famously supporting sleep and digestion.",
                "glycemic_index": 50,
                "water_content": 83.0,
                "antioxidant_score": 1210,
                "best_time_to_eat": "1-2 Hours Before Sleep, Evening",
                "avoid_time": "None",
                "nutrition": {"calories": 61.0, "protein": 1.1, "carbs": 14.7, "fats": 0.5, "fiber": 3.0, "sugar": 9.0},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "92.7 mg"},
                    {"name": "Vitamin K", "amount": "40.3 mcg"},
                    {"name": "Vitamin E", "amount": "1.5 mg"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "312 mg"},
                    {"name": "Copper", "amount": "0.1 mg"},
                    {"name": "Magnesium", "amount": "17 mg"}
                ],
                "benefits": [
                    {
                        "title": "Improves Sleep Quality",
                        "description": "Studies show kiwi consumption before bed improves sleep onset, duration, and efficiency due to high serotonin and antioxidant levels.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/21669584/"
                    },
                    {
                        "title": "Aids Protein Digestion",
                        "description": "Contains actinidin, a natural proteolytic enzyme that helps break down proteins and reduces bloating.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/20459313/"
                    }
                ]
            },
            {
                "id": "blueberries",
                "name": "Blueberries",
                "scientific_name": "Vaccinium sect. Cyanococcus",
                "category": "fruits",
                "image": "🫐",
                "description": "Highly acclaimed superfood containing anthocyanin antioxidants that cross the blood-brain barrier to boost brain health and memory.",
                "glycemic_index": 53,
                "water_content": 84.0,
                "antioxidant_score": 4669,
                "best_time_to_eat": "Morning, Study session, Before workouts",
                "avoid_time": "None",
                "nutrition": {"calories": 57.0, "protein": 0.7, "carbs": 14.5, "fats": 0.3, "fiber": 2.4, "sugar": 10.0},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "9.7 mg"},
                    {"name": "Vitamin K", "amount": "19.3 mcg"},
                    {"name": "Vitamin B6", "amount": "0.05 mg"}
                ],
                "minerals": [
                    {"name": "Manganese", "amount": "0.3 mg"},
                    {"name": "Iron", "amount": "0.3 mg"},
                    {"name": "Potassium", "amount": "77 mg"}
                ],
                "benefits": [
                    {
                        "title": "Boosts Cognitive Function",
                        "description": "Anthocyanins interact with aging neurons to improve signaling, enhance short-term memory, and delay brain aging.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2850944/"
                    },
                    {
                        "title": "Reduces DNA Damage",
                        "description": "High antioxidant levels help neutralize free radicals that damage DNA, assisting in anti-aging and cancer prevention.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/17634269/"
                    }
                ]
            },
            {
                "id": "watermelon",
                "name": "Watermelon",
                "scientific_name": "Citrullus lanatus",
                "category": "fruits",
                "image": "🍉",
                "description": "Hydration champion rich in L-citrulline and lycopene, helping to alleviate muscle soreness and keep the body cool in summer.",
                "glycemic_index": 72,
                "water_content": 91.0,
                "antioxidant_score": 142,
                "best_time_to_eat": "Afternoon, Post-workout, Summer midday",
                "avoid_time": "Late night (high water content can disrupt sleep)",
                "nutrition": {"calories": 30.0, "protein": 0.6, "carbs": 7.6, "fats": 0.2, "fiber": 0.4, "sugar": 6.2},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "8.1 mg"},
                    {"name": "Vitamin A", "amount": "569 IU"},
                    {"name": "Vitamin B1", "amount": "0.03 mg"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "112 mg"},
                    {"name": "Magnesium", "amount": "10 mg"},
                    {"name": "Iron", "amount": "0.2 mg"}
                ],
                "benefits": [
                    {
                        "title": "Reduces Muscle Soreness",
                        "description": "Contains L-citrulline, an amino acid that improves nitric oxide production, boosts circulation, and reduces exercise recovery times.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/23870890/"
                    },
                    {
                        "title": "Optimal Hydration",
                        "description": "High water content combined with electrolytes restores hydration levels and regulates body temperature in summer.",
                        "evidence_links": "https://www.usda.gov/"
                    }
                ]
            },
            {
                "id": "dates",
                "name": "Dates",
                "scientific_name": "Phoenix dactylifera",
                "category": "fruits",
                "image": "🌴",
                "description": "Sweet, calorie-dense stone fruits packed with quick energy, dietary fiber, and essential minerals ideal for natural sweeteners and pre-exercise fuel.",
                "glycemic_index": 42,
                "water_content": 21.0,
                "antioxidant_score": 2387,
                "best_time_to_eat": "Morning, Pre-workout, Winter midday",
                "avoid_time": "Before sleep",
                "nutrition": {"calories": 277.0, "protein": 1.8, "carbs": 75.0, "fats": 0.2, "fiber": 6.7, "sugar": 66.0},
                "vitamins": [
                    {"name": "Vitamin B6", "amount": "0.2 mg"},
                    {"name": "Folate (B9)", "amount": "15 mcg"},
                    {"name": "Vitamin K", "amount": "2.7 mcg"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "696 mg"},
                    {"name": "Magnesium", "amount": "54 mg"},
                    {"name": "Iron", "amount": "0.9 mg"},
                    {"name": "Copper", "amount": "0.4 mg"}
                ],
                "benefits": [
                    {
                        "title": "Sustained Natural Energy",
                        "description": "Dense in natural sugars but balanced with fiber, offering an immediate energy boost without the sharp blood glucose crashes.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3992385/"
                    },
                    {
                        "title": "Aids Brain Health",
                        "description": "Contains protective compounds that help lower inflammatory markers in the brain (like IL-6) and reduce plaques associated with cognitive decline.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4994445/"
                    }
                ]
            },
            {
                "id": "pomegranate",
                "name": "Pomegranate",
                "scientific_name": "Punica granatum",
                "category": "fruits",
                "image": "🔴",
                "description": "Ruby-red arils containing punicalagins and punicic acid, making it one of the most powerful cardiovascular and anti-inflammatory superfoods.",
                "glycemic_index": 35,
                "water_content": 78.0,
                "antioxidant_score": 4479,
                "best_time_to_eat": "Morning, Afternoon snack",
                "avoid_time": "None",
                "nutrition": {"calories": 83.0, "protein": 1.7, "carbs": 18.7, "fats": 1.2, "fiber": 4.0, "sugar": 13.7},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "10.2 mg"},
                    {"name": "Vitamin K", "amount": "16.4 mcg"},
                    {"name": "Folate (B9)", "amount": "38 mcg"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "236 mg"},
                    {"name": "Copper", "amount": "0.2 mg"},
                    {"name": "Phosphorus", "amount": "36 mg"}
                ],
                "benefits": [
                    {
                        "title": "Improves Blood Circulation",
                        "description": "Antioxidants support nitric oxide bioavailability, improving blood vessel dilation, reducing arterial stiffness, and lowering blood pressure.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/28608832/"
                    },
                    {
                        "title": "Powerful Anti-inflammatory",
                        "description": "Punicalagins have been shown to reduce inflammatory activity in the digestive tract, breast cancer cells, and colon cancer cells.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/23573120/"
                    }
                ]
            },

            # --- VEGETABLES ---
            {
                "id": "spinach",
                "name": "Spinach",
                "scientific_name": "Spinacia oleracea",
                "category": "vegetables",
                "image": "🥬",
                "description": "Leafy green vegetable rich in iron, nitrates, and lutein, helping to oxygenate blood, increase physical strength, and preserve vision.",
                "glycemic_index": 15,
                "water_content": 91.4,
                "antioxidant_score": 1515,
                "best_time_to_eat": "Lunch, Dinner (Combine with Lemon/Vit C for absorption)",
                "avoid_time": "None",
                "nutrition": {"calories": 23.0, "protein": 2.9, "carbs": 3.6, "fats": 0.4, "fiber": 2.2, "sugar": 0.4},
                "vitamins": [
                    {"name": "Vitamin A", "amount": "9377 IU"},
                    {"name": "Vitamin C", "amount": "28.1 mg"},
                    {"name": "Vitamin K", "amount": "482.9 mcg"},
                    {"name": "Folate (B9)", "amount": "194 mcg"}
                ],
                "minerals": [
                    {"name": "Iron", "amount": "2.7 mg"},
                    {"name": "Calcium", "amount": "99 mg"},
                    {"name": "Magnesium", "amount": "79 mg"},
                    {"name": "Potassium", "amount": "558 mg"}
                ],
                "benefits": [
                    {
                        "title": "Reduces Fatigue & Builds Muscle Strength",
                        "description": "Nitrates in spinach increase muscle mitochondrial efficiency, requiring less oxygen and boosting stamina during workouts.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/21284861/"
                    },
                    {
                        "title": "Protects Eye Health",
                        "description": "Abundant in zeaxanthin and lutein, carotenoids that prevent macular degeneration and blue-light eye fatigue.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3705341/"
                    }
                ]
            },
            {
                "id": "broccoli",
                "name": "Broccoli",
                "scientific_name": "Brassica oleracea var. italica",
                "category": "vegetables",
                "image": "🥦",
                "description": "Cruciferous power vegetable famous for sulforaphane, a sulfur compound that aids cellular detoxification and inhibits cellular mutations.",
                "glycemic_index": 15,
                "water_content": 89.0,
                "antioxidant_score": 1510,
                "best_time_to_eat": "Lunch, Mid-day",
                "avoid_time": "Late night (high fiber can cause gas and bloating during sleep)",
                "nutrition": {"calories": 34.0, "protein": 2.8, "carbs": 6.6, "fats": 0.4, "fiber": 2.6, "sugar": 1.7},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "89.2 mg"},
                    {"name": "Vitamin K", "amount": "101.6 mcg"},
                    {"name": "Vitamin A", "amount": "623 IU"}
                ],
                "minerals": [
                    {"name": "Calcium", "amount": "47 mg"},
                    {"name": "Iron", "amount": "0.7 mg"},
                    {"name": "Potassium", "amount": "316 mg"},
                    {"name": "Magnesium", "amount": "21 mg"}
                ],
                "benefits": [
                    {
                        "title": "Supports Liver Detoxification",
                        "description": "Glucosinolates break down into sulforaphane, which activates Phase II liver detoxification pathways, clearing carcinogens.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4432495/"
                    },
                    {
                        "title": "Promotes Healthy Gut Microbiome",
                        "description": "Bioactive compounds reduce gut inflammation and support gut wall integrity, reducing food sensitivity reactions.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/29035252/"
                    }
                ]
            },
            {
                "id": "carrot",
                "name": "Carrot",
                "scientific_name": "Daucus carota",
                "category": "vegetables",
                "image": "🥕",
                "description": "Crisp root vegetable containing beta-carotene, a precursor to Vitamin A which supports optimal vision, immune defenses, and radiant skin.",
                "glycemic_index": 35,
                "water_content": 88.0,
                "antioxidant_score": 697,
                "best_time_to_eat": "Lunch, Afternoon snack, Winter midday",
                "avoid_time": "None",
                "nutrition": {"calories": 41.0, "protein": 0.9, "carbs": 9.6, "fats": 0.2, "fiber": 2.8, "sugar": 4.7},
                "vitamins": [
                    {"name": "Vitamin A", "amount": "16706 IU"},
                    {"name": "Vitamin C", "amount": "5.9 mg"},
                    {"name": "Vitamin K", "amount": "13.2 mcg"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "320 mg"},
                    {"name": "Calcium", "amount": "33 mg"},
                    {"name": "Magnesium", "amount": "12 mg"}
                ],
                "benefits": [
                    {
                        "title": "Improves Night Vision",
                        "description": "Beta-carotene converts to retinal, combining with opsin to create rhodopsin, the light-absorbing molecule critical for dim-light vision.",
                        "evidence_links": "https://www.nih.gov/"
                    },
                    {
                        "title": "Enhances Skin Elasticity",
                        "description": "Carotenoids guard the dermis from UV rays and help sustain moisture levels, supporting natural anti-aging effects.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/22465691/"
                    }
                ]
            },
            {
                "id": "beetroot",
                "name": "Beetroot",
                "scientific_name": "Beta vulgaris",
                "category": "vegetables",
                "image": "🟤",
                "description": "Root vegetable packed with inorganic nitrates that expand blood vessels, improve athletic stamina, and lower blood pressure.",
                "glycemic_index": 64,
                "water_content": 87.0,
                "antioxidant_score": 1776,
                "best_time_to_eat": "Pre-workout (2-3 hours before), Lunch, Winter",
                "avoid_time": "Late night",
                "nutrition": {"calories": 43.0, "protein": 1.6, "carbs": 9.6, "fats": 0.2, "fiber": 2.8, "sugar": 6.8},
                "vitamins": [
                    {"name": "Folate (B9)", "amount": "109 mcg"},
                    {"name": "Vitamin C", "amount": "4.9 mg"},
                    {"name": "Vitamin B6", "amount": "0.06 mg"}
                ],
                "minerals": [
                    {"name": "Iron", "amount": "0.8 mg"},
                    {"name": "Potassium", "amount": "325 mg"},
                    {"name": "Manganese", "amount": "0.3 mg"},
                    {"name": "Magnesium", "amount": "23 mg"}
                ],
                "benefits": [
                    {
                        "title": "Boosts Athletic Performance",
                        "description": "Nitrates convert to nitric oxide, widening blood vessels to deliver oxygenated blood directly to active muscles.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/23612502/"
                    },
                    {
                        "title": "Lowers Blood Pressure",
                        "description": "Nitrates produce rapid vasodilation, easing tension inside blood vessels and reducing systolic blood pressure values.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4288952/"
                    }
                ]
            },
            {
                "id": "sweet_potato",
                "name": "Sweet Potato",
                "scientific_name": "Ipomoea batatas",
                "category": "vegetables",
                "image": "🍠",
                "description": "Nutritious root vegetable providing slow-release complex carbohydrates that stabilize blood sugars and replenish muscle glycogen.",
                "glycemic_index": 54,
                "water_content": 77.0,
                "antioxidant_score": 902,
                "best_time_to_eat": "Lunch, Pre-workout, Post-workout, Winter",
                "avoid_time": "Late night (can sit heavy in stomach)",
                "nutrition": {"calories": 86.0, "protein": 1.6, "carbs": 20.1, "fats": 0.1, "fiber": 3.0, "sugar": 4.2},
                "vitamins": [
                    {"name": "Vitamin A", "amount": "14187 IU"},
                    {"name": "Vitamin C", "amount": "2.4 mg"},
                    {"name": "Vitamin B6", "amount": "0.2 mg"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "337 mg"},
                    {"name": "Manganese", "amount": "0.3 mg"},
                    {"name": "Magnesium", "amount": "25 mg"}
                ],
                "benefits": [
                    {
                        "title": "Sustained Sports Fuel",
                        "description": "Complex starches digest slowly, feeding muscles a steady line of glucose for high-intensity or endurance training.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4609785/"
                    },
                    {
                        "title": "Regulates Blood Sugar",
                        "description": "Fiber slows digestion, stabilizing post-meal glucose and improving insulin response compared to regular potatoes.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/15671191/"
                    }
                ]
            },
            {
                "id": "cucumber",
                "name": "Cucumber",
                "scientific_name": "Cucumis sativus",
                "category": "vegetables",
                "image": "🥒",
                "description": "Crisp, low-calorie summer vegetable composed mostly of water, perfect for rapid hydration, cooling, and systemic detoxification.",
                "glycemic_index": 15,
                "water_content": 95.2,
                "antioxidant_score": 140,
                "best_time_to_eat": "Lunch, Afternoon, Summer midday",
                "avoid_time": "Before sleep (increases urination)",
                "nutrition": {"calories": 15.0, "protein": 0.7, "carbs": 3.6, "fats": 0.1, "fiber": 0.5, "sugar": 1.7},
                "vitamins": [
                    {"name": "Vitamin K", "amount": "16.4 mcg"},
                    {"name": "Vitamin C", "amount": "2.8 mg"},
                    {"name": "Vitamin A", "amount": "105 IU"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "147 mg"},
                    {"name": "Magnesium", "amount": "13 mg"},
                    {"name": "Manganese", "amount": "0.1 mg"}
                ],
                "benefits": [
                    {
                        "title": "Optimal Summer Hydration",
                        "description": "With over 95% water content, cucumbers act as a refreshing internal coolant and natural diuretic to flush toxins.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/23097409/"
                    },
                    {
                        "title": "Supports Collagen Production",
                        "description": "Contains silica, a trace mineral essential for synthesising collagen, maintaining skin firmness, and building strong joints.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4938278/"
                    }
                ]
            },

            # --- HERBS & SPICES ---
            {
                "id": "turmeric",
                "name": "Turmeric",
                "scientific_name": "Curcuma longa",
                "category": "herbs_spices",
                "image": "🫚",
                "description": "Golden spice famous for curcumin, a powerful bioactive polyphenol displaying robust systemic anti-inflammatory properties.",
                "glycemic_index": 5,
                "water_content": 12.0,
                "antioxidant_score": 127068,
                "best_time_to_eat": "Morning, Evening (Take with Black Pepper to absorb)",
                "avoid_time": "None",
                "nutrition": {"calories": 312.0, "protein": 9.7, "carbs": 67.1, "fats": 3.2, "fiber": 22.7, "sugar": 3.2},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "25.9 mg"},
                    {"name": "Vitamin B6", "amount": "1.8 mg"},
                    {"name": "Vitamin E", "amount": "3.1 mg"}
                ],
                "minerals": [
                    {"name": "Iron", "amount": "55.0 mg"},
                    {"name": "Magnesium", "amount": "208 mg"},
                    {"name": "Potassium", "amount": "2080 mg"},
                    {"name": "Zinc", "amount": "4.5 mg"}
                ],
                "benefits": [
                    {
                        "title": "Inhibits Systemic Inflammation",
                        "description": "Curcumin blocks NF-kB, a molecule that travels into nuclei of cells and activates genes related to chronic inflammation.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5664031/"
                    },
                    {
                        "title": "Reduces Joint Pain (Arthritis)",
                        "description": "Studies demonstrate that curcumin reduces joint swelling and morning stiffness as effectively as common anti-inflammatory medications.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/22407462/"
                    }
                ]
            },
            {
                "id": "ginger",
                "name": "Ginger",
                "scientific_name": "Zingiber officinale",
                "category": "herbs_spices",
                "image": "🫚",
                "description": "Root spice rich in gingerols, providing rapid relief from nausea, soothing gastric muscles, and supporting digestive comfort.",
                "glycemic_index": 15,
                "water_content": 79.0,
                "antioxidant_score": 28840,
                "best_time_to_eat": "Morning (on empty stomach), Pre-meal, Monsoon",
                "avoid_time": "Before sleep (can boost metabolism/energy)",
                "nutrition": {"calories": 80.0, "protein": 1.8, "carbs": 17.8, "fats": 0.8, "fiber": 2.0, "sugar": 1.7},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "5.0 mg"},
                    {"name": "Folate (B9)", "amount": "11 mcg"},
                    {"name": "Vitamin B6", "amount": "0.16 mg"}
                ],
                "minerals": [
                    {"name": "Potassium", "amount": "415 mg"},
                    {"name": "Magnesium", "amount": "43 mg"},
                    {"name": "Iron", "amount": "0.6 mg"}
                ],
                "benefits": [
                    {
                        "title": "Relieves Indigestion & Bloating",
                        "description": "Speeds up stomach emptying, preventing the fermentation of gases and reducing symptoms of acid reflux or indigestion.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/18403946/"
                    },
                    {
                        "title": "Alleviates Nausea",
                        "description": "Acts as an effective anti-nausea treatment for pregnancy, motion sickness, and post-operative recovery.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/24490057/"
                    }
                ]
            },
            {
                "id": "garlic",
                "name": "Garlic",
                "scientific_name": "Allium sativum",
                "category": "herbs_spices",
                "image": "🧄",
                "description": "Pungent bulb containing allicin, a organosulfur compound activated upon crushing that displays powerful antimicrobial and immune properties.",
                "glycemic_index": 15,
                "water_content": 59.0,
                "antioxidant_score": 5301,
                "best_time_to_eat": "Morning (crushed, raw), Lunch, Monsoon",
                "avoid_time": "None",
                "nutrition": {"calories": 149.0, "protein": 6.4, "carbs": 33.1, "fats": 0.5, "fiber": 2.1, "sugar": 1.0},
                "vitamins": [
                    {"name": "Vitamin C", "amount": "31.2 mg"},
                    {"name": "Vitamin B6", "amount": "1.2 mg"},
                    {"name": "Folate (B9)", "amount": "3 mcg"}
                ],
                "minerals": [
                    {"name": "Selenium", "amount": "14.2 mcg"},
                    {"name": "Manganese", "amount": "1.7 mg"},
                    {"name": "Calcium", "amount": "181 mg"},
                    {"name": "Zinc", "amount": "1.2 mg"}
                ],
                "benefits": [
                    {
                        "title": "Combats the Common Cold",
                        "description": "Allicin destroys viruses and bacteria; daily intake has been proven to lower occurrence and duration of colds by 60%.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/11697022/"
                    },
                    {
                        "title": "Reduces Blood Pressure",
                        "description": "Stimulates the synthesis of nitric oxide and hydrogen sulfide, inducing smooth vascular muscle relaxation.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/26764326/"
                    }
                ]
            },
            {
                "id": "cinnamon",
                "name": "Cinnamon",
                "scientific_name": "Cinnamomum verum",
                "category": "herbs_spices",
                "image": "🪵",
                "description": "Aromatic bark rich in cinnamaldehyde, renowned for mimicking insulin actions and helping to drop fasting glucose levels.",
                "glycemic_index": 5,
                "water_content": 10.0,
                "antioxidant_score": 131420,
                "best_time_to_eat": "Morning (with tea/oats), Pre-meal",
                "avoid_time": "Late night (can stimulate metabolism)",
                "nutrition": {"calories": 247.0, "protein": 4.0, "carbs": 80.6, "fats": 1.2, "fiber": 53.1, "sugar": 2.2},
                "vitamins": [
                    {"name": "Vitamin K", "amount": "31.2 mcg"},
                    {"name": "Vitamin C", "amount": "3.8 mg"},
                    {"name": "Vitamin A", "amount": "295 IU"}
                ],
                "minerals": [
                    {"name": "Calcium", "amount": "1002 mg"},
                    {"name": "Iron", "amount": "8.3 mg"},
                    {"name": "Magnesium", "amount": "60 mg"},
                    {"name": "Manganese", "amount": "17.5 mg"}
                ],
                "benefits": [
                    {
                        "title": "Lowers Insulin Resistance",
                        "description": "Improves sensitivity to the insulin hormone, allowing cells to take up glucose more effectively, lowering blood sugars.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/24019277/"
                    },
                    {
                        "title": "Protects Against Neurodegeneration",
                        "description": "Helps block the buildup of tau proteins in neurons, an anatomical hallmark of Alzheimer's disease.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3105657/"
                    }
                ]
            },
            {
                "id": "black_pepper",
                "name": "Black Pepper",
                "scientific_name": "Piper nigrum",
                "category": "herbs_spices",
                "image": "⚫",
                "description": "Known as the King of Spices, containing piperine which enhances nutrient bioavailability and absorption of other spices.",
                "glycemic_index": 5,
                "water_content": 12.0,
                "antioxidant_score": 34000,
                "best_time_to_eat": "Lunch, Dinner (Combine with Turmeric/Curcumin)",
                "avoid_time": "Empty stomach (large quantities)",
                "nutrition": {"calories": 251.0, "protein": 10.4, "carbs": 64.0, "fats": 3.3, "fiber": 25.3, "sugar": 0.6},
                "vitamins": [
                    {"name": "Vitamin K", "amount": "163.7 mcg"},
                    {"name": "Vitamin A", "amount": "547 IU"},
                    {"name": "Vitamin E", "amount": "1.0 mg"}
                ],
                "minerals": [
                    {"name": "Iron", "amount": "9.7 mg"},
                    {"name": "Calcium", "amount": "443 mg"},
                    {"name": "Magnesium", "amount": "171 mg"},
                    {"name": "Manganese", "amount": "12.8 mg"}
                ],
                "benefits": [
                    {
                        "title": "Enhances Nutrient Absorption",
                        "description": "Piperine increases the absorption of curcumin (from turmeric) by up to 2000% and improves uptake of beta-carotene and selenium.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3918523/"
                    },
                    {
                        "title": "Improves Brain Chemistry",
                        "description": "Blocks enzymes that break down neurotransmitters like serotonin, dopamine, and norepinephrine, stabilizing mood.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/18639970/"
                    }
                ]
            },

            # --- NUTS & SEEDS ---
            {
                "id": "almonds",
                "name": "Almonds",
                "scientific_name": "Prunus dulcis",
                "category": "nuts_seeds",
                "image": "🫘",
                "description": "Nutrient-dense tree nuts rich in Vitamin E, monounsaturated fats, and magnesium, promoting heart health and skin integrity.",
                "glycemic_index": 15,
                "water_content": 4.4,
                "antioxidant_score": 4454,
                "best_time_to_eat": "Morning (soaked), Study session, Evening",
                "avoid_time": "Late night (hard to digest in large quantities)",
                "nutrition": {"calories": 579.0, "protein": 21.2, "carbs": 21.7, "fats": 49.9, "fiber": 12.5, "sugar": 4.4},
                "vitamins": [
                    {"name": "Vitamin E", "amount": "25.6 mg"},
                    {"name": "Riboflavin (B2)", "amount": "1.1 mg"},
                    {"name": "Niacin (B3)", "amount": "3.6 mg"}
                ],
                "minerals": [
                    {"name": "Magnesium", "amount": "270 mg"},
                    {"name": "Manganese", "amount": "2.3 mg"},
                    {"name": "Calcium", "amount": "269 mg"},
                    {"name": "Iron", "amount": "3.7 mg"}
                ],
                "benefits": [
                    {
                        "title": "Strong Skin Health & Protection",
                        "description": "Vitamin E is a lipid-soluble antioxidant that protects cell lipids from oxidation, reducing ultraviolet skin damage.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/11340114/"
                    },
                    {
                        "title": "Controls Blood Sugar levels",
                        "description": "High magnesium content helps improve insulin performance, assisting in blood sugar regulation.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3820055/"
                    }
                ]
            },
            {
                "id": "walnuts",
                "name": "Walnuts",
                "scientific_name": "Juglans regia",
                "category": "nuts_seeds",
                "image": "🫘",
                "description": "Brain-shaped nuts packed with alpha-linolenic acid (ALA, plant omega-3), supporting neural cell health and cognitive performance.",
                "glycemic_index": 15,
                "water_content": 4.0,
                "antioxidant_score": 13541,
                "best_time_to_eat": "Morning, Study session, Before sleep (supports melatonin)",
                "avoid_time": "None",
                "nutrition": {"calories": 654.0, "protein": 15.2, "carbs": 13.7, "fats": 65.2, "fiber": 6.7, "sugar": 2.6},
                "vitamins": [
                    {"name": "Vitamin B6", "amount": "0.5 mg"},
                    {"name": "Folate (B9)", "amount": "98 mcg"},
                    {"name": "Vitamin E", "amount": "0.7 mg"}
                ],
                "minerals": [
                    {"name": "Copper", "amount": "1.6 mg"},
                    {"name": "Manganese", "amount": "3.4 mg"},
                    {"name": "Magnesium", "amount": "158 mg"},
                    {"name": "Zinc", "amount": "3.1 mg"}
                ],
                "benefits": [
                    {
                        "title": "Rich in Plant Omega-3s",
                        "description": "Contains more omega-3 fat than any other tree nut, reducing inflammation and supporting optimal cardiovascular flow.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4282289/"
                    },
                    {
                        "title": "Supports Brain Function",
                        "description": "Polyphenols and polyunsaturated fats lower oxidative strain and inflammation in brain cells, reinforcing memory.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7071526/"
                    }
                ]
            },
            {
                "id": "pumpkin_seeds",
                "name": "Pumpkin Seeds",
                "scientific_name": "Cucurbita pepo",
                "category": "nuts_seeds",
                "image": "🎃",
                "description": "Flat, oval seeds that are a powerhouse of magnesium, zinc, and tryptophan, promoting muscle relaxation, testosterone health, and sleep.",
                "glycemic_index": 10,
                "water_content": 5.0,
                "antioxidant_score": 1020,
                "best_time_to_eat": "Evening, Before sleep, Study session",
                "avoid_time": "None",
                "nutrition": {"calories": 559.0, "protein": 30.2, "carbs": 10.7, "fats": 49.0, "fiber": 6.0, "sugar": 1.4},
                "vitamins": [
                    {"name": "Vitamin K", "amount": "51.4 mcg"},
                    {"name": "Folate (B9)", "amount": "58 mcg"},
                    {"name": "Vitamin B6", "amount": "0.1 mg"}
                ],
                "minerals": [
                    {"name": "Magnesium", "amount": "592 mg"},
                    {"name": "Zinc", "amount": "7.8 mg"},
                    {"name": "Iron", "amount": "8.8 mg"},
                    {"name": "Potassium", "amount": "809 mg"}
                ],
                "benefits": [
                    {
                        "title": "Relaxes Muscles & Calms Nervous System",
                        "description": "Exceedingly high in magnesium, which keeps calcium out of nerve cells, relaxing blood vessels and skeletal muscles.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5637834/"
                    },
                    {
                        "title": "Aids Quality Sleep",
                        "description": "Rich source of tryptophan, an amino acid that converts into serotonin and then melatonin, the sleep-regulating hormone.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/16053539/"
                    }
                ]
            },
            {
                "id": "chia_seeds",
                "name": "Chia Seeds",
                "scientific_name": "Salvia hispanica",
                "category": "nuts_seeds",
                "image": "🫘",
                "description": "Tiny black seeds that expand in water to form a gel, delivering a high concentration of soluble fiber, calcium, and omega-3 fatty acids.",
                "glycemic_index": 10,
                "water_content": 5.8,
                "antioxidant_score": 980,
                "best_time_to_eat": "Morning (soaked), Afternoon, Weight loss window",
                "avoid_time": "Late night (soaking/water intake can lead to bathroom visits)",
                "nutrition": {"calories": 486.0, "protein": 16.5, "carbs": 42.1, "fats": 30.7, "fiber": 34.4, "sugar": 0.0},
                "vitamins": [
                    {"name": "Vitamin A", "amount": "54 IU"},
                    {"name": "Vitamin C", "amount": "1.6 mg"},
                    {"name": "Niacin (B3)", "amount": "8.8 mg"}
                ],
                "minerals": [
                    {"name": "Calcium", "amount": "631 mg"},
                    {"name": "Iron", "amount": "7.7 mg"},
                    {"name": "Magnesium", "amount": "335 mg"},
                    {"name": "Phosphorus", "amount": "860 mg"}
                ],
                "benefits": [
                    {
                        "title": "Promotes Satiety & Weight Loss",
                        "description": "Soluble fiber absorbs up to 12 times its weight in water, expanding in the stomach to delay digestion and prolong fullness.",
                        "evidence_links": "https://pubmed.ncbi.nlm.nih.gov/20045837/"
                    },
                    {
                        "title": "Enhances Bone Density",
                        "description": "Extremely high in calcium, phosphorus, and magnesium, exceeding the mineral density of dairy products gram-for-gram.",
                        "evidence_links": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4926888/"
                    }
                ]
            }
        ]

        # Seed data to tables
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
            db.flush()  # assign PK for relations

            # Add nutrition
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

            # Add vitamins
            for vit in food_item["vitamins"]:
                db_vit = models.Vitamin(
                    food_id=db_food.id,
                    name=vit["name"],
                    amount=vit["amount"]
                )
                db.add(db_vit)

            # Add minerals
            for minl in food_item["minerals"]:
                db_minl = models.Mineral(
                    food_id=db_food.id,
                    name=minl["name"],
                    amount=minl["amount"]
                )
                db.add(db_minl)

            # Add benefits
            for ben in food_item["benefits"]:
                db_ben = models.Benefit(
                    food_id=db_food.id,
                    title=ben["title"],
                    description=ben["description"],
                    evidence_links=ben["evidence_links"]
                )
                db.add(db_ben)

        db.commit()
        print(f"Successfully seeded database with {len(foods_data)} food entries.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
