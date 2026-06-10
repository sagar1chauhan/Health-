from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import prediction, recommendation, explainability

app = FastAPI(title="HealthHub+ AI Service", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production restrict to backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prediction.router, prefix="/predict", tags=["Prediction"])
app.include_router(explainability.router, prefix="/explain", tags=["Explainability"])
app.include_router(recommendation.router, prefix="/recommend", tags=["Recommendation"])

@app.get("/")
def read_root():
    return {"message": "HealthHub+ AI Service is running"}
