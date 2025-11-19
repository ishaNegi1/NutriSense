from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pickle
import os
from datetime import datetime

# Mongo (optional)
from db import wellness_collection  # only if you created this; I'll explain below

router = APIRouter()


# -------------------------------
# Load ML Models
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SCORE = os.path.join(BASE_DIR, "../wellness_score_model.pkl")
MODEL_CLASS = os.path.join(BASE_DIR, "../wellness_classifier.pkl")

try:
    score_model = pickle.load(open(MODEL_SCORE, "rb"))
    classifier_model = pickle.load(open(MODEL_CLASS, "rb"))
except Exception as e:
    print("❌ ERROR LOADING MODELS:", e)
    score_model = None
    classifier_model = None


# -------------------------------
# Input Schema
# -------------------------------
class WellnessInput(BaseModel):
    age: int
    height_cm: float
    disease: str
    breakfast: str
    lunch: str
    dinner: str
    snacks: str
    sleep_hours: float
    sleep_start: str
    sleep_end: str
    exercise_hours: float
    water_intake_liters: float
    mood: str
    notes: str = ""


# -------------------------------
# Feature Engineering
# -------------------------------
healthy_foods = ["banana", "milk", "oats", "dal", "roti", "sabzi", "fruit salad", "egg", "sprouts", "khichdi", "curd"]
unhealthy_foods = ["chips", "pizza", "burger", "fries", "chocolate", "ice cream", "noodles", "samosa", "pakoda"]
mood_map = {"happy": 2, "neutral": 1, "sad": 0, "stressed": -1, "angry": -2}

def score_food(text):
    t = str(text).lower()
    score = 0
    score += sum(w in t for w in healthy_foods) * 2
    score -= sum(w in t for w in unhealthy_foods) * 2
    return score


def convert_to_features(data):
    food_score = (
        score_food(data["breakfast"])
        + score_food(data["lunch"])
        + score_food(data["dinner"])
        + score_food(data["snacks"])
    )

    mood = str(data["mood"]).lower().strip()
    mood_val = mood_map.get(mood, 0)

    disease = str(data["disease"]).lower()
    disease_flag = 0 if disease == "none" else 1

    features = [
        data["age"],
        data["height_cm"],
        disease_flag,
        food_score,
        data["sleep_hours"],
        data["exercise_hours"],
        data["water_intake_liters"],
        mood_val,
    ]

    return features


# -------------------------------
# Recommendation Logic
# -------------------------------
def generate_recommendations(score, label):
    recs = []

    if score < 50:
        recs.append("Improve sleep habits and aim for 7–8 hours.")
        recs.append("Increase water intake and reduce junk food.")
        recs.append("Try adding fruits or vegetables to meals.")
    elif score < 75:
        recs.append("Good, but try to drink more water.")
        recs.append("Maintain physical activity regularly.")
    else:
        recs.append("Great wellness score! Keep the routine consistent.")
        recs.append("Maintain balanced meals and good hydration.")

    if label == "Poor":
        recs.append("Health checkup recommended if low energy persists.")
    if label == "Moderate":
        recs.append("Monitor diet closely for a week.")

    return recs


# -------------------------------
# Main Prediction Endpoint
# -------------------------------
@router.post("/api/wellness")
def predict_wellness(payload: WellnessInput):

    if score_model is None or classifier_model is None:
        raise HTTPException(status_code=500, detail="Model files missing or could not be loaded")

    data = payload.dict()
    features = convert_to_features(data)

    score = float(score_model.predict([features])[0])
    label = classifier_model.predict([features])[0]
    recs = generate_recommendations(score, label)

    result = {
        "wellness_score": score,
        "prediction": label,
        "recommendations": recs,
        "timestamp": datetime.utcnow()
    }

    # Save to MongoDB (optional)
    try:
        wellness_collection.insert_one(result)  # Only works if you set it up below
    except:
        pass

    return result
