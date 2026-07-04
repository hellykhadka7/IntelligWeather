"""
Pydantic schemas for prediction request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class TemperaturePredictRequest(BaseModel):
    """Request body for next-day temperature prediction."""
    city: str = Field(..., description="City name")
    historical_temps: List[float] = Field(
        ...,
        min_length=3,
        description="List of recent temperature readings (°C), at least 3 required"
    )
    latitude: Optional[float] = Field(None, description="City latitude")
    longitude: Optional[float] = Field(None, description="City longitude")


class TemperaturePredictResponse(BaseModel):
    """Response for next-day temperature prediction."""
    success: bool
    city: str
    predicted_temperature: float
    unit: str = "°C"
    confidence: float
    r2_score: float
    trend: str  # "rising" | "falling" | "stable"
    recent_temps: List[float]
    data_points_used: int
    temperature_std_dev: float


class MultiDayPredictRequest(BaseModel):
    """Request body for multi-day temperature prediction."""
    city: str = Field(..., description="City name")
    historical_temps: List[float] = Field(
        ...,
        min_length=3,
        description="List of recent temperature readings (°C)"
    )
    days: int = Field(default=5, ge=1, le=7, description="Number of days to predict")


class DayForecast(BaseModel):
    """Single day forecast item."""
    day: int
    predicted_temperature: float
    unit: str = "°C"


class MultiDayPredictResponse(BaseModel):
    """Response for multi-day temperature prediction."""
    model_config = {"protected_namespaces": ()}

    success: bool
    city: str
    forecast_days: List[DayForecast]
    total_predictions: int
    model_r2: float


class ErrorResponse(BaseModel):
    """Error response schema."""
    success: bool = False
    error: str
