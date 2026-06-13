"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  ShieldAlert,
  Scale,
  Calendar,
  MessageSquare,
  Clock,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/encyclopedia", label: "Encyclopedia", icon: BookOpen },
  { href: "/recommendations", label: "Recommendations", icon: Target },
  { href: "/deficiencies", label: "Deficiencies", icon: ShieldAlert },
  { href: "/comparison", label: "Comparison", icon: Scale },
  { href: "/planner", label: "Daily Planner", icon: Calendar },
  { href: "/chat", label: "AI Assistant", icon: MessageSquare },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [waterCount, setWaterCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("waterCount");
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem("waterDate");
      if (storedDate === today && stored) {
        setWaterCount(parseInt(stored) || 0);
      } else {
        localStorage.setItem("waterDate", today);
        localStorage.setItem("waterCount", "0");
      }
    }
  }, []);

  const addWater = () => {
    const nextCount = Math.min(waterCount + 1, 12);
    setWaterCount(nextCount);
    localStorage.setItem("waterCount", nextCount.toString());
  };

  const resetWater = () => {
    setWaterCount(0);
    localStorage.setItem("waterCount", "0");
  };

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const isDark = localStorage.getItem("theme") !== "light";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getTimingSegment = (date: Date | null) => {
    if (!date) return { name: "Loading...", color: "text-zinc-400", recommendation: "" };
    const hour = date.getHours();

    if (hour >= 6 && hour < 10) {
      return {
        name: "Morning",
        color: "text-amber-500 dark:text-amber-400",
        recommendation: "Perfect time for Bananas, soaked Almonds, and Citrus fruits."
      };
    } else if (hour >= 10 && hour < 12) {
      return {
        name: "Mid-Morning",
        color: "text-yellow-500",
        recommendation: "Great time for an Apple or handful of Chia Seeds."
      };
    } else if (hour >= 12 && hour < 15) {
      return {
        name: "Afternoon / Lunch",
        color: "text-orange-500 dark:text-orange-400",
        recommendation: "Load up on Spinach, Beetroot, and complex Sweet Potatoes."
      };
    } else if (hour >= 15 && hour < 18) {
      return {
        name: "Evening",
        color: "text-teal-500 dark:text-teal-400",
        recommendation: "Sip Green Tea and enjoy some Almonds or Walnuts."
      };
    } else if (hour >= 18 && hour < 21) {
      return {
        name: "Dinner",
        color: "text-indigo-500 dark:text-indigo-400",
        recommendation: "Choose light cooked veggies like steamed Broccoli and soup."
      };
    } else {
      return {
        name: "Late Night / Pre-Sleep",
        color: "text-violet-500 dark:text-violet-400",
        recommendation: "Excellent window for Kiwis, Pumpkin Seeds, or Walnuts. Avoid heavy fruits/sugars!"
      };
    }
  };

  const segment = getTimingSegment(currentTime);

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800/80 z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800/80">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500 bg-clip-text text-transparent">
              ChronoNutrition
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-emerald-500" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/20">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {darkMode ? (
              <>
                <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <span>Switch to Light</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-indigo-500" />
                <span>Switch to Dark</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/80 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg md:hidden text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500 bg-clip-text text-transparent md:hidden">
              ChronoNutrition
            </span>
          </div>

          {/* Time Segment Widget */}
          {currentTime && (
            <div className="hidden sm:flex items-center gap-3 bg-zinc-100/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 px-4 py-1.5 rounded-full text-xs max-w-lg shadow-sm">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate text-left">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="mx-1.5 text-zinc-400">|</span>
                <span className={`font-bold ${segment.color}`}>{segment.name}</span>
                <span className="mx-1.5 text-zinc-400">|</span>
                <span className="text-zinc-500 dark:text-zinc-400 italic font-medium">{segment.recommendation}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="sm:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>
            <div className="flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold select-none border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative flex w-full max-w-xs flex-col bg-white dark:bg-zinc-900 p-6 shadow-xl ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500 bg-clip-text text-transparent">
                  ChronoNutrition
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 hover:text-zinc-100"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-emerald-500" : "text-zinc-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 hover:text-zinc-100"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                  <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Content Children wrapper */}
        <main className="flex-1 p-6 md:p-8 pb-20 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/50">
          {children}
        </main>

        {/* Sticky Bottombar for Water Reminder */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800/80 px-6 flex items-center justify-between z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <span className="text-xl select-none">💧</span>
            <div className="text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Water Intake Tracker</span>
              <span className="hidden sm:inline mx-2 text-zinc-300 dark:text-zinc-700">|</span>
              <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">Target: 8 Glasses</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress Indicators */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border border-blue-300 dark:border-blue-800/80 transition-colors ${
                    i < waterCount ? "bg-blue-500" : "bg-zinc-100 dark:bg-zinc-950"
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-500/10">
                {waterCount} / 8 Glasses
              </span>
              <button
                onClick={addWater}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold tracking-wide uppercase shadow-sm transition-colors cursor-pointer"
              >
                + Log Glass
              </button>
              {waterCount > 0 && (
                <button
                  onClick={resetWater}
                  className="text-[10px] text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-200 ml-1 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
