"""
Database module for Finance Dashboard.
Handles SQLite database operations.
"""
import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from contextlib import contextmanager

DB_PATH = "/data/finance.db"


@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH, timeout=20)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def init_db():
    """Initialize categories if needed."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'")
        if not cursor.fetchone():
            cursor.execute('''
                CREATE TABLE categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    type TEXT NOT NULL,
                    color TEXT DEFAULT '#000000',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')

        default_categories = [
            ("Food & Dining", "expense", "#FF6384"),
            ("Food", "expense", "#FF6384"),
            ("Transportation", "expense", "#36A2EB"),
            ("Transport", "expense", "#36A2EB"),
            ("Shopping", "expense", "#FFCE56"),
            ("Entertainment", "expense", "#4BC0C0"),
            ("Bills & Utilities", "expense", "#9966FF"),
            ("Healthcare", "expense", "#FF9F40"),
            ("Housing", "expense", "#FF5722"),
            ("Family", "expense", "#E91E63"),
            ("Transfer", "expense", "#9E9E9E"),
            ("Salary", "income", "#4CAF50"),
            ("Freelance", "income", "#8BC34A"),
            ("Investments", "income", "#CDDC39"),
            ("Other Income", "income", "#009688"),
            ("Miscellaneous", "expense", "#9E9E9E"),
        ]

        cursor.execute('SELECT COUNT(*) FROM categories')
        if cursor.fetchone()[0] == 0:
            for category in default_categories:
                cursor.execute('INSERT OR IGNORE INTO categories (name, type, color) VALUES (?, ?, ?)', category)


def _parse_items(description: str):
    """Simple parser to count and split items in description."""
    if not description:
        return []
    # Check for items in parentheses or comma separated
    import re
    # Try to extract items from inside parentheses first e.g. "Name (item1, item2)"
    paren_match = re.search(r'\((.*?)\)', description)
    if paren_match:
        items_str = paren_match.group(1)
        items = [i.strip() for i in items_str.split(',') if i.strip()]
        if items: return items
    
    # Otherwise just split by comma
    items = [i.strip() for i in description.split(',') if i.strip()]
    return items if len(items) > 1 else []


def get_transactions(filters: Optional[Dict[str, Any]] = None) -> List[Dict]:
    """Fetch transactions with optional filters and real items from the items table."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = """
            SELECT id, date, amount, category, description, 'expense' as transaction_type, platform
            FROM transactions WHERE 1=1
        """
        params = []

        if filters:
            if filters.get('date_from'):
                query += " AND date >= ?"
                params.append(filters['date_from'])
            if filters.get('date_to'):
                query += " AND date <= ?"
                params.append(filters['date_to'])
            if filters.get('category'):
                query += " AND category = ?"
                params.append(filters['category'])
            if filters.get('platform'):
                query += " AND platform = ?"
                params.append(filters['platform'])

        query += " ORDER BY date DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()

        result = []
        for row in rows:
            d = dict(row)
            # Fetch real items from 'items' table
            cursor.execute("SELECT name, quantity, unit_price FROM items WHERE transaction_id = ?", (d['id'],))
            db_items = cursor.fetchall()
            
            if db_items:
                items = [
                    {
                        "name": item['name'],
                        "quantity": item['quantity'],
                        "unit_price": item['unit_price'],
                        "formatted": f"{item['name']} (x{int(item['quantity'])})" if item['quantity'] > 1 else item['name']
                    }
                    for item in db_items
                ]
                d['items'] = items
                d['item_count'] = len(items)
            else:
                # Fallback to description parsing
                parsed_names = _parse_items(d['description'])
                d['items'] = [{"name": name, "quantity": 1, "unit_price": 0, "formatted": name} for name in parsed_names]
                d['item_count'] = len(parsed_names)
                
            result.append(d)
        return result


def get_transaction_by_id(transaction_id: str) -> Optional[Dict]:
    """Fetch a single transaction by ID with real items."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT *, "expense" as transaction_type FROM transactions WHERE id = ?', (transaction_id,))
        row = cursor.fetchone()
        if not row: return None
        d = dict(row)
        
        # Fetch real items
        cursor.execute("SELECT name, quantity, unit_price FROM items WHERE transaction_id = ?", (transaction_id,))
        db_items = cursor.fetchall()
        
        if db_items:
            items = [
                {
                    "name": item['name'],
                    "quantity": item['quantity'],
                    "unit_price": item['unit_price'],
                    "formatted": f"{item['name']} (x{int(item['quantity'])})" if item['quantity'] > 1 else item['name']
                }
                for item in db_items
            ]
            d['items'] = items
            d['item_count'] = len(items)
        else:
            parsed_names = _parse_items(d['description'])
            d['items'] = [{"name": name, "quantity": 1, "unit_price": 0, "formatted": name} for name in parsed_names]
            d['item_count'] = len(parsed_names)
            
        return d


