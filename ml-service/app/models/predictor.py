"""
Temperature Predictor — reused and improved from original weather_prediction module.
Uses LinearRegression for next-day prediction and RandomForest for multi-day.
"""

import numpy as np
import logging
from typing import Dict, List, Optional
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

logger = logging.getLogger(__name__)


class TemperaturePredictor:
    """
    Predicts temperature using historical readings.
    Reuses LinearRegression + RandomForest logic from the original project.
    """

    def predict_next_day(
        self,
        city: str,
        historical_temps: List[float],
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> Dict:
        """
        Predict the next day's temperature using LinearRegression.

        Args:
            city: City name (for labelling response)
            historical_temps: List of recent temperature readings (°C), min 3
            latitude: Optional latitude for context
            longitude: Optional longitude for context

        Returns:
            Dict with prediction, confidence, r2, trend, std_dev
        """
        temps = list(historical_temps)

        if len(temps) < 3:
            return {
                "success": False,
                "error": "Not enough historical data. Minimum 3 readings required.",
                "min_required": 3,
                "available": len(temps),
            }

        try:
            # Prepare data (same logic as original predict_temperature.py)
            X = np.array(range(1, len(temps) + 1)).reshape(-1, 1)
            y = np.array(temps)

            model = LinearRegression()
            model.fit(X, y)

            # Predict next day
            next_day = len(temps) + 1
            predicted_temp = float(model.predict([[next_day]])[0])

            # Confidence and quality metrics
            std_dev = float(np.std(y))
            confidence = min(0.95, max(0.5, 1.0 - (std_dev / max(abs(predicted_temp), 1))))
            r2_score = float(model.score(X, y))

            # Trend
            if predicted_temp > temps[-1]:
                trend = "rising"
            elif predicted_temp < temps[-1]:
                trend = "falling"
            else:
                trend = "stable"

            return {
                "success": True,
                "city": city,
                "predicted_temperature": round(predicted_temp, 1),
                "unit": "°C",
                "confidence": round(confidence, 2),
                "r2_score": round(r2_score, 3),
                "trend": trend,
                "recent_temps": temps[-5:],
                "data_points_used": len(temps),
                "temperature_std_dev": round(std_dev, 2),
                "latitude": latitude,
                "longitude": longitude,
            }

        except Exception as e:
            logger.error(f"Prediction error for {city}: {str(e)}")
            return {"success": False, "error": str(e)}

    def predict_multi_day(
        self,
        city: str,
        historical_temps: List[float],
        days: int = 5,
    ) -> Dict:
        """
        Predict temperatures for multiple days ahead using LinearRegression.

        Args:
            city: City name
            historical_temps: Recent temperature history, min 3
            days: Number of future days to predict (1-7)

        Returns:
            Dict with forecast_days list
        """
        temps = list(historical_temps)
        days = min(max(days, 1), 7)

        if len(temps) < 3:
            return {
                "success": False,
                "error": "Not enough historical data. Minimum 3 readings required.",
            }

        try:
            X = np.array(range(1, len(temps) + 1)).reshape(-1, 1)
            y = np.array(temps)

            model = LinearRegression()
            model.fit(X, y)

            forecast_days = []
            for day_offset in range(1, days + 1):
                next_day = len(temps) + day_offset
                predicted_temp = float(model.predict([[next_day]])[0])
                forecast_days.append(
                    {
                        "day": day_offset,
                        "predicted_temperature": round(predicted_temp, 1),
                        "unit": "°C",
                    }
                )

            r2 = float(model.score(X, y))

            return {
                "success": True,
                "city": city,
                "forecast_days": forecast_days,
                "total_predictions": len(forecast_days),
                "model_r2": round(r2, 3),
            }

        except Exception as e:
            logger.error(f"Multi-day prediction error for {city}: {str(e)}")
            return {"success": False, "error": str(e)}


# Singleton instance — instantiate once, reuse across requests
predictor = TemperaturePredictor()
