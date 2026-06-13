"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Calendar, Clock, Sparkles, PieChart, Info, ShieldAlert, Download } from "lucide-react";
import { getPlanner, getFoods, PlannerResponse, Food } from "@/lib/api";

const GOAL_OPTIONS = [
  { id: "weight_loss", name: "Weight Loss" },
  { id: "muscle_gain", name: "Muscle Gain" },
  { id: "sleep", name: "Sleep Quality" },
  { id: "focus", name: "Cognitive Focus" },
  { id: "health", name: "General Health / Immunity" },
];

const BMI_PLANS_TEMPLATE = {
  underweight: {
    category: "Underweight",
    description: "Focuses on caloric density, muscle growth support, and nutrient-dense hydration.",
    macros: { calories: 1750.0, protein: 65.0, carbs: 230.0, fats: 60.0 },
    meals: [
      { time: "08:00 AM", meal: "Morning Fuel", food_id: "banana", quantity: "2 large bananas", benefit: "Fast digesting carbs to restore liver glycogen and fuel active muscle protein synthesis." },
      { time: "11:00 AM", meal: "Mid-Morning Snack", food_id: "dates", quantity: "4-5 organic dates", benefit: "Calorie-dense natural sugars and fibers for sustained mid-day energy uptake." },
      { time: "01:30 PM", meal: "Lunch Boost", food_id: "sweet_potato", quantity: "250g baked with olive oil", benefit: "Complex starches to rebuild glycogen stores and support healthy anabolic mass gain." },
      { time: "05:00 PM", meal: "Evening Crunch", food_id: "almonds", quantity: "50g raw/soaked", benefit: "Dense source of plant-based protein, healthy fats, and Vitamin E to protect dermal tissues." },
      { time: "08:00 PM", meal: "Dinner Recovery", food_id: "pumpkin_seeds", quantity: "40g toasted", benefit: "Rich in zinc and magnesium to support testosterone production and overnight muscle repair." }
    ]
  },
  normal: {
    category: "Normal weight",
    description: "Maintains glycemic stability, antioxidant status, and circadian rhythm synchronization.",
    macros: { calories: 1450.0, protein: 55.0, carbs: 180.0, fats: 50.0 },
    meals: [
      { time: "08:00 AM", meal: "Morning Brain Activation", food_id: "blueberries", quantity: "150g fresh", benefit: "Anthocyanins cross the blood-brain barrier to sharpen focus and neural communication." },
      { time: "11:00 AM", meal: "Mid-Morning Crunch", food_id: "apple", quantity: "1 large organic", benefit: "Pectin fibers support gut microbiome stability and prevent late-morning energy dips." },
      { time: "01:30 PM", meal: "Lunch Balance", food_id: "spinach", quantity: "150g salad with lemon", benefit: "High non-heme plant-based iron and magnesium for sustained afternoon cardiovascular stamina." },
      { time: "05:00 PM", meal: "Evening Support", food_id: "walnuts", quantity: "30g (handful)", benefit: "Omega-3 fatty acids maintain cellular rest, arterial flexibility, and brain membrane health." },
      { time: "08:00 PM", meal: "Dinner Cleanse", food_id: "broccoli", quantity: "150g steamed", benefit: "Sulforaphane boosts liver defense pathways and facilitates cellular detoxification." }
    ]
  },
  overweight: {
    category: "Overweight",
    description: "Focuses on high-satiety volume eating, natural thermogenesis, and blood sugar regulation.",
    macros: { calories: 1200.0, protein: 45.0, carbs: 140.0, fats: 35.0 },
    meals: [
      { time: "08:00 AM", meal: "Morning Metabolism", food_id: "cucumber", quantity: "200g sliced", benefit: "Low calorie density volume eating to aid weight management and cellular hydration." },
      { time: "11:00 AM", meal: "Mid-Morning Fiber", food_id: "apple", quantity: "1 medium", benefit: "Soluble prebiotic fibers prolong gastric fullness and naturally block hunger spikes." },
      { time: "01:30 PM", meal: "Lunch Thermogenesis", food_id: "ginger", quantity: "5g fresh steeped as tea", benefit: "Speeds gastric emptying and increases thermic effect of food to accelerate calorie burn." },
      { time: "05:00 PM", meal: "Evening Soluble Fiber", food_id: "chia_seeds", quantity: "1.5 tbsp soaked", benefit: "Soluble fibers expand in the stomach, providing high satiety to prevent late-day cravings." },
      { time: "08:00 PM", meal: "Dinner Fiber Boost", food_id: "broccoli", quantity: "200g steamed", benefit: "Very low glycemic load, high volume fiber, and micronutrients for evening metabolic rest." }
    ]
  },
  obese: {
    category: "Obese",
    description: "Targeted metabolic stimulation, systemic inflammation reduction, and strict caloric control.",
    macros: { calories: 1050.0, protein: 40.0, carbs: 120.0, fats: 30.0 },
    meals: [
      { time: "08:00 AM", meal: "Morning Hydration & Base", food_id: "cucumber", quantity: "250g raw slices", benefit: "Zero glycemic load hydration to trigger morning cellular clearance and metabolic kickstart." },
      { time: "11:00 AM", meal: "Mid-Morning Anti-Inflammatory", food_id: "ginger", quantity: "5g fresh slice", benefit: "Bioactive gingerols ease digestive irritation, support insulin sensitivity, and lower inflammation." },
      { time: "01:30 PM", meal: "Lunch Vasodilation", food_id: "beetroot", quantity: "150g raw/grated", benefit: "Active nitrates relax blood vessel walls, optimizing cardiac efficiency and physical movement capacity." },
      { time: "05:00 PM", meal: "Evening Inflammation Shield", food_id: "turmeric", quantity: "3g root or 1/2 tsp golden spice", benefit: "Curcumin helps suppress systemic metabolic inflammation and support fat-oxidation pathways." },
      { time: "09:00 PM", meal: "Dinner Circadian Reset", food_id: "kiwi", quantity: "2 kiwis before bed", benefit: "Direct serotonin content calms the nervous system, improving sleep onset and growth hormone release." }
    ]
  }
};

