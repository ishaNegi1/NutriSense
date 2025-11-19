from fastapi import APIRouter, Depends
from fastapi import HTTPException
from schemas import WellnessInput, UserOut
from auth_utils import get_current_user
import joblib
import pandas as pd
from db import wellness_collection

router = APIRouter()

score_model = joblib.load("wellness_score_model.pkl")
class_model = joblib.load("wellness_classifier.pkl")

healthy_foods = ["banana", "milk", "oats", "dal", "roti", "sabzi", "fruit salad",
                 "egg", "sprouts", "khichdi", "curd"]

unhealthy_foods = ["chips", "pizza", "burger", "fries", "chocolate", "ice cream",
                   "noodles", "samosa", "pakoda"]

mood_map = {"happy": 2, "neutral": 1, "sad": 0, "stressed": -1, "angry": -2}

def score_food(text):
    text = text.lower()
    score = 0
    score += sum(i in text for i in healthy_foods) * 2
    score -= sum(i in text for i in unhealthy_foods) * 2
    return score

def convert_to_features(data: WellnessInput):
    food_score = (
        score_food(data.breakfast)
        + score_food(data.lunch)
        + score_food(data.dinner)
        + score_food(data.snacks)
    )

    mood_val = mood_map.get(data.mood.lower(), 0)
    disease_flag = 0 if data.disease.lower() == "none" else 1

    return [
        data.age,
        data.height_cm,
        disease_flag,
        food_score,
        data.sleep_hours,
        data.exercise_hours,
        data.water_intake_liters,
        mood_val
    ]

@router.post("/wellness/predict")
async def predict_wellness(data: WellnessInput, user: UserOut = Depends(get_current_user)):

    features = convert_to_features(data)

    score = int(score_model.predict([features])[0])
    category = class_model.predict([features])[0]

    entry = {
    "user_id": user["id"],
    "input": data.dict(),
    "score": score,
    "category": category
}

    await wellness_collection.insert_one(entry)

    return {
        "wellness_score": score,
        "wellness_category": category
    }

@router.get("/wellness/history")
async def get_history(user: UserOut = Depends(get_current_user)):
    records = await wellness_collection.find({"user_id": user["id"]}).to_list(None)
    for r in records:
        r["_id"] = str(r["_id"])
    return records
