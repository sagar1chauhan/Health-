from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.schemas.prediction import PatientFeatures
import joblib
import pandas as pd
import shap
import os

router = APIRouter()

# Load models if they exist
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rf_path = os.path.join(BASE_DIR, 'models', 'random_forest.joblib')

rf_model = None
explainer = None

if os.path.exists(rf_path):
    rf_model = joblib.load(rf_path)
    explainer = shap.TreeExplainer(rf_model)

@router.post("/")
async def get_explanations(request: Request):
    """
    Get detailed SHAP explainability for a given set of patient features.
    """
    if rf_model is None or explainer is None:
        return JSONResponse(status_code=503, content={"error": "Models not trained or loaded yet."})

    try:
        body = await request.json()
        features = PatientFeatures(**body)
        df = pd.DataFrame([features.dict()])
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(df)
        
        if isinstance(shap_values, list):
            vals = shap_values[1][0] # class 1
        else:
            vals = shap_values[0]
            
        feature_names = df.columns
        contributions = {}
        
        for i, name in enumerate(feature_names):
            contributions[name] = {
                "value": float(df.iloc[0, i]),
                "contribution": float(vals[i])
            }
            
        return {
            "disease": "Heart Disease Risk",
            "baseValue": float(explainer.expected_value[1] if isinstance(explainer.expected_value, list) else explainer.expected_value),
            "contributions": contributions
        }
        
    except Exception as e:
        print("Explainability Error:", e)
        return JSONResponse(status_code=422, content={"detail": str(e)})
