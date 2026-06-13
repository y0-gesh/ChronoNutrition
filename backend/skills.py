import os
import json
import urllib.request
import urllib.error
from typing import Optional, List, Dict, Any

def run_chat_skill(message: str, foods_info: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Executes the Gemini AI Chat skill with token-optimized prompt structure.
    Only passes the food IDs, Names, and Categories to the model to minimize token consumption.
    Refuses off-topic questions not matching the ChronoNutrition domain.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key={api_key}"
    
    # 1. Build token-optimized prompt (only IDs, Names, Categories)
    prompt = (
        "You are a ChronoNutrition AI Assistant. Analyze the user's question and recommend relevant foods from our database.\n\n"
        "Here are the available foods in our database:\n"
    )
    for f in foods_info:
        prompt += f"- ID: {f['id']} (Name: {f['name']}, Category: {f['category']})\n"
    
    prompt += (
        f"\nUser Query: \"{message}\"\n\n"
        "Respond with a JSON object matching this schema:\n"
        "{\n"
        "  \"reply\": \"detailed response in markdown formatting\",\n"
        "  \"recommended_foods\": [\"list\", \"of\", \"food\", \"ids\"]\n"
        "}\n"
        "IMPORTANT RULES:\n"
        "1. If the user's question does not belong to this platform (i.e. is not related to nutrition, food timing, workout recovery, focus, sleep, digestion, or nutrient deficiencies), you MUST set 'reply' to 'I cannot help with that.' and 'recommended_foods' to an empty list []. Do not try to answer general queries outside our domain.\n"
        "2. Only recommend food IDs that are in the available list above. Return at most 5 food IDs.\n"
        "3. Explain clearly why these foods are recommended and when is the best time to eat them based on their circadian rhythms."
    )
    
    body = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2
        }
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            candidate = res_data.get("candidates", [{}])[0]
            text = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
            
            text_str = text.strip()
            if text_str.startswith("```json"):
                text_str = text_str[7:]
            if text_str.endswith("```"):
                text_str = text_str[:-3]
            text_str = text_str.strip()
            
            parsed = json.loads(text_str)
            if "reply" in parsed and "recommended_foods" in parsed:
                return parsed
    except Exception as e:
        print(f"Error calling Gemini API in chat skill: {e}")
        return None
