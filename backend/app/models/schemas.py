from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    app_name: str
    database_connected: bool
    version: str

class StockSearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str
    market: str  # "IN" or "US"

class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    percent_change: float
    open: float
    high: float
    low: float
    volume: int
    previous_close: float
    currency: str
    market: str
    timestamp: str

class HistoricalDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockHistoryResponse(BaseModel):
    symbol: str
    name: str
    currency: str
    market: str
    range: str
    count: int
    data: List[HistoricalDataPoint]

class IndicatorPoint(BaseModel):
    date: str
    close: float
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_20: Optional[float] = None
    rsi_14: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None
    daily_return: Optional[float] = None

class IndicatorSummary(BaseModel):
    current_price: float
    sma_20: Optional[float]
    sma_50: Optional[float]
    ema_20: Optional[float]
    rsi_14: Optional[float]
    macd: Optional[float]
    macd_signal: Optional[float]
    macd_hist: Optional[float]
    bb_upper: Optional[float]
    bb_middle: Optional[float]
    bb_lower: Optional[float]
    daily_return: Optional[float]

class TechnicalIndicatorsResponse(BaseModel):
    symbol: str
    name: str
    current_values: IndicatorSummary
    trend: str  # "Bullish", "Bearish", "Sideways"
    trend_reasons: List[str]
    explanations: Dict[str, str]
    series: List[IndicatorPoint]

class ModelMetric(BaseModel):
    model_name: str
    mae: float
    rmse: float
    directional_accuracy: float
    test_samples: int

class ActualVsPredictedPoint(BaseModel):
    date: str
    actual: float
    predicted_lr: float
    predicted_rf: float
    baseline: float

class PredictionResponse(BaseModel):
    symbol: str
    name: str
    current_price: float
    currency: str
    predicted_next_day_price: float
    estimated_change: float
    estimated_change_percent: float
    selected_model: str
    last_trading_date: str
    models_evaluation: List[ModelMetric]
    actual_vs_predicted: List[ActualVsPredictedPoint]
    features_used: List[str]
    disclaimer: str

class MarketInsightResponse(BaseModel):
    symbol: str
    name: str
    current_price: float
    currency: str
    overall_sentiment: str  # "Bullish", "Bearish", "Neutral / Sideways"
    summary_paragraph: str
    bullet_insights: List[Dict[str, str]]
    ml_forecast_perspective: str
    disclaimer: str

class WatchlistAddRequest(BaseModel):
    symbol: str

class WatchlistResponse(BaseModel):
    items: List[StockQuote]
    total_count: int
    is_demo_mode: bool
