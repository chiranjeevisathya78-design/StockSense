import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

class BackendTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["app_name"], "StockSense AI")
        print("[PASS] Health Check Passed:", data)

    def test_02_stock_search(self):
        resp = self.client.get("/api/stocks/search?q=TCS")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(len(data) > 0)
        self.assertTrue(any("TCS" in item["symbol"] for item in data))
        print(f"[PASS] Stock Search Passed: {len(data)} results found for 'TCS'")

    def test_03_stock_quote(self):
        resp = self.client.get("/api/stocks/AAPL")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["symbol"], "AAPL")
        self.assertGreater(data["price"], 0)
        self.assertEqual(data["currency"], "USD")
        print(f"[PASS] US Stock Quote Passed: {data['symbol']} Price={data['price']} {data['currency']}")

    def test_04_indian_stock_quote(self):
        resp = self.client.get("/api/stocks/RELIANCE.NS")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["symbol"], "RELIANCE.NS")
        self.assertGreater(data["price"], 0)
        self.assertEqual(data["currency"], "INR")
        print(f"[PASS] Indian Stock Quote Passed: {data['symbol']} Price={data['price']} {data['currency']}")

    def test_05_stock_history(self):
        resp = self.client.get("/api/stocks/AAPL/history?period=1mo")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["symbol"], "AAPL")
        self.assertGreater(data["count"], 10)
        print(f"[PASS] Stock History Passed: {data['count']} data points retrieved")

    def test_06_technical_indicators(self):
        resp = self.client.get("/api/stocks/AAPL/indicators")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("trend", data)
        self.assertIn(data["trend"], ["Bullish", "Bearish", "Sideways"])
        self.assertIn("sma_20", data["explanations"])
        self.assertIsNotNone(data["current_values"]["rsi_14"])
        print(f"[PASS] Technical Indicators Passed: Trend={data['trend']}, RSI-14={data['current_values']['rsi_14']}")

    def test_07_ml_prediction_and_evaluation(self):
        resp = self.client.get("/api/stocks/AAPL/predict")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["symbol"], "AAPL")
        self.assertGreater(data["predicted_next_day_price"], 0)
        self.assertIn(data["selected_model"], ["Random Forest Regressor", "Linear Regression"])
        self.assertEqual(len(data["models_evaluation"]), 3)
        print(f"[PASS] ML Prediction Passed: Next Day Price = {data['predicted_next_day_price']} ({data['estimated_change_percent']}%) via {data['selected_model']}")
        for m in data["models_evaluation"]:
            print(f"       -> {m['model_name']}: MAE={m['mae']}, RMSE={m['rmse']}, DirAcc={m['directional_accuracy']}%")

    def test_08_market_insights(self):
        resp = self.client.get("/api/stocks/AAPL/insights")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("summary_paragraph", data)
        self.assertTrue(len(data["bullet_insights"]) >= 3)
        print(f"[PASS] Market Insights Passed: {data['summary_paragraph'][:80]}...")

    def test_09_watchlist_operations(self):
        resp = self.client.get("/api/watchlist")
        self.assertEqual(resp.status_code, 200)

        add_resp = self.client.post("/api/watchlist", json={"symbol": "MSFT"})
        self.assertEqual(add_resp.status_code, 200)
        self.assertTrue(any(item["symbol"] == "MSFT" for item in add_resp.json()["items"]))

        del_resp = self.client.delete("/api/watchlist/MSFT")
        self.assertEqual(del_resp.status_code, 200)
        self.assertFalse(any(item["symbol"] == "MSFT" for item in del_resp.json()["items"]))
        print("[PASS] Watchlist CRUD Operations Passed (with fallback demo mode)")

    def test_10_invalid_symbol_handling(self):
        resp = self.client.get("/api/stocks/INVALIDXYZ123456")
        self.assertEqual(resp.status_code, 404)
        print("[PASS] Invalid Symbol Rejection Passed (HTTP 404 returned)")

if __name__ == "__main__":
    unittest.main()
