import time
import logging
from typing import List, Dict, Any, Optional
import yfinance as yf
import pandas as pd
from fastapi import HTTPException
from app.models.schemas import StockSearchResult, StockQuote, HistoricalDataPoint, StockHistoryResponse
from app.config import settings

logger = logging.getLogger("stocksense.stocks")

# Curated list of popular Indian and US stocks for fast discovery and auto-completion
POPULAR_STOCKS = [
    # Indian Market
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "INFY.NS", "name": "Infosys Ltd", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "ITC.NS", "name": "ITC Ltd", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "exchange": "NSE", "currency": "INR", "market": "IN"},
    {"symbol": "WIPRO.NS", "name": "Wipro Ltd", "exchange": "NSE", "currency": "INR", "market": "IN"},
    # US Market
    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "currency": "USD", "market": "US"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ", "currency": "USD", "market": "US"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ", "currency": "USD", "market": "US"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "currency": "USD", "market": "US"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ", "currency": "USD", "market": "US"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ", "currency": "NASDAQ", "market": "US"},
    {"symbol": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ", "currency": "USD", "market": "US"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE", "currency": "USD", "market": "US"},
    {"symbol": "AMD", "name": "Advanced Micro Devices", "exchange": "NASDAQ", "currency": "USD", "market": "US"},
    {"symbol": "NFLX", "name": "Netflix Inc.", "exchange": "NASDAQ", "currency": "USD", "market": "US"},
]

# Simple in-memory cache: key -> {"timestamp": float, "data": Any}
_CACHE: Dict[str, Dict[str, Any]] = {}

def get_from_cache(key: str) -> Optional[Any]:
    if key in _CACHE:
        entry = _CACHE[key]
        if time.time() - entry["timestamp"] < settings.CACHE_TTL_SECONDS:
            return entry["data"]
        else:
            del _CACHE[key]
    return None

def set_cache(key: str, data: Any):
    _CACHE[key] = {"timestamp": time.time(), "data": data}

class StockService:
    @staticmethod
    def search_stocks(query: str) -> List[StockSearchResult]:
        q = query.strip().upper()
        if not q:
            return [StockSearchResult(**item) for item in POPULAR_STOCKS[:10]]

        matches = []
        for stock in POPULAR_STOCKS:
            if q in stock["symbol"].upper() or q in stock["name"].upper():
                matches.append(StockSearchResult(**stock))

        # If user entered a specific ticker not in the curated list, check with yfinance
        if len(matches) < 3 and len(q) >= 2:
            try:
                ticker = yf.Ticker(q)
                hist = ticker.history(period="5d")
                if not hist.empty:
                    info = {}
                    try:
                        info = ticker.info or {}
                    except Exception:
                        pass
                    
                    name = info.get("shortName") or info.get("longName") or q
                    exchange = info.get("exchange", "Exchange")
                    currency = "INR" if q.endswith(".NS") or q.endswith(".BO") else "USD"
                    market = "IN" if currency == "INR" else "US"
                    
                    custom_match = StockSearchResult(
                        symbol=q,
                        name=name,
                        exchange=exchange,
                        currency=currency,
                        market=market
                    )
                    if not any(m.symbol == q for m in matches):
                        matches.insert(0, custom_match)
            except Exception as e:
                logger.debug("Custom ticker check failed for %s: %s", q, e)

        return matches

    @staticmethod
    def get_quote(symbol: str) -> StockQuote:
        clean_symbol = symbol.strip().upper()
        cache_key = f"quote_{clean_symbol}"
        cached = get_from_cache(cache_key)
        if cached:
            return cached

        try:
            ticker = yf.Ticker(clean_symbol)
            # Fetch 5 days to ensure we get latest close and previous close
            hist = ticker.history(period="5d")
            if hist.empty or len(hist) < 1:
                raise HTTPException(status_code=404, detail=f"Stock ticker '{clean_symbol}' not found or no trading data available.")

            latest_row = hist.iloc[-1]
            prev_row = hist.iloc[-2] if len(hist) >= 2 else latest_row
            
            price = round(float(latest_row['Close']), 2)
            prev_close = round(float(prev_row['Close']), 2)
            change = round(price - prev_close, 2)
            percent_change = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0

            # Determine name and market
            name = clean_symbol
            market = "IN" if clean_symbol.endswith(".NS") or clean_symbol.endswith(".BO") else "US"
            currency = "INR" if market == "IN" else "USD"

            # Check matching popular list for fast official name
            for item in POPULAR_STOCKS:
                if item["symbol"] == clean_symbol:
                    name = item["name"]
                    break

            if name == clean_symbol:
                try:
                    info = ticker.info or {}
                    name = info.get("shortName") or info.get("longName") or clean_symbol
                except Exception:
                    pass

            timestamp_str = latest_row.name.strftime("%Y-%m-%d")

            quote = StockQuote(
                symbol=clean_symbol,
                name=name,
                price=price,
                change=change,
                percent_change=percent_change,
                open=round(float(latest_row['Open']), 2),
                high=round(float(latest_row['High']), 2),
                low=round(float(latest_row['Low']), 2),
                volume=int(latest_row['Volume']),
                previous_close=prev_close,
                currency=currency,
                market=market,
                timestamp=timestamp_str
            )
            set_cache(cache_key, quote)
            return quote
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to fetch quote for %s: %s", clean_symbol, e)
            raise HTTPException(status_code=404, detail=f"Stock ticker '{clean_symbol}' not found or unavailable: {str(e)}")

    @staticmethod
    def get_history_df(symbol: str, period: str = "1y") -> pd.DataFrame:
        clean_symbol = symbol.strip().upper()
        valid_periods = {"1mo", "3mo", "6mo", "1y", "2y", "5y"}
        if period not in valid_periods:
            period = "1y"

        cache_key = f"df_{clean_symbol}_{period}"
        cached = get_from_cache(cache_key)
        if cached is not None:
            return cached

        try:
            ticker = yf.Ticker(clean_symbol)
            df = ticker.history(period=period)
            if df.empty or len(df) < 5:
                raise HTTPException(status_code=404, detail=f"Insufficient historical data available for '{clean_symbol}'.")

            df = df.reset_index()
            # Normalize Date column
            if "Date" in df.columns:
                df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
            set_cache(cache_key, df)
            return df
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get historical dataframe for %s: %s", clean_symbol, e)
            raise HTTPException(status_code=500, detail=f"Data provider error for {clean_symbol}: {str(e)}")

    @staticmethod
    def get_history(symbol: str, period: str = "1y") -> StockHistoryResponse:
        clean_symbol = symbol.strip().upper()
        quote = StockService.get_quote(clean_symbol)
        df = StockService.get_history_df(clean_symbol, period)

        data_points = []
        for _, row in df.iterrows():
            data_points.append(
                HistoricalDataPoint(
                    date=str(row["Date"]),
                    open=round(float(row["Open"]), 2),
                    high=round(float(row["High"]), 2),
                    low=round(float(row["Low"]), 2),
                    close=round(float(row["Close"]), 2),
                    volume=int(row["Volume"])
                )
            )

        return StockHistoryResponse(
            symbol=clean_symbol,
            name=quote.name,
            currency=quote.currency,
            market=quote.market,
            range=period,
            count=len(data_points),
            data=data_points
        )

stock_service = StockService()
