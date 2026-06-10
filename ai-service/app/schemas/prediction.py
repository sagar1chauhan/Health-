from pydantic import BaseModel, Field

class PatientFeatures(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: int = Field(..., description="0=Female, 1=Male")
    bmi: float = Field(..., gt=0)
    bloodPressureSystolic: int = Field(..., gt=0)
    bloodPressureDiastolic: int = Field(..., gt=0)
    glucoseLevel: int = Field(..., gt=0)
    cholesterolTotal: int = Field(..., gt=0)
    cholesterolHDL: int = Field(..., gt=0)
    smoking: int = Field(..., description="0=No, 1=Yes")
    alcohol: int = Field(..., description="0=No, 1=Yes")
    physicalActivity: int = Field(..., description="0=None, 1=Low, 2=Moderate, 3=High")
    familyHistory: int = Field(..., description="0=No, 1=Yes")
    stressLevel: int = Field(..., ge=1, le=5)
