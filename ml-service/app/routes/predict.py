"""
Prediction routes — /predict/temperature and /predict/multi-day
"""

from fastapi import APIRouter, HTTPException
from app.schemas.prediction import (
    TemperaturePredictRequest,
    TemperaturePredictResponse,
    MultiDayPredictRequest,
    MultiDayPredictResponse,
)
from app.models.predictor import predictor
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predict", tags=["predictions"])


@router.post("/temperature", response_model=TemperaturePredictResponse)
async def predict_temperature(body: TemperaturePredictRequest):
    """
    Predict next-day temperature using LinearRegression.
    Requires at least 3 historical temperature readings.
    """
    result = predictor.predict_next_day(
        city=body.city,
        historical_temps=body.historical_temps,
        latitude=body.latitude,
        longitude=body.longitude,
    )

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Prediction failed"))

    return result


@router.post("/multi-day", response_model=MultiDayPredictResponse)
async def predict_multi_day(body: MultiDayPredictRequest):
    """
    Predict temperatures for multiple days ahead (1–7 days).
    Requires at least 3 historical temperature readings.
    """
    result = predictor.predict_multi_day(
        city=body.city,
        historical_temps=body.historical_temps,
        days=body.days,
    )

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Prediction failed"))

    return result
