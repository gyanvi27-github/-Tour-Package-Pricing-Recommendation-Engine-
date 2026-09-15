"""
ml_server.py

Single-file Python backend for TripWise AI.

Loads the trained artifacts (pricing_model.pkl, content_similarity.pkl,
cf_predictions.pkl, rating_matrix.pkl) and serves them over HTTP so the
React frontend can call real model predictions instead of the hardcoded
JS simulation in src/lib/mlEngine.ts.

WHERE TO PUT THIS FILE:
    tripwise-ai/ml_server.py        <- same folder as server.ts, package.json

WHERE TO PUT THE MODEL FILES (create this folder):
    tripwise-ai/models/pricing_model.pkl
    tripwise-ai/models/content_similarity.pkl
    tripwise-ai/models/cf_predictions.pkl
    tripwise-ai/models/rating_matrix.pkl
    tripwise-ai/packages.csv

INSTALL (one time):
    pip install fastapi "uvicorn[standard]" pandas numpy scikit-learn xgboost joblib python-dotenv

RUN:
    uvicorn ml_server:app --reload --port 8000

This runs ALONGSIDE the existing Node server (server.ts, port 3000).
It does not replace it — server.ts still handles the Gemini chatbot/voice.
This file only handles pricing + recommendations.
"""

import os
from typing import Optional

import joblib
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

MODELS_DIR = os.getenv("MODELS_DIR", "models")
PACKAGES_CSV = os.getenv("PACKAGES_CSV", "packages.csv")
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    if o.strip()
]

PEAK_MONTHS = {11, 12, 1, 4, 5}
LEAD_BINS = [0, 5, 15, 45, 90, 1000]
LEAD_LABELS = ["0-5", "6-15", "16-45", "46-90", "90+"]

# ---------------------------------------------------------------------------
# Load artifacts once at startup
# ---------------------------------------------------------------------------

pricing_pipeline = None
content_sim_df = None
cf_pred = None
rating_matrix = None
packages = None
load_errors: list[str] = []


def load_artifacts() -> None:
    global pricing_pipeline, content_sim_df, cf_pred, rating_matrix, packages

    def _load(name: str, path: str):
        try:
            return joblib.load(path)
        except Exception as e:  # noqa: BLE001
            load_errors.append(f"{name}: {e}")
            return None

    pricing_pipeline = _load("pricing_model.pkl", os.path.join(MODELS_DIR, "pricing_model.pkl"))
    content_sim_df = _load("content_similarity.pkl", os.path.join(MODELS_DIR, "content_similarity.pkl"))
    cf_pred = _load("cf_predictions.pkl", os.path.join(MODELS_DIR, "cf_predictions.pkl"))
    rating_matrix = _load("rating_matrix.pkl", os.path.join(MODELS_DIR, "rating_matrix.pkl"))

    try:
        packages = pd.read_csv(PACKAGES_CSV)
    except Exception as e:  # noqa: BLE001
        load_errors.append(f"{PACKAGES_CSV}: {e}")


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class PriceRequest(BaseModel):
    package_id: str = Field(..., examples=["PKG0001"])
    travel_date: str = Field(..., description="YYYY-MM-DD")
    group_size: int = Field(..., ge=1)
    booking_date: Optional[str] = Field(None, description="YYYY-MM-DD, defaults to today")


# ---------------------------------------------------------------------------
# Inference helpers (mirrors the notebook's logic exactly)
# ---------------------------------------------------------------------------

def get_package_row(package_id: str) -> pd.Series:
    matches = packages.loc[packages["package_id"] == package_id]
    if matches.empty:
        raise ValueError(f"Unknown package_id: {package_id}")
    return matches.iloc[0]