def get_summary_by_category(filters: Optional[Dict[str, Any]] = None) -> List[Dict]:
    """Get transaction summary grouped by category."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = 'SELECT category, SUM(amount) as total, COUNT(*) as count FROM transactions WHERE 1=1'
        params = []
        if filters:
            if filters.get('date_from'):
                query += " AND date >= ?"
                params.append(filters['date_from'])
            if filters.get('date_to'):
                query += " AND date <= ?"
                params.append(filters['date_to'])
        query += " GROUP BY category ORDER BY total DESC"
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def get_summary_by_date(filters: Optional[Dict[str, Any]] = None) -> List[Dict]:
    """Get transaction summary grouped by date for trend chart."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # We need to decide the grouping level based on range
        # Default to day
        group_format = '%Y-%m-%d'
        
        query = f"SELECT strftime('{group_format}', date) as date, SUM(amount) as total, COUNT(*) as count FROM transactions WHERE 1=1"
        params = []
        
        if filters:
            if filters.get('date_from'):
                query += " AND date >= ?"
                params.append(filters['date_from'])
            if filters.get('date_to'):
                query += " AND date <= ?"
                params.append(filters['date_to'])

        query += f" GROUP BY strftime('{group_format}', date) ORDER BY date ASC"
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def get_category_colors() -> Dict[str, str]:
    """Get category color mappings."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT name, color FROM categories')
        return {row['name']: row['color'] for row in cursor.fetchall()}


def get_all_categories() -> List[Dict]:
    """Get all categories."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM categories ORDER BY type, name')
        return [dict(row) for row in cursor.fetchall()]


def get_balance(filters: Optional[Dict[str, Any]] = None) -> Dict[str, float]:
    """Get total summary."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = 'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE 1=1'
        params = []
        if filters:
            if filters.get('date_from'):
                query += " AND date >= ?"
                params.append(filters['date_from'])
            if filters.get('date_to'):
                query += " AND date <= ?"
                params.append(filters['date_to'])
        cursor.execute(query, params)
        expenses = cursor.fetchone()['total']
        return {
            'income': 0,
            'expenses': expenses,
            'balance': -expenses
        }


def update_transaction(transaction_id: str, **kwargs) -> int:
    """Update transaction details and return the updated transaction ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        updates = []
        params = []

        if 'description' in kwargs:
            updates.append("description = ?")
            params.append(kwargs['description'])
        if 'category' in kwargs:
            updates.append("category = ?")
            params.append(kwargs['category'])
        if 'amount' in kwargs:
            updates.append("amount = ?")
            params.append(kwargs['amount'])
        if 'date' in kwargs:
            updates.append("date = ?")
            params.append(kwargs['date'])
        if 'platform' in kwargs:
            updates.append("platform = ?")
            params.append(kwargs['platform'])

        if not updates:
            return transaction_id

        params.append(transaction_id)
        query = f"UPDATE transactions SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        return transaction_id


def create_transaction(description: str, amount: float, category: str, date: str,
                       platform: Optional[str] = None, transaction_type: str = 'expense') -> int:
    """Create a new transaction and return the transaction ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO transactions (description, amount, category, date, platform, transaction_type)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (description, amount, category, date, platform, transaction_type))
        return cursor.lastrowid


def delete_transaction(transaction_id: str) -> None:
    """Delete a transaction and all its associated items."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # First delete all items associated with this transaction
        cursor.execute("DELETE FROM items WHERE transaction_id = ?", (transaction_id,))
        # Then delete the transaction
        cursor.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))


def add_item(transaction_id: str, name: str, quantity: int, unit_price: float) -> int:
    """Add an item to a transaction and return the item ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO items (transaction_id, name, quantity, unit_price)
            VALUES (?, ?, ?, ?)
        ''', (transaction_id, name, quantity, unit_price))
        return cursor.lastrowid


def update_item(item_id: int, **kwargs) -> Dict:
    """Update an item in the database and return the updated item data."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        updates = []
        params = []

        if 'name' in kwargs:
            updates.append("name = ?")
            params.append(kwargs['name'])
        if 'quantity' in kwargs:
            updates.append("quantity = ?")
            params.append(kwargs['quantity'])
        if 'unit_price' in kwargs:
            updates.append("unit_price = ?")
            params.append(kwargs['unit_price'])

        if not updates:
            return get_item_by_id(item_id)

        params.append(item_id)
        query = f"UPDATE items SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)

        return get_item_by_id(item_id)


def delete_item(item_id: int) -> None:
    """Delete an item from the database."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM items WHERE id = ?", (item_id,))


def get_item_by_id(item_id: int) -> Dict:
    """Get an item by ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM items WHERE id = ?', (item_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return dict(row)
