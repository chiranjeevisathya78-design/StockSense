import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from app.services.stock_service import stock_service
from app.models.schemas import (
    TechnicalIndicatorsResponse,
    IndicatorPoint,
    IndicatorSummary
)

EXPLANATIONS = {
    "sma_20": "Simple Moving Average (20-day): The average closing price over the last 20 trading sessions. It smooths out short-term noise to reveal the immediate trend.",
    "sma_50": "Simple Moving Average (50-day): The average closing price over 50 sessions. A primary benchmark for intermediate market trend direction.",
    "ema_20": "Exponential Moving Average (20-day): Similar to SMA 20 but assigns greater mathematical weight to recent sessions, reacting quicker to price pivots.",
    "rsi_14": "Relative Strength Index (14-period): A momentum oscillator bounded between 0 and 100. Values above 70 typically signal overbought conditions; values below 30 signal oversold conditions.",
    "macd": "Moving Average Convergence Divergence: Measures momentum by subtracting the 26-day EMA from the 12-day EMA. When MACD crosses above the Signal line, upward momentum is building.",
    "macd_signal": "MACD Signal Line: A 9-day EMA of the MACD line, used as an entry/exit trigger line.",
    "bollinger_bands": "Bollinger Bands: Volatility bands placed 2 standard deviations above and below the 20-day SMA. Tightening bands indicate a volatility squeeze; touching the outer bands indicates extended price swings.",
    "daily_return": "Daily Percentage Return: The relative price movement of the current session compared to the previous trading session's close."
}

