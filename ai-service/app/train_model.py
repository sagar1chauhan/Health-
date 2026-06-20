import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os

# Set random seed for reproducibility
np.random.seed(42)

def generate_synthetic_data(num_samples=5000):
    print("Generating synthetic dataset...")
    # Generate features
    age = np.random.randint(20, 85, size=num_samples)
    gender = np.random.randint(0, 2, size=num_samples) # 0=Female, 1=Male
    bmi = np.random.normal(26, 5, size=num_samples).clip(15, 50)
    
    # Blood pressure correlated with age and BMI
    bp_sys_base = 100 + (age * 0.4) + (bmi * 0.3)
    blood_pressure_systolic = np.random.normal(bp_sys_base, 10).clip(90, 200).astype(int)
    
    bp_dia_base = 65 + (age * 0.15) + (bmi * 0.2)
    blood_pressure_diastolic = np.random.normal(bp_dia_base, 8).clip(60, 120).astype(int)
    
    # Glucose and Cholesterol correlated with age and BMI
    glucose_level = np.random.normal(90 + (age * 0.2) + (bmi * 0.5), 15).clip(70, 300).astype(int)
    cholesterol_total = np.random.normal(160 + (age * 0.5) + (bmi * 0.4), 25).clip(120, 350).astype(int)
    cholesterol_hdl = np.random.normal(55 - (bmi * 0.2), 10).clip(20, 100).astype(int)
    
    smoking = np.random.choice([0, 1], size=num_samples, p=[0.75, 0.25])
    alcohol = np.random.choice([0, 1], size=num_samples, p=[0.6, 0.4])
    physical_activity = np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.2, 0.4, 0.3, 0.1])
    family_history = np.random.choice([0, 1], size=num_samples, p=[0.8, 0.2])
    stress_level = np.random.randint(1, 6, size=num_samples)
    
    # Create DataFrame
    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'bmi': bmi,
        'bloodPressureSystolic': blood_pressure_systolic,
        'bloodPressureDiastolic': blood_pressure_diastolic,
        'glucoseLevel': glucose_level,
        'cholesterolTotal': cholesterol_total,
        'cholesterolHDL': cholesterol_hdl,
        'smoking': smoking,
        'alcohol': alcohol,
        'physicalActivity': physical_activity,
        'familyHistory': family_history,
        'stressLevel': stress_level
    })
    
    # Calculate target (Heart Disease Risk) based on risk factors
    risk_score = (
        (df['age'] > 50) * 2 +
        (df['gender'] == 1) * 1 +
        (df['bmi'] > 30) * 2 +
        (df['bloodPressureSystolic'] > 130) * 3 +
        (df['glucoseLevel'] > 140) * 3 +
        (df['cholesterolTotal'] > 200) * 2 +
        (df['cholesterolHDL'] < 40) * 2 +
        (df['smoking'] == 1) * 3 +
        (df['familyHistory'] == 1) * 3 +
        (df['stressLevel'] >= 4) * 1 -
        (df['physicalActivity'] >= 2) * 2
    )
    
    # Add noise
    risk_score += np.random.normal(0, 1.5, size=num_samples)
    
    # Threshold for disease (approx 30% positive class)
    threshold = np.percentile(risk_score, 70)
    df['target'] = (risk_score > threshold).astype(int)
    
    print(f"Dataset generated with {num_samples} records.")
    print(f"Positive cases (Heart Disease): {df['target'].sum()} ({df['target'].mean()*100:.1f}%)")
    
    return df

def train_and_evaluate(model, name, X_train, X_test, y_train, y_test):
    print(f"\nTraining {name}...")
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1_score': f1_score(y_test, y_pred),
        'roc_auc': roc_auc_score(y_test, y_pred_proba)
    }
    
    print(f"{name} Metrics:")
    for k, v in metrics.items():
        print(f"  - {k}: {v:.4f}")
        
    return model, metrics

def main():
    df = generate_synthetic_data()
    
    X = df.drop('target', axis=1)
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 1. Train Random Forest
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    rf_trained, rf_metrics = train_and_evaluate(rf_model, "RandomForest", X_train, X_test, y_train, y_test)
    
    # Save models
    os.makedirs('app/models', exist_ok=True)
    joblib.dump(rf_trained, 'app/models/random_forest.joblib')
    
    print("\nModels saved to app/models/ successfully!")
    
if __name__ == "__main__":
    main()
