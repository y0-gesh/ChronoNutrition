"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, Send, Bot, User, Sparkles, ArrowRight, Download, Clock } from "lucide-react";
import { sendChatMessage, Food } from "@/lib/api";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  foods?: Food[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your ChronoNutrition assistant. Ask me anything about food timing, workout recovery, focus, sleep, or nutrient deficiencies! \n\nTry asking: *'What should I eat before my workout?'* or *'What is best for sleep?'*",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const TIME_ORDER = {
    morning: 1,
    mid: 2,
    lunch: 3,
    afternoon: 3,
    evening: 4,
    dinner: 5,
    sleep: 6,
    bed: 6,
    anytime: 7
  };

  const getSortOrder = (bestTime: string) => {
    const t = bestTime.toLowerCase();
    for (const [key, val] of Object.entries(TIME_ORDER)) {
      if (t.includes(key)) return val;
    }
    return 8;
  };

  const sortFoodsChronologically = (foodsList: Food[]) => {
    return [...foodsList].sort((a, b) => getSortOrder(a.best_time_to_eat) - getSortOrder(b.best_time_to_eat));
  };

  const handleDownloadPDF = async (responseText: string, foods: Food[]) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text("ChronoNutrition AI Diet Plan", 20, 20);

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 28);
      
      // Response Summary text wrapped
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // slate-700
      const splitText = doc.splitTextToSize(responseText.replace(/\n/g, ' '), 170);
      doc.text(splitText, 20, 40);

      // Line separator
      const startY = 40 + (splitText.length * 5) + 5;
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(20, startY, 190, startY);

      // Foods Timeline title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("Circadian Nutrition Timeline", 20, startY + 10);

      // List foods sorted
      const sortedFoods = sortFoodsChronologically(foods);
      let currentY = startY + 20;

      sortedFoods.forEach((food, index) => {
        // Page break if too low
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }

        // Draw bullet/dot representation
        doc.setFillColor(16, 185, 129);
        doc.circle(23, currentY + 1, 2, "F");

        // Food Name and Best Time
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`${food.name}   [${food.best_time_to_eat}]`, 28, currentY + 2);

        // Category
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text(food.category.replace('_', ' ').toUpperCase(), 28, currentY + 7);

        // Description wrapped
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const splitDesc = doc.splitTextToSize(food.description, 150);
        doc.text(splitDesc, 28, currentY + 12);

        // Avoid time
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(239, 68, 68); // rose-500
        doc.text(`Avoid: ${food.avoid_time}`, 28, currentY + 12 + (splitDesc.length * 4) + 1);

        currentY += 12 + (splitDesc.length * 4) + 10;
      });

      doc.save(`chrononutrition-plan-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF.");
    }
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    
    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await sendChatMessage(userText);
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.reply,
        foods: data.recommended_foods,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: "I ran into an issue connecting to the ChronoNutrition intelligence server. Please ensure the backend is running and try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
      {/* Board Header */}
      <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-500" />
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">AI Nutrition Guide</h2>
            <div className="text-[10px] text-zinc-400 font-medium">Circadian intelligence expert</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Local Expert Engine
        </div>
      </div>

      {/* Messages Scrolling Board */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
            >
              {/* Avatar Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                isUser
                  ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              }`}>
                {isUser ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
              </div>

              {/* Message bubble */}
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? "bg-emerald-500 text-white font-semibold"
                    : "bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 text-zinc-700 dark:text-zinc-300 whitespace-pre-line"
                }`}>
                  {msg.text}
                </div>

                {/* Show Recommended Foods timeline */}
                {msg.foods && msg.foods.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Circadian Food Timeline</span>
                      <button
                        onClick={() => handleDownloadPDF(msg.text, msg.foods || [])}
                        className="text-[10px] text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-1 cursor-pointer hover:underline bg-transparent border-none p-0 outline-none"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Plan (PDF)
                      </button>
                    </div>
                    
                    <div className="relative border-l border-zinc-200 dark:border-zinc-800/80 ml-3 pl-4 space-y-4">
                      {sortFoodsChronologically(msg.foods).map((food) => (
                        <div key={food.id} className="relative text-xs">
                          {/* Circle dot */}
                          <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-sm" />
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wide border border-emerald-500/10">
                              <Clock className="w-2.5 h-2.5" /> {food.best_time_to_eat.split(", ")[0] || "Anytime"}
                            </span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">
                              {food.name}
                            </span>
                          </div>
                          
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-xl mt-1.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl shrink-0">{food.image}</span>
                              <div>
                                <div className="font-medium text-zinc-600 dark:text-zinc-400 text-[10px] leading-relaxed">{food.description}</div>
                                <div className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Avoid: {food.avoid_time}</div>
                              </div>
                            </div>
                            <Link
                              href={`/encyclopedia?search=${food.name}`}
                              className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 hover:underline shrink-0"
                            >
                              Details <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-4 max-w-[80%]">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 text-zinc-400 text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> Sequencing database mappings...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            placeholder="Ask AI Guide (e.g. what helps sleep, pre-workout tips...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-xs placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
