"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, X, Activity, Droplet, Star, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { getFoods, getFoodDetail, Food, FoodDetail } from "@/lib/api";

const CATEGORIES = [
  { id: "all", name: "All Foods" },
  { id: "fruits", name: "Fruits" },
  { id: "vegetables", name: "Vegetables" },
  { id: "herbs_spices", name: "Herbs & Spices" },
  { id: "nuts_seeds", name: "Nuts & Seeds" },
];

export default function Encyclopedia() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");

  // Load foods when category or search changes
  useEffect(() => {
    async function loadFoods() {
      setLoading(true);
      setError("");
      try {
        const cat = activeCategory === "all" ? undefined : activeCategory;
        const query = searchQuery.trim() || undefined;
        const data = await getFoods(cat, query);
        setFoods(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch foods. Ensure the FastAPI backend is running.");
      } finally {
        setLoading(false);
      }
    }

    const delayDebounceFn = setTimeout(() => {
      loadFoods();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery]);

  // Load single food detail when selected
  useEffect(() => {
    if (!selectedFoodId) {
      setSelectedFood(null);
      return;
    }

    async function loadDetail() {
      setModalLoading(true);
      try {
        const data = await getFoodDetail(selectedFoodId!);
        setSelectedFood(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load food details.");
        setSelectedFoodId(null);
      } finally {
        setModalLoading(false);
      }
    }
    loadDetail();
  }, [selectedFoodId]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Title */}
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
          Food Encyclopedia
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Browse our structured nutrition dataset, detailing glycaemic loads, hydration percentages, circadian optimal times, and verified medical benefits.
        </p>
      </section>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-200/50 dark:bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search foods, families..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="h-60 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500">
          <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500">
          <p className="font-medium">No matching foods found.</p>
          <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {foods.map((food) => (
            <div
              key={food.id}
              onClick={() => setSelectedFoodId(food.id)}
              className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {food.image}
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
                    {food.name}
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                    {food.scientific_name}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {food.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  GI: {food.glycemic_index}
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  Water: {food.water_content}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedFoodId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedFoodId(null)}
          />
          <aside className="relative w-full max-w-2xl h-full bg-white dark:bg-zinc-950 shadow-2xl flex flex-col z-10 border-l border-zinc-200 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800/80">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Superfood Profile</span>
              <button
                onClick={() => setSelectedFoodId(null)}
                className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {modalLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : selectedFood ? (
                <>
                  {/* Basic Info */}
                  <div className="flex gap-5 items-start">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-4xl">
                      {selectedFood.image}
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                        {selectedFood.name}
                      </h2>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                        {selectedFood.scientific_name}
                      </p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                        {selectedFood.category.replace("_", " & ")}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {selectedFood.description}
                  </p>

                  {/* Timing Intelligence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/[0.02] border border-emerald-500/10 dark:border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        <Clock className="w-4 h-4" />
                        Best Time To Consume
                      </div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {selectedFood.best_time_to_eat}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-500/[0.02] border border-rose-500/10 dark:border-rose-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        Avoid Consumption
                      </div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {selectedFood.avoid_time}
                      </p>
                    </div>
                  </div>

                  {/* Macro breakdown */}
                  {selectedFood.nutrition && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nutritional facts (per 100g)</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {[
                          { label: "Calories", value: `${selectedFood.nutrition.calories} kcal` },
                          { label: "Protein", value: `${selectedFood.nutrition.protein}g` },
                          { label: "Carbs", value: `${selectedFood.nutrition.carbs}g` },
                          { label: "Fats", value: `${selectedFood.nutrition.fats}g` },
                          { label: "Fiber", value: `${selectedFood.nutrition.fiber}g` },
                          { label: "Sugar", value: `${selectedFood.nutrition.sugar}g` },
                        ].map((nut, idx) => (
                          <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl text-center">
                            <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{nut.label}</div>
                            <div className="text-sm font-bold mt-1">{nut.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vitamins & Minerals grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Vitamins Profile</h3>
                      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl divide-y divide-zinc-200/50 dark:divide-zinc-800/80">
                        {selectedFood.vitamins.map((vit, idx) => (
                          <div key={idx} className="flex justify-between p-3 text-xs font-medium">
                            <span className="text-zinc-500">{vit.name}</span>
                            <span className="font-bold">{vit.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Minerals Profile</h3>
                      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl divide-y divide-zinc-200/50 dark:divide-zinc-800/80">
                        {selectedFood.minerals.map((min, idx) => (
                          <div key={idx} className="flex justify-between p-3 text-xs font-medium">
                            <span className="text-zinc-500">{min.name}</span>
                            <span className="font-bold">{min.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scientific Benefits & Citations */}
                  {selectedFood.benefits.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        Scientific health benefits & Evidence
                      </h3>
                      <div className="space-y-4">
                        {selectedFood.benefits.map((ben, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 space-y-2"
                          >
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex justify-between items-center">
                              {ben.title}
                              {ben.evidence_links && (
                                <a
                                  href={ben.evidence_links}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-emerald-500 flex items-center gap-1 hover:underline font-bold"
                                >
                                  Evidence <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                              {ben.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
