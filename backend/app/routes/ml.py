from typing import List
from fastapi import APIRouter, Path
from app.ml.prediction_engine import prediction_engine
from app.models.schemas import PredictionResponse, ModelMetric

router = APIRouter(prefix="/api/stocks", tags=["machine-learning"])

@router.get("/{symbol}/predict", response_model=PredictionResponse)
def get_prediction(symbol: str = Path(..., description="Stock ticker symbol e.g. AAPL or RELIANCE.NS")):
    return prediction_engine.train_and_predict(symbol)

@router.get("/{symbol}/metrics", response_model=List[ModelMetric])
def get_metrics(symbol: str = Path(..., description="Stock ticker symbol")):
    pred_res = prediction_engine.train_and_predict(symbol)
    return pred_res.models_evaluation
