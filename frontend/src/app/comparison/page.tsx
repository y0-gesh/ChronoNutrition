"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  Scale,
  BarChart2,
  ShieldAlert,
} from "lucide-react";
import { getFoods, getFoodDetail, Food, FoodDetail } from "@/lib/api";

function ComparisonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [comparedFoods, setComparedFoods] = useState<FoodDetail[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load from session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("comparedFoods");
      if (stored) {
        try {
          setComparedFoods(JSON.parse(stored));
        } catch (e) {
          console.error(
            "Failed to parse compared foods from session storage",
            e,
          );
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to session storage when comparedFoods changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      sessionStorage.setItem("comparedFoods", JSON.stringify(comparedFoods));
    }
  }, [comparedFoods, isLoaded]);

  // Load basic foods list
  useEffect(() => {
    async function loadBasicFoods() {
      try {
        const data = await getFoods();
        setAllFoods(data);
      } catch (err) {
        console.error("Failed to load basic foods list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBasicFoods();
  }, []);

  // Parse "?add=..." from URL search params
  useEffect(() => {
    const addId = searchParams.get("add");
    if (!addId || allFoods.length === 0 || !isLoaded) return;

    // Check if already compared
    if (comparedFoods.some((f) => f.id === addId)) {
      // Clear param to prevent repeated check
      const params = new URLSearchParams(searchParams);
      params.delete("add");
      router.replace(`/comparison?${params.toString()}`);
      return;
    }

    if (comparedFoods.length >= 4) {
      alert("You can compare up to 4 foods at once.");
      const params = new URLSearchParams(searchParams);
      params.delete("add");
      router.replace(`/comparison?${params.toString()}`);
      return;
    }

    // Load full details and add to board
    async function loadAndAdd() {
      try {
        const detail = await getFoodDetail(addId!);
        setComparedFoods((prev) => [...prev, detail]);
        // Clear param to prevent repeated add
        const params = new URLSearchParams(searchParams);
        params.delete("add");
        router.replace(`/comparison?${params.toString()}`);
      } catch (err) {
        console.error(err);
      }
    }
    loadAndAdd();
  }, [searchParams, allFoods, isLoaded, comparedFoods]);

  const addFoodToCompare = async (id: string) => {
    if (comparedFoods.some((f) => f.id === id)) {
      alert("This food is already on the comparison board.");
      setDropdownOpen(false);
      return;
    }
    if (comparedFoods.length >= 4) {
      alert("You can compare up to 4 foods at once.");
      setDropdownOpen(false);
      return;
    }

    try {
      const detail = await getFoodDetail(id);
      setComparedFoods((prev) => [...prev, detail]);
    } catch (err) {
      console.error(err);
      alert("Failed to load details for comparison.");
    } finally {
      setDropdownOpen(false);
    }
  };

  const removeFood = (id: string) => {
    setComparedFoods((prev) => prev.filter((f) => f.id !== id));
  };

  const getUnselectedFoods = () => {
    return allFoods.filter((f) => !comparedFoods.some((cf) => cf.id === f.id));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <section className="space-y-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <Scale className="w-8 h-8 text-emerald-500 shrink-0" />
            Food Comparison Board
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Add up to 4 superfoods side-by-side to review nutritional balances,
            micronutrient densities, and optimal timing windows.
          </p>
        </div>

        {/* Add Food Dropdown selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={loading || comparedFoods.length >= 4}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-600 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add Food to Compare
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-2 divide-y divide-zinc-150 dark:divide-zinc-800">
              {getUnselectedFoods().length === 0 ? (
                <div className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                  No more foods to add.
                </div>
              ) : (
                getUnselectedFoods().map((food) => (
                  <button
                    key={food.id}
                    onClick={() => addFoodToCompare(food.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2 text-xs font-semibold transition-colors"
                  >
                    <span className="text-base">{food.image}</span>
                    <div>
                      <div>{food.name}</div>
                      <div className="text-[9px] text-zinc-400 font-semibold uppercase">
                        {food.category.replace("_", " ")}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Comparison Grid Board */}
      {comparedFoods.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 flex flex-col items-center justify-center space-y-4">
          <Scale className="w-12 h-12 text-zinc-450 dark:text-zinc-700 animate-pulse" />
          <div>
            <p className="font-semibold text-base">
              Your comparison board is empty
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Select superfoods from the top dropdown or click compare on
              recommendation pages.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
            {comparedFoods.map((food) => (
              <div
                key={food.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{food.image}</span>
                    <div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-tight">
                        {food.name}
                      </h3>
                      <p className="text-[10px] text-zinc-400 italic font-medium mt-0.5">
                        {food.scientific_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFood(food.id)}
                    className="p-1.5 rounded bg-zinc-100 hover:bg-rose-500/10 hover:text-rose-500 dark:bg-zinc-800 dark:hover:bg-rose-500/20 text-zinc-400 transition-colors"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs space-y-3 pt-2">
                  {/* Category */}
                  <div className="flex justify-between py-2 items-center">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      Category
                    </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {food.category.replace("_", " & ").toUpperCase()}
                    </span>
                  </div>

                  {/* Calories */}
                  <div className="flex justify-between py-2 items-center">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      Calories
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {food.nutrition?.calories} kcal
                      </span>
                      <span className="text-[9px] text-zinc-450 block">
                        per 100g
                      </span>
                    </div>
                  </div>

                  {/* GI */}
                  <div className="flex justify-between py-2 items-center">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      Glycemic Index
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        food.glycemic_index <= 15
                          ? "bg-emerald-500/10 text-emerald-500"
                          : food.glycemic_index <= 55
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {food.glycemic_index} GI
                    </span>
                  </div>

                  {/* Water Content */}
                  <div className="flex justify-between py-2 items-center">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      Water Content
                    </span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      {food.water_content}%
                    </span>
                  </div>

                  {/* Macros */}
                  <div className="py-2 space-y-2">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">
                      Macronutrients (per 100g)
                    </span>
                    {[
                      { key: "protein", label: "Protein", color: "bg-emerald-500" },
                      { key: "carbs", label: "Carbs", color: "bg-orange-500" },
                      { key: "fats", label: "Fats", color: "bg-yellow-500" },
                      { key: "fiber", label: "Fiber", color: "bg-blue-500" },
                    ].map((macro) => {
                      const value = food.nutrition
                        ? (food.nutrition[
                            macro.key as keyof typeof food.nutrition
                          ] as number)
                        : 0;
                      return (
                        <div key={macro.key} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-zinc-550 dark:text-zinc-400">
                            <span>{macro.label}</span>
                            <span>{value}g</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${macro.color}`}
                              style={{
                                width: `${Math.min((value / 50) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Circadian Time */}
                  <div className="flex justify-between py-2 items-center">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                      Circadian Time
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right max-w-[150px] leading-snug">
                      {food.best_time_to_eat}
                    </span>
                  </div>

                  {/* Vitamins & Minerals */}
                  <div className="py-2 space-y-2">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">
                      Vitamins & Minerals
                    </span>
                    <div className="grid grid-cols-1 gap-2 text-[10px]">
                      {food.vitamins.length > 0 && (
                        <div className="space-y-1">
                          <div className="font-semibold text-zinc-400 text-[8px] uppercase">
                            Vitamins
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            {food.vitamins.map((vit, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-zinc-500 truncate max-w-[80px]">
                                  {vit.name}
                                </span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                                  {vit.amount}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {food.minerals.length > 0 && (
                        <div className="space-y-1">
                          <div className="font-semibold text-zinc-400 text-[8px] uppercase">
                            Minerals
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            {food.minerals.map((min, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-zinc-500 truncate max-w-[80px]">
                                  {min.name}
                                </span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                                  {min.amount}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block w-full max-w-full overflow-x-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <table
              className={`w-full ${
                comparedFoods.length <= 1
                  ? "min-w-[400px]"
                  : comparedFoods.length === 2
                  ? "min-w-[600px]"
                  : comparedFoods.length === 3
                  ? "min-w-[800px]"
                  : "min-w-[1000px]"
              } border-collapse text-left text-xs font-medium`}
            >
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20">
                  <th className="p-4 w-48 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                    Nutritional Specs
                  </th>
                  {comparedFoods.map((food) => (
                    <th
                      key={food.id}
                      className="p-4 w-60 border-l border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{food.image}</span>
                          <div>
                            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                              {food.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 italic font-medium">
                              {food.scientific_name}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFood(food.id)}
                          className="p-1 rounded bg-zinc-100 hover:bg-rose-500/10 hover:text-rose-500 dark:bg-zinc-800 dark:hover:bg-rose-500/20 text-zinc-400 transition-colors"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/85">
                {/* Category */}
                <tr>
                  <td className="p-4 font-bold text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50/20 dark:bg-zinc-950/10">
                    Category
                  </td>
                  {comparedFoods.map((food) => (
                    <td
                      key={food.id}
                      className="p-4 border-l border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      {food.category.replace("_", " & ").toUpperCase()}
                    </td>
                  ))}
                </tr>

                {/* Energy Calories */}
                <tr>
                  <td className="p-4 font-bold text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50/20 dark:bg-zinc-950/10">
                    Calories
                  </td>
                  {comparedFoods.map((food) => (
                    <td
                      key={food.id}
                      className="p-4 border-l border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="font-bold text-sm text-zinc-800 dark:text-zinc-250">
                        {food.nutrition?.calories} kcal
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        per 100g serving
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Glycemic Index */}
                <tr>
                  <td className="p-4 font-bold text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50/20 dark:bg-zinc-950/10">
                    Glycemic Index
                  </td>
                  {comparedFoods.map((food) => (
                    <td
                      key={food.id}
                      className="p-4 border-l border-zinc-200 dark:border-zinc-800"
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-bold ${
                          food.glycemic_index <= 15
                            ? "bg-emerald-500/10 text-emerald-500"
                            : food.glycemic_index <= 55
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {food.glycemic_index} GI
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Water Content */}
                <tr>
                  <td className="p-4 font-bold text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50/20 dark:bg-zinc-950/10">
                    Water Content
                  </td>
                  {comparedFoods.map((food) => (
                    <td
                      key={food.id}
                      className="p-4 border-l border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300"
                    >
                      {food.water_content}%
                    </td>
                  ))}
                </tr>

                {/* Macros Breakdown Bars */}
                {[
                  { key: "protein", label: "Protein", color: "bg-emerald-500" },
                  {
                    key: "carbs",
                    label: "Carbohydrates",
                    color: "bg-orange-500",
                  },
                  { key: "fats", label: "Fats", color: "bg-yellow-500" },
                  {
                    key: "fiber",
                    label: "Dietary Fiber",
                    color: "bg-blue-500",
                  },
                  { key: "sugar", label: "Sugars", color: "bg-pink-500" },
                ].map((macro) => (
                  <tr key={macro.key}>
                    <td className="p-4 font-bold text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50/20 dark:bg-zinc-950/10">
                      {macro.label}
                    </td>
                    {comparedFoods.map((food) => {
                      const value = food.nutrition
                        ? (food.nutrition[
                            macro.key as keyof typeof food.nutrition
                          ] as number)
                        : 0;
                      return (
                        <td
                          key={food.id}
                          className="p-4 border-l border-zinc-200 dark:border-zinc-800"
                        >
                          <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                            <span>{value}g</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${macro.color}`}
                              style={{
                                width: `${Math.min((value / 50) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Vitamins */}
                <tr>
                  <td className="p-4 font-bold text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50/20 dark:bg-zinc-950/10">
                    Vitamins
                  </td>
                  {comparedFoods.map((food) => (
                    <td
                      key={food.id}
                      className="p-4 border-l border-zinc-200 dark:border-zinc-800 space-y-1"
                    >
                      {food.vitamins.map((vit, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center gap-2 font-semibold"
                        >
                          <span className="text-zinc-500">{vit.name}</span>
                          <span className="text-zinc-700 dark:text-zinc-300 shrink-0">
                            {vit.amount}
                          </span>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>

                {/* Minerals */}
                <tr>
                  <td className="p-4 font-bold text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50/20 dark:bg-zinc-950/10">
                    Minerals
                  </td>
                  {comparedFoods.map((food) => (
                    <td
                      key={food.id}
                      className="p-4 border-l border-zinc-200 dark:border-zinc-800 space-y-1"
                    >
                      {food.minerals.map((min, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center gap-2 font-semibold"
                        >
                          <span className="text-zinc-500">{min.name}</span>
                          <span className="text-zinc-700 dark:text-zinc-300 shrink-0">
                            {min.amount}
                          </span>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>

                {/* Circadian Optimal */}
                <tr>
                  <td className="p-4 font-bold text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50/20 dark:bg-zinc-950/10">
                    Circadian Time
                  </td>
                  {comparedFoods.map((food) => (
                    <td
                      key={food.id}
                      className="p-4 border-l border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 leading-normal"
                    >
                      {food.best_time_to_eat}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function Comparison() {
  return (
    <Suspense
      fallback={
        <div className="h-60 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <ComparisonContent />
    </Suspense>
  );
}