class IndicatorService:
    @staticmethod
    def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
        calc_df = df.copy()
        
        # Sort chronologically
        calc_df = calc_df.sort_values(by="Date").reset_index(drop=True)
        close = calc_df["Close"]

        # SMAs & EMA
        calc_df["SMA_20"] = close.rolling(window=20).mean()
        calc_df["SMA_50"] = close.rolling(window=50).mean()
        calc_df["EMA_20"] = close.ewm(span=20, adjust=False).mean()

        # RSI 14 (Wilder's smoothed RSI)
        delta = close.diff()
        gain = (delta.where(delta > 0, 0.0)).copy()
        loss = (-delta.where(delta < 0, 0.0)).copy()
        
        avg_gain = gain.rolling(window=14, min_periods=14).mean()
        avg_loss = loss.rolling(window=14, min_periods=14).mean()
        
        # Use exponential moving average for smoothing
        for i in range(14, len(calc_df)):
            avg_gain.iloc[i] = (avg_gain.iloc[i - 1] * 13 + gain.iloc[i]) / 14
            avg_loss.iloc[i] = (avg_loss.iloc[i - 1] * 13 + loss.iloc[i]) / 14
            
        rs = avg_gain / avg_loss.replace(0, np.nan)
        calc_df["RSI_14"] = 100 - (100 / (1 + rs))

        # MACD (12, 26, 9)
        ema_12 = close.ewm(span=12, adjust=False).mean()
        ema_26 = close.ewm(span=26, adjust=False).mean()
        calc_df["MACD"] = ema_12 - ema_26
        calc_df["MACD_Signal"] = calc_df["MACD"].ewm(span=9, adjust=False).mean()
        calc_df["MACD_Hist"] = calc_df["MACD"] - calc_df["MACD_Signal"]

        # Bollinger Bands (20, 2)
        bb_middle = close.rolling(window=20).mean()
        bb_std = close.rolling(window=20).std()
        calc_df["BB_Middle"] = bb_middle
        calc_df["BB_Upper"] = bb_middle + (bb_std * 2)
        calc_df["BB_Lower"] = bb_middle - (bb_std * 2)

        # Daily Returns
        calc_df["Daily_Return"] = close.pct_change() * 100

        return calc_df

    @staticmethod
    def classify_trend(latest_row: pd.Series) -> Tuple[str, List[str]]:
        reasons = []
        score = 0
        close = latest_row["Close"]
        sma_20 = latest_row.get("SMA_20")
        sma_50 = latest_row.get("SMA_50")
        rsi = latest_row.get("RSI_14")
        macd = latest_row.get("MACD")
        macd_signal = latest_row.get("MACD_Signal")
        bb_middle = latest_row.get("BB_Middle")

        # 1. Price vs SMA 20
        if pd.notna(sma_20):
            if close > sma_20:
                score += 1
                reasons.append(f"Price ({close:.2f}) trades above the 20-day SMA ({sma_20:.2f}), confirming short-term buyer interest.")
            else:
                score -= 1
                reasons.append(f"Price ({close:.2f}) trades below the 20-day SMA ({sma_20:.2f}), indicating short-term selling pressure.")

        # 2. SMA 20 vs SMA 50
        if pd.notna(sma_20) and pd.notna(sma_50):
            if sma_20 > sma_50:
                score += 1
                reasons.append(f"The 20-day SMA ({sma_20:.2f}) is positioned above the 50-day SMA ({sma_50:.2f}), indicating an upward trend alignment.")
            else:
                score -= 1
                reasons.append(f"The 20-day SMA ({sma_20:.2f}) is below the 50-day SMA ({sma_50:.2f}), pointing to intermediate downward bias.")

        # 3. RSI 14
        if pd.notna(rsi):
            if rsi >= 60:
                score += 1
                reasons.append(f"RSI-14 is elevated at {rsi:.1f}, reflecting solid buying velocity.")
            elif rsi <= 40:
                score -= 1
                reasons.append(f"RSI-14 is subdued at {rsi:.1f}, reflecting prevailing seller dominance.")
            else:
                reasons.append(f"RSI-14 is balanced at {rsi:.1f}, indicating neutral momentum.")

        # 4. MACD vs Signal
        if pd.notna(macd) and pd.notna(macd_signal):
            if macd > macd_signal:
                score += 1
                reasons.append("MACD line sits above the Signal line, showing positive momentum acceleration.")
            else:
                score -= 1
                reasons.append("MACD line sits below the Signal line, indicating negative momentum convergence.")

        # 5. Position inside Bollinger Bands
        if pd.notna(bb_middle):
            if close > bb_middle:
                score += 1
                reasons.append("Price is in the upper half of Bollinger Bands.")
            else:
                score -= 1
                reasons.append("Price is in the lower half of Bollinger Bands.")

        if score >= 2:
            trend = "Bullish"
        elif score <= -2:
            trend = "Bearish"
        else:
            trend = "Sideways"

        return trend, reasons

    @staticmethod
    def get_indicators_response(symbol: str) -> TechnicalIndicatorsResponse:
        quote = stock_service.get_quote(symbol)
        # Fetch 1 year of data to calculate 50-day SMA and smoothed RSI cleanly
        raw_df = stock_service.get_history_df(symbol, period="1y")
        calc_df = IndicatorService.calculate_indicators(raw_df)

        series: List[IndicatorPoint] = []
        for _, row in calc_df.iterrows():
            def safe_val(col):
                val = row.get(col)
                return round(float(val), 2) if pd.notna(val) else None

            series.append(
                IndicatorPoint(
                    date=str(row["Date"]),
                    close=round(float(row["Close"]), 2),
                    sma_20=safe_val("SMA_20"),
                    sma_50=safe_val("SMA_50"),
                    ema_20=safe_val("EMA_20"),
                    rsi_14=safe_val("RSI_14"),
                    macd=safe_val("MACD"),
                    macd_signal=safe_val("MACD_Signal"),
                    macd_hist=safe_val("MACD_Hist"),
                    bb_upper=safe_val("BB_Upper"),
                    bb_middle=safe_val("BB_Middle"),
                    bb_lower=safe_val("BB_Lower"),
                    daily_return=safe_val("Daily_Return")
                )
            )

        latest_row = calc_df.iloc[-1]
        trend, reasons = IndicatorService.classify_trend(latest_row)

        summary = IndicatorSummary(
            current_price=round(float(latest_row["Close"]), 2),
            sma_20=series[-1].sma_20,
            sma_50=series[-1].sma_50,
            ema_20=series[-1].ema_20,
            rsi_14=series[-1].rsi_14,
            macd=series[-1].macd,
            macd_signal=series[-1].macd_signal,
            macd_hist=series[-1].macd_hist,
            bb_upper=series[-1].bb_upper,
            bb_middle=series[-1].bb_middle,
            bb_lower=series[-1].bb_lower,
            daily_return=series[-1].daily_return
        )

        return TechnicalIndicatorsResponse(
            symbol=quote.symbol,
            name=quote.name,
            current_values=summary,
            trend=trend,
            trend_reasons=reasons,
            explanations=EXPLANATIONS,
            series=series
        )

indicator_service = IndicatorService()
