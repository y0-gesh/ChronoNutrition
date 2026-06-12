"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Target, Heart, Award, ArrowRight, ShieldAlert } from "lucide-react";
import { getRecommendations, Recommendation } from "@/lib/api";

const GOALS = [
  { category: "Fitness", items: ["Weight Loss", "Muscle Gain"] },
  { category: "Lifestyle", items: ["Sleep", "Focus"] },
  { category: "Health", items: ["Immunity", "Heart Health", "Digestion", "Skin Health"] },
];

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialGoal = searchParams.get("goal") || "Weight Loss";

  const [activeGoal, setActiveGoal] = useState(initialGoal);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync state if query param changes
  useEffect(() => {
    const qGoal = searchParams.get("goal");
    if (qGoal && qGoal !== activeGoal) {
      setActiveGoal(qGoal);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      setError("");
      try {
        const data = await getRecommendations(activeGoal);
        setRecommendations(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recommendations. Verify backend status.");
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, [activeGoal]);

  const handleGoalSelect = (goal: string) => {
    setActiveGoal(goal);
    router.push(`/recommendations?goal=${encodeURIComponent(goal)}`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
          Goal-Based Recommendations
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Select your target physical or cognitive goal to generate a ranked recommendation of natural foods, containing detailed dosage quantities and circadian schedules.
        </p>
      </section>

      {/* Goal Select Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GOALS.map((cat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 space-y-3"
          >
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              {cat.category === "Fitness" && <Target className="w-3.5 h-3.5 text-orange-500" />}
              {cat.category === "Lifestyle" && <Award className="w-3.5 h-3.5 text-indigo-500" />}
              {cat.category === "Health" && <Heart className="w-3.5 h-3.5 text-emerald-500" />}
              {cat.category}
            </h3>
            <div className="flex flex-col gap-2">
              {cat.items.map((item) => (
                <button
                  key={item}
                  onClick={() => handleGoalSelect(item)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    activeGoal === item
                      ? "bg-emerald-500/10 dark:bg-emerald-500/[0.05] border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-150 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-800 hover:text-zinc-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations Results list */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-sans flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          top recommendations for {activeGoal}
        </h2>

        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 flex flex-col items-center">
            <ShieldAlert className="w-8 h-8 text-amber-500 mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500">
            <p className="font-medium">No active recommendations found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div
                key={rec.food.id}
                className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col md:flex-row justify-between gap-6"
              >
                {/* Visual Rank Tag */}
                <div className="absolute top-0 left-0 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-br-xl text-xs font-black text-zinc-400">
                  #{index + 1}
                </div>

                <div className="flex-1 space-y-4 pl-4 md:pl-0">
                  <div className="flex gap-4 items-center mt-2 md:mt-0">
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-2xl">
                      {rec.food.image}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {rec.food.name}
                      </h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                        {rec.food.scientific_name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mechanistic Rationale</h4>
                    <ul className="space-y-1.5">
                      {rec.reasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Score and Timing summary cards */}
                <div className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-950 p-5 rounded-xl border border-zinc-150 dark:border-zinc-900 flex flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                        <span>Relevance Match</span>
                        <span>{rec.score * 10}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${rec.score * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Dosage</div>
                        <div className="font-bold text-zinc-800 dark:text-zinc-200">{rec.quantity}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Best Time</div>
                        <div className="font-bold text-zinc-800 dark:text-zinc-200">{rec.best_time}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-zinc-200/50 dark:border-zinc-800 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Compare Facts</span>
                    <Link
                      href={`/comparison?add=${rec.food.id}`}
                      className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:underline"
                    >
                      Add to Board <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Recommendations() {
  return (
    <Suspense fallback={
      <div className="h-60 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  );
}