def predict_price(package_id: str, travel_date: str, group_size: int,
                   booking_date: Optional[str] = None) -> dict:
    if pricing_pipeline is None:
        raise RuntimeError("pricing_model.pkl was not loaded")

    booking_ts = pd.Timestamp(booking_date or pd.Timestamp.today().normalize())
    travel_ts = pd.Timestamp(travel_date)
    lead_time_days = (travel_ts - booking_ts).days

    pkg = get_package_row(package_id)
    is_peak_month = int(travel_ts.month in PEAK_MONTHS)
    lead_bucket = pd.cut([lead_time_days], LEAD_BINS, labels=LEAD_LABELS)[0]

    row = pd.DataFrame([{
        "lead_time_days": lead_time_days,
        "duration_days": pkg["duration_days"],
        "base_price": pkg["base_price"],
        "destination_popularity": pkg["destination_popularity"],
        "group_size": group_size,
        "is_peak_month": is_peak_month,
        "category": pkg["category"],
        "season_tag": pkg["season_tag"],
        "is_international": pkg["is_international"],
        "lead_time_bucket": lead_bucket,
    }])

    predicted_price = float(pricing_pipeline.predict(row)[0])
    base_price = float(pkg["base_price"])
    diff = predicted_price - base_price

    return {
        "package_id": package_id,
        "base_price": round(base_price, 2),
        "predicted_price": round(predicted_price, 2),
        "difference_amount": round(diff, 2),
        "difference_pct": round((diff / base_price) * 100, 2) if base_price else 0.0,
        "lead_time_days": lead_time_days,
    }


def similar_packages(package_id: str, top_n: int = 5) -> list[dict]:
    if content_sim_df is None:
        raise RuntimeError("content_similarity.pkl was not loaded")
    if package_id not in content_sim_df.columns:
        raise ValueError(f"Unknown package_id: {package_id}")

    scores = content_sim_df[package_id].drop(index=package_id)
    top_ids = scores.sort_values(ascending=False).head(top_n).index.tolist()
    return packages.set_index("package_id").loc[top_ids].reset_index().to_dict(orient="records")


def _minmax(s: pd.Series) -> pd.Series:
    if s.max() == s.min():
        return s * 0
    return (s - s.min()) / (s.max() - s.min())


def hybrid_recommend(user_id: str, top_n: int = 5, alpha: float = 0.6) -> list[dict]:
    if cf_pred is None or rating_matrix is None or content_sim_df is None:
        raise RuntimeError("Recommendation artifacts were not fully loaded")
    if user_id not in rating_matrix.index:
        raise ValueError(f"Unknown user_id: {user_id}")

    rated = rating_matrix.loc[user_id]
    liked = rated[rated >= 4].index.tolist()
    cf_scores = cf_pred.loc[user_id].where(rated == 0).dropna()

    if liked:
        content_scores = content_sim_df.loc[liked, cf_scores.index].mean(axis=0)
    else:
        content_scores = pd.Series(0, index=cf_scores.index)

    blended = alpha * _minmax(cf_scores) + (1 - alpha) * _minmax(content_scores)
    top_ids = blended.sort_values(ascending=False).head(top_n).index.tolist()
    return packages.set_index("package_id").loc[top_ids].reset_index().to_dict(orient="records")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="TripWise ML Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    load_artifacts()
    if load_errors:
        print("WARNING - some artifacts failed to load:", load_errors)


@app.get("/health")
def health():
    return {
        "status": "ok" if not load_errors else "degraded",
        "pricing_model_loaded": pricing_pipeline is not None,
        "content_similarity_loaded": content_sim_df is not None,
        "cf_predictions_loaded": cf_pred is not None,
        "rating_matrix_loaded": rating_matrix is not None,
        "packages_loaded": packages is not None,
        "errors": load_errors,
    }


@app.post("/predict-price")
def route_predict_price(req: PriceRequest):
    try:
        return predict_price(req.package_id, req.travel_date, req.group_size, req.booking_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/similar-packages/{package_id}")
def route_similar_packages(package_id: str, top_n: int = 5):
    try:
        return {"package_id": package_id, "results": similar_packages(package_id, top_n)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/recommend/{user_id}")
def route_recommend(user_id: str, top_n: int = 5, alpha: float = 0.6):
    try:
        return {"user_id": user_id, "results": hybrid_recommend(user_id, top_n, alpha)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
