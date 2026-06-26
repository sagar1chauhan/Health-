import os
import json
import google.generativeai as genai
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    
model = genai.GenerativeModel("gemini-2.5-flash")

@router.post("/")
async def generate_recommendations(request: Request):
    """
    Generate personalized health recommendations using Gemini AI based on patient features and risk prediction.
    Returns structured JSON with dietPlan, exercisePlan, lifestyleSuggestions, and doctorRecommendations.
    """
    if not api_key:
        return JSONResponse(status_code=500, content={"error": "GEMINI_API_KEY not configured in AI Service."})
        
    try:
        data = await request.json()
        prediction = data.get("prediction", {})
        input_features = data.get("inputFeatures", {})
        
        # Build prompt
        prompt = f"""
You are an expert AI Health Assistant. Based on the patient's health data and predicted risk, generate a comprehensive, personalized health improvement plan.
You MUST respond with ONLY a valid JSON object. Do NOT wrap it in markdown block like ```json ... ```. Just the raw JSON object.

Patient Features:
{json.dumps(input_features, indent=2)}

Risk Prediction Analysis:
{json.dumps(prediction, indent=2)}

Generate a JSON object exactly matching this structure (fill in with 2-3 items per list appropriate for the patient):
{{
  "dietPlan": [
    {{
      "meal": "breakfast",
      "suggestion": "Detailed meal suggestion here",
      "reason": "Why this is good for them",
      "calories": 300,
      "nutrients": {{ "protein": 10, "carbs": 40, "fat": 10, "fiber": 5 }}
    }}
  ],
  "exercisePlan": [
    {{
      "activity": "Name of exercise",
      "duration": "e.g., 30 mins",
      "frequency": "e.g., 3x/week",
      "intensity": "low/moderate/high",
      "reason": "Why this exercise helps",
      "caloriesBurned": 200
    }}
  ],
  "lifestyleSuggestions": [
    {{
      "category": "stress/sleep/smoking/alcohol/hydration/general",
      "suggestion": "Actionable lifestyle tip",
      "priority": "low/medium/high",
      "impact": "Expected health impact"
    }}
  ],
  "doctorRecommendations": [
    {{
      "specialization": "Specialist name (e.g., Cardiologist)",
      "reason": "Why they should consult this specialist",
      "urgency": "routine/soon/urgent"
    }}
  ]
}}
"""
        # Call Gemini
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Strip potential markdown code blocks if the model ignored instructions
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()
        
        # Parse JSON
        recommendation_json = json.loads(response_text)
        
        return recommendation_json
        
    except Exception as e:
        print("Recommendation Generation Error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})
