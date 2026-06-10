from fastapi import APIRouter
from app.schemas.prediction import PatientFeatures
import random # Mock for actual ML model

router = APIRouter()

@router.post("/")
def predict_disease(features: PatientFeatures):
    """
    Predicts disease risk based on patient features.
    In a real implementation, this would load XGBoost/RandomForest models and run `.predict()`.
    """
    
    # MOCK LOGIC for demo purposes based on simple thresholds
    risk_score = 0
    if features.bmi > 25: risk_score += 15
    if features.bmi > 30: risk_score += 10
    if features.bloodPressureSystolic > 130: risk_score += 20
    if features.glucoseLevel > 140: risk_score += 20
    if features.smoking == 1: risk_score += 15
    if features.age > 50: risk_score += 10
    
    risk_category = "low"
    if risk_score > 60: risk_category = "high"
    elif risk_score > 30: risk_category = "moderate"
    
    # Mock SHAP Explanations
    shap = {
        "Heart Disease": {
            "bmi": {"value": features.bmi, "contribution": 0.15 if features.bmi > 25 else 0.01},
            "bloodPressureSystolic": {"value": features.bloodPressureSystolic, "contribution": 0.25 if features.bloodPressureSystolic > 130 else 0.05},
            "age": {"value": features.age, "contribution": 0.1}
        }
    }
    
    predictions = [
        {
            "disease": "Heart Disease" if features.bloodPressureSystolic > 130 else "General Health Issue",
            "probability": min(0.95, risk_score / 100.0),
            "riskLevel": risk_category,
            "model": "XGBoost Ensemble"
        }
    ]

    return {
        "predictions": predictions,
        "overallRiskScore": min(100, risk_score),
        "riskCategory": risk_category,
        "shapExplanation": shap
    }
