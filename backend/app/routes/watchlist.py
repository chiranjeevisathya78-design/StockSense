from fastapi import APIRouter, Path, HTTPException
from app.database import db_manager
from app.services.stock_service import stock_service
from app.models.schemas import WatchlistResponse, WatchlistAddRequest, StockQuote

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])

@router.get("", response_model=WatchlistResponse)
def get_watchlist():
    symbols = db_manager.get_watchlist()
    items = []
    for s in symbols:
        try:
            quote = stock_service.get_quote(s)
            items.append(quote)
        except Exception:
            # If quote fetch fails for single symbol, continue with others
            pass

    return WatchlistResponse(
        items=items,
        total_count=len(items),
        is_demo_mode=not db_manager.is_connected
    )

@router.post("", response_model=WatchlistResponse)
def add_to_watchlist(req: WatchlistAddRequest):
    symbol = req.symbol.strip().upper()
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol cannot be empty.")
    
    # Verify symbol exists
    try:
        stock_service.get_quote(symbol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot add invalid stock symbol: {symbol}")

    db_manager.add_to_watchlist(symbol)
    return get_watchlist()

@router.delete("/{symbol}", response_model=WatchlistResponse)
def remove_from_watchlist(symbol: str = Path(...)):
    db_manager.remove_from_watchlist(symbol)
    return get_watchlist()