export default function Planner() {
  const [activeTab, setActiveTab] = useState<"circadian" | "bmi">("circadian");
  const [goal, setGoal] = useState("weight_loss");
  const [activity, setActivity] = useState("moderate");
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("unspecified");

  // BMI Inputs
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [bmiResult, setBmiResult] = useState<{
    bmi: number;
    category: string;
    schedule: any[];
    macros_estimate: any;
  } | null>(null);

  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [planner, setPlanner] = useState<PlannerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load all foods on mount for BMI template matching
  useEffect(() => {
    async function loadFoods() {
      try {
        const data = await getFoods();
        setAllFoods(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadFoods();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlanner(null);

    try {
      const data = await getPlanner(goal, activity, age, gender);
      setPlanner(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate planner. Ensure the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (height <= 0 || weight <= 0) return;

    const heightInMeters = height / 100;
    const bmiValue = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    let categoryKey: "underweight" | "normal" | "overweight" | "obese" = "normal";
    if (bmiValue < 18.5) {
      categoryKey = "underweight";
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      categoryKey = "normal";
    } else if (bmiValue >= 25 && bmiValue < 30) {
      categoryKey = "overweight";
    } else {
      categoryKey = "obese";
    }

    const template = BMI_PLANS_TEMPLATE[categoryKey];
    
    const schedule = template.meals.map((m) => {
      const foodItem = allFoods.find((f) => f.id === m.food_id) || {
        id: m.food_id,
        name: m.food_id.replace("_", " ").toUpperCase(),
        scientific_name: "",
        category: "",
        image: "🍏",
        description: "",
        glycemic_index: 0,
        water_content: 0,
        antioxidant_score: 0,
        best_time_to_eat: "",
        avoid_time: ""
      };
      return {
        time: m.time,
        meal: m.meal,
        quantity: m.quantity,
        benefit: m.benefit,
        food: foodItem
      };
    });

    setBmiResult({
      bmi: bmiValue,
      category: template.category,
      schedule: schedule,
      macros_estimate: template.macros
    });
  };

  const handleDownloadPDF = async () => {
    const activePlan = activeTab === "circadian" ? planner : bmiResult;
    if (!activePlan) return;

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text("ChronoNutrition Daily Diet Plan", 20, 20);

      // Title/Type of plan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      if (activeTab === "circadian") {
        doc.text(`Circadian Rhythm Plan  |  Goal: ${planner?.goal}  |  Activity: ${planner?.activity_level}`, 20, 28);
      } else {
        doc.text(`BMI Calculator Diet Plan  |  BMI: ${bmiResult?.bmi} (${bmiResult?.category})`, 20, 28);
      }

      // Date subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 34);

      // Line separator
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 38, 190, 38);

      // Macros Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(20, 43, 170, 28, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Calories Budget", 25, 49);
      doc.text("Est. Protein", 68, 49);
      doc.text("Est. Carbs", 110, 49);
      doc.text("Est. Fats", 152, 49);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`${activePlan.macros_estimate.calories} kcal`, 25, 57);
      doc.text(`${activePlan.macros_estimate.protein}g`, 68, 57);
      doc.text(`${activePlan.macros_estimate.carbs}g`, 110, 57);
      doc.text(`${activePlan.macros_estimate.fats}g`, 152, 57);

      // Timeline Schedule
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Hour-By-Hour Circadian Schedule", 20, 84);

      let currentY = 94;
      activePlan.schedule.forEach((item: any, idx: number) => {
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }

        // Draw dot
        doc.setFillColor(16, 185, 129);
        doc.circle(23, currentY + 1, 2, "F");

        // Time and Meal title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`${item.time}  -  ${item.meal}`, 28, currentY + 2);

        // Food serving details
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(16, 185, 129);
        doc.text(`Food: ${item.food.name}  (${item.quantity})`, 28, currentY + 8);

        // Benefit
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const splitBenefit = doc.splitTextToSize(item.benefit, 150);
        doc.text(splitBenefit, 28, currentY + 14);

        currentY += 14 + (splitBenefit.length * 4) + 8;
      });

      doc.save(`chrononutrition-planner-${activeTab}-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF.");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
          <Calendar className="w-8 h-8 text-emerald-500 shrink-0" />
          Daily Nutrition Planner
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Customize your profile metrics or calculate BMI to generate a spacing-intelligent, hour-by-hour superfood schedule aligned with your biological circadian rhythms.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Controls */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-2xl h-fit space-y-6">
          {/* Config Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl text-xs font-bold divide-x divide-zinc-200 dark:divide-zinc-800">
            <button
              onClick={() => setActiveTab("circadian")}
              className={`w-1/2 py-2 text-center rounded-lg transition-all cursor-pointer ${
                activeTab === "circadian"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Circadian Profile
            </button>
            <button
              onClick={() => setActiveTab("bmi")}
              className={`w-1/2 py-2 text-center rounded-lg transition-all cursor-pointer ${
                activeTab === "bmi"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              BMI Calculator
            </button>
          </div>

          {activeTab === "circadian" ? (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Configure Profile
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4 text-xs font-semibold">
                {/* Goal selector */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Target Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                  >
                    {GOAL_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Activity selector */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Activity Level</label>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="sedentary">Sedentary (desk job, minimal movement)</option>
                    <option value="moderate">Moderate (walking, gym 2-3x/week)</option>
                    <option value="active">Active (sports, high movement daily)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Age (Years)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="unspecified">Unspecified</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sequencing Spacers...
                    </>
                  ) : (
                    "Generate Circadian Plan"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                BMI Calculator
              </h2>
              <form onSubmit={handleGenerateBMI} className="space-y-4 text-xs font-semibold">
                {/* Weight input */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    min="10"
                    max="400"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                {/* Height input */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Height (cm)</label>
                  <input
                    type="number"
                    min="40"
                    max="300"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Calculate & Generate Diet
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Informational Panel */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {activeTab === "circadian" ? (
            planner ? (
              <div className="space-y-6">
                {/* Macro Estimates Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Estimated Plan Macro Budget</h3>
                    </div>
                    <button
                      onClick={handleDownloadPDF}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black tracking-wide uppercase shadow-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download (PDF)
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {[
                      { label: "Total Calories", value: `${planner.macros_estimate.calories} kcal`, color: "border-indigo-500/20" },
                      { label: "Est. Protein", value: `${planner.macros_estimate.protein}g`, color: "border-emerald-500/20" },
                      { label: "Est. Carbohydrates", value: `${planner.macros_estimate.carbs}g`, color: "border-orange-500/20" },
                      { label: "Est. Fats", value: `${planner.macros_estimate.fats}g`, color: "border-yellow-500/20" },
                    ].map((mac, idx) => (
                      <div key={idx} className={`p-4 bg-zinc-50 dark:bg-zinc-950 border rounded-xl ${mac.color}`}>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{mac.label}</div>
                        <div className="text-base font-extrabold mt-1 text-zinc-850 dark:text-zinc-200">{mac.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Items */}
                <div className="space-y-6 relative border-l border-zinc-200 dark:border-zinc-800 ml-4 pl-6">
                  {planner.schedule.map((item, idx) => (
                    <div key={idx} className="relative space-y-3">
                      {/* Time indicator Dot */}
                      <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-4 border-white dark:border-zinc-950 shadow-sm shrink-0" />
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {item.time}
                        </span>
                        <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider">
                          {item.meal}
                        </span>
                      </div>

                      {/* Food schedule Card */}
                      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-2xl shrink-0">
                            {item.food.image}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.food.name}</h4>
                            <p className="text-xs text-zinc-505 dark:text-zinc-400 leading-normal">{item.benefit}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-3 sm:pt-0 sm:pl-4 space-y-1">
                          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Serving quantity</div>
                          <div className="text-xs font-bold text-zinc-805 dark:text-zinc-200">{item.quantity}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-zinc-400 animate-pulse mx-auto" />
                <div>
                  <p className="font-semibold text-base">Plan your daily spacing timeline</p>
                  <p className="text-xs text-zinc-400 mt-1">Configure your metrics on the left panel and click generate to build an hour-by-hour superfood schedule.</p>
                </div>
              </div>
            )
          ) : (
            bmiResult ? (
              <div className="space-y-6">
                {/* BMI Results header card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Calculated Metrics</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{bmiResult.bmi}</span>
                      <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">BMI Score</span>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                      Weight status: <span className={`font-extrabold ${
                        bmiResult.category === "Underweight" ? "text-amber-500" :
                        bmiResult.category === "Normal weight" ? "text-emerald-500" :
                        bmiResult.category === "Overweight" ? "text-orange-500" :
                        "text-rose-500"
                      }`}>{bmiResult.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Plan (PDF)
                  </button>
                </div>

                {/* Macro Estimates Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Estimated BMI Plan Macro Budget</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {[
                      { label: "Total Calories", value: `${bmiResult.macros_estimate.calories} kcal`, color: "border-indigo-500/20" },
                      { label: "Est. Protein", value: `${bmiResult.macros_estimate.protein}g`, color: "border-emerald-500/20" },
                      { label: "Est. Carbohydrates", value: `${bmiResult.macros_estimate.carbs}g`, color: "border-orange-500/20" },
                      { label: "Est. Fats", value: `${bmiResult.macros_estimate.fats}g`, color: "border-yellow-500/20" },
                    ].map((mac, idx) => (
                      <div key={idx} className={`p-4 bg-zinc-50 dark:bg-zinc-950 border rounded-xl ${mac.color}`}>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{mac.label}</div>
                        <div className="text-base font-extrabold mt-1 text-zinc-850 dark:text-zinc-200">{mac.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Items */}
                <div className="space-y-6 relative border-l border-zinc-200 dark:border-zinc-800 ml-4 pl-6">
                  {bmiResult.schedule.map((item, idx) => (
                    <div key={idx} className="relative space-y-3">
                      {/* Time indicator Dot */}
                      <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-4 border-white dark:border-zinc-950 shadow-sm shrink-0" />
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {item.time}
                        </span>
                        <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider">
                          {item.meal}
                        </span>
                      </div>

                      {/* Food schedule Card */}
                      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-2xl shrink-0">
                            {item.food.image}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.food.name}</h4>
                            <p className="text-xs text-zinc-505 dark:text-zinc-400 leading-normal">{item.benefit}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-3 sm:pt-0 sm:pl-4 space-y-1">
                          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Serving quantity</div>
                          <div className="text-xs font-bold text-zinc-805 dark:text-zinc-200">{item.quantity}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-zinc-400 animate-pulse mx-auto" />
                <div>
                  <p className="font-semibold text-base">Calculate BMI Diet Plan</p>
                  <p className="text-xs text-zinc-400 mt-1">Input your height and weight on the left panel to generate a customized diet plan suited to your BMI.</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
