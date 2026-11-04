from typing import List, Dict, Any
from app.services.stock_service import stock_service
from app.services.indicator_service import indicator_service
from app.ml.prediction_engine import prediction_engine
from app.models.schemas import MarketInsightResponse

class InsightEngine:
    @staticmethod
    def generate_insights(symbol: str) -> MarketInsightResponse:
        quote = stock_service.get_quote(symbol)
        indicators_resp = indicator_service.get_indicators_response(symbol)
        vals = indicators_resp.current_values
        trend = indicators_resp.trend
        
        # Get ML prediction
        prediction_resp = prediction_engine.train_and_predict(symbol)
        pred_price = prediction_resp.predicted_next_day_price
        pred_pct = prediction_resp.estimated_change_percent
        pred_model = prediction_resp.selected_model

        bullet_insights: List[Dict[str, str]] = []

        # 1. Moving Averages Analysis
        ma_title = "Moving Average Trajectory"
        if vals.sma_20 and vals.sma_50:
            if vals.current_price > vals.sma_20 and vals.sma_20 > vals.sma_50:
                ma_desc = (
                    f"The stock is trading at {vals.current_price:.2f}, holding well above its 20-day SMA ({vals.sma_20:.2f}) "
                    f"and 50-day SMA ({vals.sma_50:.2f}). This sequential alignment reflects a sound intermediate uptrend."
                )
                sentiment_ma = "Bullish"
            elif vals.current_price < vals.sma_20 and vals.sma_20 < vals.sma_50:
                ma_desc = (
                    f"Price ({vals.current_price:.2f}) remains depressed below its 20-day SMA ({vals.sma_20:.2f}) "
                    f"and 50-day SMA ({vals.sma_50:.2f}), confirming an established intermediate downtrend."
                )
                sentiment_ma = "Bearish"
            else:
                ma_desc = (
                    f"The price action is consolidating near its moving averages (20-day SMA: {vals.sma_20:.2f}, "
                    f"50-day SMA: {vals.sma_50:.2f}), indicating lack of unified directional conviction."
                )
                sentiment_ma = "Neutral"
            bullet_insights.append({"category": ma_title, "sentiment": sentiment_ma, "detail": ma_desc})

        # 2. RSI Condition
        if vals.rsi_14 is not None:
            rsi_title = "Relative Strength (RSI-14)"
            if vals.rsi_14 >= 70:
                rsi_desc = (
                    f"RSI-14 is elevated at {vals.rsi_14:.1f}, entering the overbought threshold (>70). "
                    "While strong momentum is present, buyers should beware of potential mean-reversion pauses."
                )
                sentiment_rsi = "Caution (Overbought)"
            elif vals.rsi_14 <= 30:
                rsi_desc = (
                    f"RSI-14 is depressed at {vals.rsi_14:.1f}, in oversold territory (<30). "
                    "Heavy selling has unfolded, which can periodically precede a technical bounce or stabilization."
                )
                sentiment_rsi = "Oversold"
            elif vals.rsi_14 >= 50:
                rsi_desc = (
                    f"RSI-14 sits at {vals.rsi_14:.1f}, in constructive territory above the 50 centerline, "
                    "showing active bullish momentum without excessive overheating."
                )
                sentiment_rsi = "Positive"
            else:
                rsi_desc = (
                    f"RSI-14 is measured at {vals.rsi_14:.1f}, sliding below the 50 neutral mark, "
                    "indicating mild seller dominance over recent trading cycles."
                )
                sentiment_rsi = "Negative"
            bullet_insights.append({"category": rsi_title, "sentiment": sentiment_rsi, "detail": rsi_desc})

        # 3. MACD Momentum
        if vals.macd is not None and vals.macd_signal is not None:
            macd_title = "MACD Momentum Dynamics"
            if vals.macd > vals.macd_signal and vals.macd > 0:
                macd_desc = (
                    f"MACD line ({vals.macd:.2f}) is expanding positively above its signal line ({vals.macd_signal:.2f}). "
                    "Momentum velocity is in buyers' favor."
                )
                sentiment_macd = "Bullish"
            elif vals.macd < vals.macd_signal and vals.macd < 0:
                macd_desc = (
                    f"MACD line ({vals.macd:.2f}) is declining beneath its signal line ({vals.macd_signal:.2f}). "
                    "Downside momentum is currently accelerating."
                )
                sentiment_macd = "Bearish"
            else:
                macd_desc = (
                    f"MACD ({vals.macd:.2f}) is hovering near the signal line ({vals.macd_signal:.2f}), "
                    "reflecting a transitional phase or slowing trend velocity."
                )
                sentiment_macd = "Neutral"
            bullet_insights.append({"category": macd_title, "sentiment": sentiment_macd, "detail": macd_desc})

        # 4. Volatility & Bollinger Bands
        if vals.bb_upper and vals.bb_lower and vals.bb_middle:
            bb_title = "Volatility & Bollinger Bands"
            band_width = ((vals.bb_upper - vals.bb_lower) / vals.bb_middle) * 100
            if vals.current_price >= vals.bb_upper:
                bb_desc = (
                    f"Price ({vals.current_price:.2f}) is probing the upper Bollinger Band ({vals.bb_upper:.2f}). "
                    "Asset is trading at the upper end of its standard deviation envelope."
                )
                sentiment_bb = "Stretched High"
            elif vals.current_price <= vals.bb_lower:
                bb_desc = (
                    f"Price ({vals.current_price:.2f}) has drifted to the lower Bollinger Band ({vals.bb_lower:.2f}). "
                    "Asset is trading near the floor of its recent standard deviation range."
                )
                sentiment_bb = "Stretched Low"
            else:
                bb_desc = (
                    f"Price is fluctuating comfortably between the lower band ({vals.bb_lower:.2f}) and upper band "
                    f"({vals.bb_upper:.2f}) with a normalized bandwidth of {band_width:.1f}%."
                )
                sentiment_bb = "Normal Volatility"
            bullet_insights.append({"category": bb_title, "sentiment": sentiment_bb, "detail": bb_desc})

        # ML Forecast perspective
        if pred_pct > 0.5:
            ml_perspective = (
                f"The {pred_model} model projects an estimated next-session closing price of "
                f"{quote.currency} {pred_price:.2f} (+{pred_pct:.2f}% from latest close of {vals.current_price:.2f}). "
                "The quantitative feature set currently leans upward."
            )
        elif pred_pct < -0.5:
            ml_perspective = (
                f"The {pred_model} model projects an estimated next-session closing price of "
                f"{quote.currency} {pred_price:.2f} ({pred_pct:.2f}% from latest close of {vals.current_price:.2f}). "
                "The quantitative feature set currently leans downward."
            )
        else:
            ml_perspective = (
                f"The {pred_model} model projects a relatively flat next-session closing price of "
                f"{quote.currency} {pred_price:.2f} ({pred_pct:+.2f}% change). "
                "Feature inputs suggest price consolidation around current equilibrium."
            )

        # Overall summary paragraph
        direction_word = "positive" if trend == "Bullish" else ("negative" if trend == "Bearish" else "sideways")
        summary_paragraph = (
            f"{quote.name} ({quote.symbol}) is currently exhibiting an overall {trend.lower()} technical structure. "
            f"The asset trades at {quote.currency} {vals.current_price:.2f}. "
            f"Key indicators demonstrate {direction_word} alignment across moving averages and momentum oscillators. "
            f"However, technical indicators and machine learning forecasts capture statistical tendencies rather than "
            f"guaranteed outcomes; market participants should always cross-reference macroeconomic conditions and broader volume."
        )

        return MarketInsightResponse(
            symbol=quote.symbol,
            name=quote.name,
            current_price=vals.current_price,
            currency=quote.currency,
            overall_sentiment=trend,
            summary_paragraph=summary_paragraph,
            bullet_insights=bullet_insights,
            ml_forecast_perspective=ml_perspective,
            disclaimer=prediction_resp.disclaimer
        )

insight_engine = InsightEngine()
