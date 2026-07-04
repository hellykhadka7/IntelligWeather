"""
FastAPI ML Service — Weather Intelligence Platform
Entry point for the temperature prediction microservice.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.predict import router as predict_router

load_dotenv()

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# App initialization
app = FastAPI(
    title="Weather Intelligence ML Service",
    description="Temperature prediction API using scikit-learn LinearRegression",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Express backend and local development
origins = os.getenv("CORS_ORIGINS", "http://localhost:5000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(predict_router)


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring and deployment verification."""
    return {
        "status": "ok",
        "service": "Weather Intelligence ML Service",
        "version": "1.0.0",
    }


@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Weather Intelligence ML Service",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
