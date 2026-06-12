"use client";

import React, { useState } from "react";
import { Loader2, ShieldAlert, Sparkles, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { analyzeDeficiencies, DeficiencyResult, Food } from "@/lib/api";
import Link from "next/link";

const SYMPTOMS = [
  { id: "fatigue", label: "Fatigue & Low Energy", desc: "Feeling tired throughout the day, muscle fatigue" },
  { id: "hair_loss", label: "Hair Loss / Poor Texture", desc: "Excessive shedding, brittle hair" },
  { id: "muscle_cramps", label: "Muscle Cramps & Spasms", desc: "Frequent calf cramps, involuntary spasms" },
  { id: "dry_skin", label: "Dry or Peeling Skin", desc: "Lacking skin hydration, epidermal dryness" },
  { id: "frequent_illness", label: "Frequent Illness / Colds", desc: "Sluggish immune system, catching colds easily" },
  { id: "weakness", label: "General Muscle Weakness", desc: "Reduced physical strength, recovery lag" },
];

export default function Deficiencies() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [results, setResults] = useState<DeficiencyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckboxChange = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const data = await analyzeDeficiencies(selectedSymptoms.join(","));
      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Failed to run analysis. Check if backend is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
          Nutrient Deficiency Analyser
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Select physical or fatigue symptoms to map biological deficiency patterns and get targeted nutritional recommendations.
        </p>
      </section>

      {/* Symptom Checklist Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-2xl space-y-6">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Select symptoms you are experiencing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SYMPTOMS.map((sym) => {
                const isChecked = selectedSymptoms.includes(sym.id);
                return (
                  <label
                    key={sym.id}
                    className={`cursor-pointer p-4 rounded-xl border flex gap-3 transition-all duration-200 ${
                      isChecked
                        ? "bg-emerald-500/5 dark:bg-emerald-500/[0.02] border-emerald-500"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-150 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(sym.id)}
                      className="mt-1 accent-emerald-500 shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{sym.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{sym.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || selectedSymptoms.length === 0}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Cellular Markers...
                </span>
              ) : (
                "Run Biomarker Analysis"
              )}
            </button>
          </div>

          {/* Medical Disclaimer Complying with safety */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Important Medical Notice:</span> ChronoNutrition insights are based on nutritional database relations and circadian timing science. These analyses represent educational estimates and are not intended as primary medical diagnostics or therapies. Always consult with a registered physician or healthcare practitioner for specific clinical conditions.
            </div>
          </div>
        </div>

        {/* Informational Sidebar */}
        <div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/[0.02] dark:to-purple-500/[0.02] border border-indigo-500/10 dark:border-indigo-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Scientific Mapping
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Circadian biology and symptom mapping allow the system to identify potential nutritional gaps. Instead of prescribing synthetic vitamins, ChronoNutrition focuses on whole-food bio-availability (e.g. non-heme iron paired with ascorbic acid for high intestinal absorption).
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          {error}
        </div>
      )}

      {results && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold font-sans flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Mapping Insights & Recommendations
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Deficiencies Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              {/* Core summary cards */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estimated Nutritional Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {results.likely_deficiencies.map((def, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20"
                    >
                      {def}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explanations */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Symptomatic Explanations</h3>
                {results.summaries.map((sum, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        {sum.symptom}
                      </h4>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Triggers: {sum.likely_deficiencies.join(", ")}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {sum.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Targeted Superfoods */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Targeted Corrective Foods</h3>
              <div className="space-y-3">
                {results.recommended_foods.map((food) => (
                  <div
                    key={food.id}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{food.image}</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{food.name}</div>
                        <div className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">Best: {food.best_time_to_eat.split(", ")[0]}</div>
                      </div>
                    </div>
                    <Link
                      href={`/encyclopedia?search=${food.name}`}
                      className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 hover:underline shrink-0"
                    >
                      Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
