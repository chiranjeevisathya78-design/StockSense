import logging
from typing import List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

logger = logging.getLogger("stocksense.database")

class DatabaseManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_connected: bool = False
        self._in_memory_watchlist: set = {"RELIANCE.NS", "AAPL", "TCS.NS", "NVDA"}

    def connect(self):
        try:
            self.client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1500)
            # Trigger server selection check
            self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            logger.info("Successfully connected to MongoDB database: %s", settings.DATABASE_NAME)
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            self.is_connected = False
            self.client = None
            self.db = None
            logger.warning("MongoDB not reachable (%s). Falling back to resilient Demo Mode.", str(e))

    def get_watchlist(self, user_id: str = "demo_user") -> List[str]:
        if self.is_connected and self.db is not None:
            try:
                record = self.db.watchlists.find_one({"user_id": user_id})
                if record and "symbols" in record:
                    return list(record["symbols"])
                return list(self._in_memory_watchlist)
            except Exception as e:
                logger.error("Error reading MongoDB watchlist: %s", e)
        return sorted(list(self._in_memory_watchlist))

    def add_to_watchlist(self, symbol: str, user_id: str = "demo_user") -> List[str]:
        cleaned_symbol = symbol.strip().upper()
        self._in_memory_watchlist.add(cleaned_symbol)
        
        if self.is_connected and self.db is not None:
            try:
                self.db.watchlists.update_one(
                    {"user_id": user_id},
                    {"$addToSet": {"symbols": cleaned_symbol}},
                    upsert=True
                )
            except Exception as e:
                logger.error("Error writing to MongoDB watchlist: %s", e)
                
        return self.get_watchlist(user_id)

    def remove_from_watchlist(self, symbol: str, user_id: str = "demo_user") -> List[str]:
        cleaned_symbol = symbol.strip().upper()
        if cleaned_symbol in self._in_memory_watchlist:
            self._in_memory_watchlist.remove(cleaned_symbol)
            
        if self.is_connected and self.db is not None:
            try:
                self.db.watchlists.update_one(
                    {"user_id": user_id},
                    {"$pull": {"symbols": cleaned_symbol}}
                )
            except Exception as e:
                logger.error("Error removing from MongoDB watchlist: %s", e)
                
        return self.get_watchlist(user_id)

db_manager = DatabaseManager()
