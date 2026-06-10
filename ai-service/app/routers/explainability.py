from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_explanations():
    return {"message": "Explainability module. Use SHAP here."}
