"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Brain,
  Moon,
  Sparkles,
  Zap,
  ChevronRight,
  Sun,
  CloudLightning,
  AlertCircle
} from "lucide-react";
import { getCombinations, Synergy, Food } from "@/lib/api";

const GOAL_SHORTCUTS = [
  { name: "Weight Loss", icon: Flame, desc: "Satiety, fiber, and low calories", color: "from-orange-500 to-amber-500", path: "/recommendations?goal=Weight%20Loss" },
  { name: "Muscle Gain", icon: Zap, desc: "High protein and energy replenishment", color: "from-red-500 to-orange-500", path: "/recommendations?goal=Muscle%20Gain" },
  { name: "Focus & Clarity", icon: Brain, desc: "Brain-health antioxidants and lipids", color: "from-blue-500 to-indigo-500", path: "/recommendations?goal=Focus" },
  { name: "Better Sleep", icon: Moon, desc: "Serotonin, melatonin, and magnesium", color: "from-violet-500 to-fuchsia-500", path: "/recommendations?goal=Sleep" },
];

const SEASONS = [
  { name: "Summer", icon: Sun, months: [3, 4, 5, 6, 7], desc: "Hydration and temperature cooling", items: ["Watermelon", "Cucumber"] },
  { name: "Monsoon", icon: CloudLightning, months: [8, 9, 10], desc: "Antivirals and microbial resistance", items: ["Ginger", "Garlic", "Turmeric"] },
  { name: "Winter", icon: Moon, months: [11, 0, 1, 2], desc: "Complex carbs and warming spices", items: ["Carrot", "Beetroot", "Sweet Potato", "Dates"] }
];

const TIMING_SEGMENTS = [
  { name: "Morning (06 - 10 AM)", hours: [6, 7, 8, 9], foods: "🍌 Banana, 🍊 Orange, Soaked Almonds", benefit: "Restores liver glycogen, boosts metabolic activation" },
  { name: "Mid-Morning (10 - 12 PM)", hours: [10, 11], foods: "🍎 Apple, 🫘 Chia Seeds", benefit: "High fiber locks in morning focus, staves off pre-lunch hunger" },
  { name: "Lunch (12 - 03 PM)", hours: [12, 13, 14], foods: "🥬 Spinach, 🟤 Beetroot, 🍠 Sweet Potato", benefit: "Iron oxygenation, nitrites build stamina and vascular flow" },
  { name: "Evening (03 - 06 PM)", hours: [15, 16, 17], foods: "🍵 Green Tea, 🫘 Walnuts, Soaked Almonds", benefit: "Brain fats maintain productivity, prevents metabolic crash" },
  { name: "Dinner (06 - 09 PM)", hours: [18, 19, 20], foods: "🥦 Broccoli, Warm Vegetable Soup", benefit: "Cellular renewal, low sugar stabilizes nighttime insulin" },
  { name: "Pre-Sleep (09 PM - 06 AM)", hours: [21, 22, 23, 0, 1, 2, 3, 4, 5], foods: "🥝 Kiwi, 🎃 Pumpkin Seeds, 🫘 Walnuts", benefit: "Tryptophan, melatonin, and muscle relaxation support" }
];

export default function Dashboard() {
  const [currentHour, setCurrentHour] = useState<number>(8);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // Default to June (Summer)
  const [combinations, setCombinations] = useState<Synergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const d = new Date();
    setCurrentHour(d.getHours());
    setCurrentMonth(d.getMonth());

    async function loadCombinations() {
      try {
        const data = await getCombinations();
        setCombinations(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch synergistic pairings. Ensure the backend server is running.");
      } finally {
        setLoading(false);
      }
    }
    loadCombinations();
  }, []);

  const getActiveSeason = () => {
    return SEASONS.find(s => s.months.includes(currentMonth)) || SEASONS[0];
  };

  const activeSeason = getActiveSeason();

  const isSegmentActive = (hours: number[]) => {
    return hours.includes(currentHour);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600/90 via-emerald-800/80 to-zinc-950 p-8 md:p-12 text-white shadow-lg border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4.5 h-4.5" />
            Circadian Circuity Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-sans">
            Align Your Nutrition with Time
          </h1>
          <p className="text-zinc-200 text-sm md:text-base leading-relaxed">
            ChronoNutrition translates scientific research on circadian biology into a simple guideline: 
            <strong> when</strong> you eat is just as important as <strong>what</strong> you eat. 
            Discover natural food combinations and timing strategies to maximize your biological efficiency.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/encyclopedia"
              className="px-6 py-3 bg-white text-zinc-950 rounded-xl text-sm font-bold shadow-md hover:bg-zinc-100 transition-colors"
            >
              Browse Superfoods
            </Link>
            <Link
              href="/chat"
              className="px-6 py-3 bg-white/10 text-white rounded-xl text-sm font-bold border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all"
            >
              Ask AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Backend Status Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Backend Connection Issue</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
          </div>
        </div>
      )}

      {/* Circadian Timing Carousel */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold font-sans flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          circadian timing guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIMING_SEGMENTS.map((seg, idx) => {
            const isActive = isSegmentActive(seg.hours);
            return (
              <div
                key={idx}
                className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-500/5 dark:bg-emerald-500/[0.03] border-emerald-500 shadow-emerald-500/5 dark:shadow-emerald-500/[0.02] shadow-md"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {isActive && (
                  <span className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
                <h3 className="font-bold text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {seg.name}
                </h3>
                <div className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {seg.foods}
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {seg.benefit}
                </p>
                {isActive && (
                  <span className="mt-4 inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    Current Active Phase
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Goal shortcuts & Seasonal recommendation grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goal Shortcuts */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold font-sans flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Personal Health Goals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GOAL_SHORTCUTS.map((goal, idx) => {
              const Icon = goal.icon;
              return (
                <Link
                  key={idx}
                  href={goal.path}
                  className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-4 font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    {goal.name}
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                    {goal.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Seasonal Recommendation */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold font-sans flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Seasonal Guide
          </h2>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/[0.02] dark:to-purple-500/[0.02] border border-indigo-500/10 dark:border-indigo-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <activeSeason.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {activeSeason.name} Window
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeSeason.desc}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Recommended Foods</h4>
              <div className="flex flex-wrap gap-2">
                {activeSeason.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              *The platform auto-detects the season based on your system clock month to suggest temperature-synergized foods.
            </p>
          </div>
        </section>
      </div>

      {/* Synergistic Highlight Cards */}
      {!loading && combinations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold font-sans flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            Synergistic Food Pairings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {combinations.map((syn, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {syn.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {syn.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <div className="flex items-center -space-x-2">
                    <span className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-white dark:border-zinc-900 flex items-center justify-center text-lg">
                      {syn.food_a.image}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-white dark:border-zinc-900 flex items-center justify-center text-lg">
                      {syn.food_b.image}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                    Pairing: {syn.food_a.name} + {syn.food_b.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
