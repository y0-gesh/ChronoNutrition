const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface Food {
  id: string;
  name: string;
  scientific_name: string;
  category: string;
  image: string;
  description: string;
  glycemic_index: number;
  water_content: number;
  antioxidant_score: number;
  best_time_to_eat: string;
  avoid_time: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
}

export interface Vitamin {
  name: string;
  amount: string;
}

export interface Mineral {
  name: string;
  amount: string;
}

export interface Benefit {
  title: string;
  description: string;
  evidence_links: string;
}

export interface FoodDetail extends Food {
  nutrition?: Nutrition;
  vitamins: Vitamin[];
  minerals: Mineral[];
  benefits: Benefit[];
}

export interface Recommendation {
  food: Food;
  score: number;
  reasons: string[];
  quantity: string;
  best_time: string;
}

export interface Synergy {
  title: string;
  description: string;
  rating: number;
  food_a: Food;
  food_b: Food;
}

export interface SymptomSummary {
  symptom: string;
  likely_deficiencies: string[];
  reasoning: string;
}

export interface DeficiencyResult {
  symptoms_analyzed: string[];
  likely_deficiencies: string[];
  summaries: SymptomSummary[];
  recommended_foods: Food[];
  medical_disclaimer: string;
}

export interface PlannerItem {
  time: string;
  meal: string;
  quantity: string;
  benefit: string;
  food: Food;
}

export interface PlannerResponse {
  goal: string;
  age: number;
  gender: string;
  activity_level: string;
  schedule: PlannerItem[];
  macros_estimate: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface ChatResponse {
  reply: string;
  recommended_foods: Food[];
}

// Fetch all foods
export async function getFoods(category?: string, search?: string): Promise<Food[]> {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  const res = await fetch(`${API_BASE}/foods?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch foods");
  const json = await res.json();
  return json.data;
}

// Fetch food detail
export async function getFoodDetail(id: string): Promise<FoodDetail> {
  const res = await fetch(`${API_BASE}/foods/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch food details");
  const json = await res.json();
  return json.data;
}

// Fetch recommendations based on goal
export async function getRecommendations(goal: string): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE}/recommendations?goal=${encodeURIComponent(goal)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  const json = await res.json();
  return json.data;
}

// Fetch deficiencies from symptoms
export async function analyzeDeficiencies(symptoms: string): Promise<DeficiencyResult> {
  const res = await fetch(`${API_BASE}/deficiencies?symptoms=${encodeURIComponent(symptoms)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to analyze deficiencies");
  const json = await res.json();
  const data = json.data;
  return {
    symptoms_analyzed: data.symptoms_analyzed,
    likely_deficiencies: data.possible_nutritional_factors_associated_with_symptoms || [],
    summaries: (data.summaries || []).map((s: any) => ({
      symptom: s.symptom,
      likely_deficiencies: s.possible_nutritional_factors_associated_with_symptoms || [],
      reasoning: s.reasoning
    })),
    recommended_foods: data.recommended_foods || [],
    medical_disclaimer: data.medical_disclaimer
  };
}

// Fetch synergistic combinations
export async function getCombinations(): Promise<Synergy[]> {
  const res = await fetch(`${API_BASE}/combinations`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch combinations");
  const json = await res.json();
  return json.data;
}

// Generate planner
export async function getPlanner(
  goal: string,
  activity: string,
  age: number,
  gender: string
): Promise<PlannerResponse> {
  const params = new URLSearchParams({ goal, activity, age: age.toString(), gender });
  const res = await fetch(`${API_BASE}/planner?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to generate planner");
  const json = await res.json();
  return json.data;
}

// Send chat message
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to send chat message");
  const json = await res.json();
  return json.data;
}
