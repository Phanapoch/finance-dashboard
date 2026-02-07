"""
Main FastAPI application for Finance Dashboard.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from datetime import datetime
from .database import (
    get_transactions,
    get_transaction_by_id,
    get_summary_by_category,
    get_summary_by_date,
    get_category_colors,
    get_all_categories,
    get_balance,
    init_db
)

app = FastAPI(title="Finance Dashboard API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Finance Dashboard API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/transactions")
async def get_transactions_api(
    date_from: Optional[str] = Query(None, description="Filter by date from (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter by date to (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    transaction_type: Optional[str] = Query("expense", description="Filter by transaction type"),
    platform: Optional[str] = Query(None, description="Filter by platform")
) -> Dict[str, Any]:
    """
    Get all transactions with optional filters.

    - **date_from**: Start date filter (YYYY-MM-DD format)
    - **date_to**: End date filter (YYYY-MM-DD format)
    - **category**: Category filter
    - **transaction_type**: Transaction type (expense/income)
    - **platform**: Platform filter (e.g., K PLUS, LINE Pay, Shopee, etc.)
    """
    filters = {}
    if date_from:
        filters['date_from'] = date_from
    if date_to:
        filters['date_to'] = date_to
    if category:
        filters['category'] = category
    if transaction_type:
        filters['transaction_type'] = transaction_type
    if platform:
        filters['platform'] = platform

    transactions = get_transactions(filters)

    return {
        "success": True,
        "data": transactions,
        "count": len(transactions)
    }


@app.get("/api/transactions/{transaction_id}")
async def get_transaction_api(transaction_id: int) -> Dict[str, Any]:
    """
    Get a single transaction by ID.
    """
    transaction = get_transaction_by_id(transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {
        "success": True,
        "data": transaction
    }


@app.get("/api/summary/category")
async def get_summary_by_category_api(
    date_from: Optional[str] = Query(None, description="Filter by date from (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter by date to (YYYY-MM-DD)")
) -> Dict[str, Any]:
    """
    Get transaction summary grouped by category for charts.

    - **date_from**: Start date filter (YYYY-MM-DD format)
    - **date_to**: End date filter (YYYY-MM-DD format)
    """
    filters = {}
    if date_from:
        filters['date_from'] = date_from
    if date_to:
        filters['date_to'] = date_to

    summary = get_summary_by_category(filters)
    category_colors = get_category_colors()

    # Add colors to summary
    result = []
    for item in summary:
        result.append({
            "category": item['category'],
            "amount": item['total'],
            "count": item['count'],
            "color": category_colors.get(item['category'], '#000000')
        })

    return {
        "success": True,
        "data": result,
        "count": len(result)
    }


@app.get("/api/summary/date")
async def get_summary_by_date_api(
    date_from: Optional[str] = Query(None, description="Filter by date from (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter by date to (YYYY-MM-DD)")
) -> Dict[str, Any]:
    """
    Get transaction summary grouped by date.

    - **date_from**: Start date filter (YYYY-MM-DD format)
    - **date_to**: End date filter (YYYY-MM-DD format)
    """
    filters = {}
    if date_from:
        filters['date_from'] = date_from
    if date_to:
        filters['date_to'] = date_to

    summary = get_summary_by_date(filters)

    return {
        "success": True,
        "data": summary,
        "count": len(summary)
    }


@app.get("/api/summary/platform")
async def get_summary_by_platform_api(
    date_from: Optional[str] = Query(None, description="Filter by date from (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter by date to (YYYY-MM-DD)")
) -> Dict[str, Any]:
    """
    Get transaction summary grouped by platform.

    - **date_from**: Start date filter (YYYY-MM-DD format)
    - **date_to**: End date filter (YYYY-MM-DD format)
    """
    filters = {}
    if date_from:
        filters['date_from'] = date_from
    if date_to:
        filters['date_to'] = date_to

    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = '''
            SELECT platform, SUM(amount) as total, COUNT(*) as count
            FROM transactions
            WHERE 1=1
        '''
        params = []

        if filters.get('date_from'):
            query += " AND date >= ?"
            params.append(filters['date_from'])
        if filters.get('date_to'):
            query += " AND date <= ?"
            params.append(filters['date_to'])

        query += " GROUP BY platform ORDER BY total DESC"
        cursor.execute(query, params)
        summary = [dict(row) for row in cursor.fetchall()]

    return {
        "success": True,
        "data": summary,
        "count": len(summary)
    }


@app.get("/api/categories")
async def get_categories_api() -> Dict[str, Any]:
    """
    Get all categories with their colors.
    """
    categories = get_all_categories()
    category_colors = get_category_colors()

    result = []
    for category in categories:
        result.append({
            "id": category['id'],
            "name": category['name'],
            "type": category['type'],
            "color": category['color']
        })

    return {
        "success": True,
        "data": result
    }


@app.get("/api/platforms")
async def get_platforms_api() -> Dict[str, Any]:
    """
    Get all unique platforms from transactions.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT DISTINCT platform
            FROM transactions
            WHERE platform IS NOT NULL
            AND platform != ''
            ORDER BY platform
        ''')
        platforms = [row['platform'] for row in cursor.fetchall()]

    return {
        "success": True,
        "data": platforms
    }


@app.get("/api/balance")
async def get_balance_api() -> Dict[str, Any]:
    """
    Get current balance information.
    """
    balance = get_balance()
    return {
        "success": True,
        "data": balance
    }


@app.get("/api/dashboard")
async def get_dashboard_api(
    date_from: Optional[str] = Query(None, description="Filter by date from (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter by date to (YYYY-MM-DD)")
) -> Dict[str, Any]:
    """
    Get all dashboard data for quick loading.
    """
    filters = {}
    if date_from:
        filters['date_from'] = date_from
    if date_to:
        filters['date_to'] = date_to

    balance = get_balance(filters)
    transactions = get_transactions(filters)
    category_summary = get_summary_by_category(filters)
    date_summary = get_summary_by_date(filters)

    category_colors = get_category_colors()

    return {
        "success": True,
        "data": {
            "balance": balance,
            "transactions": transactions,
            "categorySummary": category_summary,
            "dateSummary": date_summary,
            "categories": get_all_categories()
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)