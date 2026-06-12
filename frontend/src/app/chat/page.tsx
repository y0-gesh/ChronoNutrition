"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, Send, Bot, User, Sparkles, ArrowRight } from "lucide-react";
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

                {/* Show Recommended Foods cards */}
                {msg.foods && msg.foods.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {msg.foods.map((food) => (
                      <div
                        key={food.id}
                        className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{food.image}</span>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">{food.name}</div>
                            <div className="text-[9px] text-zinc-400 font-semibold uppercase">{food.category.replace("_", " ")}</div>
                          </div>
                        </div>
                        <Link
                          href={`/encyclopedia?search=${food.name}`}
                          className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 hover:underline shrink-0"
                        >
                          Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
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
