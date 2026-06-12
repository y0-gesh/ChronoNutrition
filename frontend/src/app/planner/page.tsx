"use client";

import React, { useState } from "react";
import { Loader2, Calendar, Clock, Sparkles, PieChart, Info, ShieldAlert } from "lucide-react";
import { getPlanner, PlannerResponse } from "@/lib/api";

const GOAL_OPTIONS = [
  { id: "weight_loss", name: "Weight Loss" },
  { id: "muscle_gain", name: "Muscle Gain" },
  { id: "sleep", name: "Sleep Quality" },
  { id: "focus", name: "Cognitive Focus" },
  { id: "health", name: "General Health / Immunity" },
];

export default function Planner() {
  const [goal, setGoal] = useState("weight_loss");
  const [activity, setActivity] = useState("moderate");
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("unspecified");

  const [planner, setPlanner] = useState<PlannerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
          <Calendar className="w-8 h-8 text-emerald-500 shrink-0" />
          Daily Nutrition Planner
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Customize your profile metrics to generate a spacing-intelligent, hour-by-hour superfood schedule aligned with your biological circadian rhythms.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Controls */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-2xl h-fit space-y-6">
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
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
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
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
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
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 dark:text-zinc-200"
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
              className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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

        {/* Informational Panel */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {planner ? (
            <div className="space-y-6">
              {/* Macro Estimates Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Estimated Plan Macro Budget</h3>
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
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {item.meal}
                      </span>
                    </div>

                    {/* Food schedule Card */}
                    <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 flex items-center justify-center text-2xl shrink-0">
                          {item.food.image}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.food.name}</h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">{item.benefit}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-3 sm:pt-0 sm:pl-4 space-y-1">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Serving quantity</div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.quantity}</div>
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
          )}
        </div>
      </div>
    </div>
  );
}
