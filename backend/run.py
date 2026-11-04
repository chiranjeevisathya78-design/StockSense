import sys
import os
import uvicorn

# Ensure the backend directory is in the python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config import settings

if __name__ == "__main__":
    print(f"Starting StockSense AI Backend on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
