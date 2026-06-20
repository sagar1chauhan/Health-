from fastapi import APIRouter, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.schemas.prediction import PatientFeatures
import joblib
import pandas as pd
import numpy as np
import shap
import os

router = APIRouter()

# Add a custom exception handler at the router or app level.
# Actually, since this is a router, we can't easily add exception_handler here.
# Instead, let's just make the endpoint accept a dict to debug.

# Load models if they exist
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rf_path = os.path.join(BASE_DIR, 'models', 'random_forest.joblib')

rf_model = None
explainer = None

if os.path.exists(rf_path):
    rf_model = joblib.load(rf_path)
    explainer = shap.TreeExplainer(rf_model)

@router.post("/")
async def predict_disease(request: Request):
    """
    Predicts disease risk based on patient features using trained RandomForest model.
    """
    
    body = await request.json()
    print("RECEIVED PAYLOAD:", body)
    
    try:
        features = PatientFeatures(**body)
    except Exception as e:
        print("VALIDATION ERROR:", e)
        return JSONResponse(status_code=422, content={"detail": str(e)})

    if rf_model is None:
        return {"error": "Models not trained yet. Please run train_model.py first."}

    # Create DataFrame from features
    feature_dict = features.dict()
    df = pd.DataFrame([feature_dict])

    # Predictions
    rf_prob = float(rf_model.predict_proba(df)[0][1])
    
    # Ensemble probability (average)
    ensemble_prob = rf_prob
    overall_risk_score = int(ensemble_prob * 100)
    
    risk_category = "low"
    if overall_risk_score >= 70:
        risk_category = "high"
    elif overall_risk_score >= 40:
        risk_category = "moderate"
        
    # SHAP explanations
    shap_explanation = {}
    try:
        # Calculate SHAP values
        shap_values = explainer.shap_values(df)
        
        # For RandomForest, shap_values is a list of arrays (one for each class). We want class 1 (positive).
        if isinstance(shap_values, list):
            vals = shap_values[1][0]
        else:
            # If regression or single output
            vals = shap_values[0]
            
        feature_names = df.columns
        contributions = {}
        
        for i, name in enumerate(feature_names):
            # Normalize contribution slightly for UI presentation
            contributions[name] = {
                "value": float(df.iloc[0, i]),
                "contribution": float(vals[i])
            }
            
        shap_explanation["Heart Disease Risk"] = contributions
    except Exception as e:
        print("SHAP Error:", e)
        # Fallback if SHAP fails
        shap_explanation["Heart Disease Risk"] = {
            "error": "Failed to generate explanations"
        }
    
    predictions = [
        {
            "disease": "Heart Disease Risk",
            "probability": rf_prob,
            "riskLevel": risk_category,
            "model": "RandomForest",
            "accuracy": 0.85 # As per training output
        }
    ]

    return {
        "predictions": predictions,
        "overallRiskScore": overall_risk_score,
        "riskCategory": risk_category,
        "shapExplanation": shap_explanation
    }
