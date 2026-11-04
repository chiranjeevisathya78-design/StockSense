from typing import List, Optional
from fastapi import APIRouter, Query, Path
from app.services.stock_service import stock_service
from app.services.indicator_service import indicator_service
from app.services.insight_engine import insight_engine
from app.models.schemas import (
    StockSearchResult,
    StockQuote,
    StockHistoryResponse,
    TechnicalIndicatorsResponse,
    MarketInsightResponse
)

router = APIRouter(prefix="/api/stocks", tags=["stocks"])

@router.get("/search", response_model=List[StockSearchResult])
def search_stocks(q: str = Query("", description="Ticker symbol or company name query")):
    return stock_service.search_stocks(q)

@router.get("/popular/overview")
def get_popular_overview():
    """Returns top market overview quotes for Indian and US markets."""
    symbols = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "AAPL", "NVDA", "MSFT"]
    quotes = []
    for s in symbols:
        try:
            q = stock_service.get_quote(s)
            quotes.append(q)
        except Exception:
            pass
            
    # Sort into gainers and losers
    gainers = sorted([q for q in quotes if q.percent_change >= 0], key=lambda x: x.percent_change, reverse=True)
    losers = sorted([q for q in quotes if q.percent_change < 0], key=lambda x: x.percent_change)

    return {
        "popular": quotes,
        "top_gainers": gainers,
        "top_losers": losers,
        "market_timestamp": quotes[0].timestamp if quotes else ""
    }

@router.get("/{symbol}", response_model=StockQuote)
def get_stock_quote(symbol: str = Path(..., description="Stock ticker symbol e.g. RELIANCE.NS or AAPL")):
    return stock_service.get_quote(symbol)

@router.get("/{symbol}/history", response_model=StockHistoryResponse)
def get_stock_history(
    symbol: str = Path(..., description="Stock ticker symbol"),
    period: str = Query("1y", description="Time period: 1mo, 3mo, 6mo, 1y, 5y")
):
    return stock_service.get_history(symbol, period)

@router.get("/{symbol}/indicators", response_model=TechnicalIndicatorsResponse)
def get_stock_indicators(symbol: str = Path(..., description="Stock ticker symbol")):
    return indicator_service.get_indicators_response(symbol)

@router.get("/{symbol}/insights", response_model=MarketInsightResponse)
def get_stock_insights(symbol: str = Path(..., description="Stock ticker symbol")):
    return insight_engine.generate_insights(symbol)
