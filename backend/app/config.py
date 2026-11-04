import os
import json
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "stocksense_db")
    
    _cors_env = os.getenv("CORS_ORIGINS", '["*"]')
    try:
        CORS_ORIGINS = json.loads(_cors_env)
    except Exception:
        CORS_ORIGINS = ["*"]
        
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", 300))

settings = Settings()
