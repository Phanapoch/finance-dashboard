import json
import requests
from typing import List, Dict, Any

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "qwen3-coder:30b" # Switched to qwen3-coder as requested

def analyze_transactions(transactions: List[Dict[str, Any]], user_prompt: str = None, model_override: str = None) -> Dict[str, Any]:
    """
    Send transactions to Ollama for analysis.
    """
    model = model_override if model_override else DEFAULT_MODEL
    
    # Prepare data for LLM
    data_summary = []
    for t in transactions:
        data_summary.append({
            "id": t['id'],
            "date": t['date'],
            "desc": t['description'],
            "amount": t['amount'],
            "cat": t['category'],
            "platform": t.get('platform', '')
        })

    prompt = f"""
You are a Finance Expert AI. Analyze the following transaction data for the user.
Tasks:
1. Summarize unusual spending patterns (anomalies) in Thai.
2. Find potential duplicate transactions. Criteria for duplicates:
   - MUST have the EXACT SAME amount.
   - MUST be on the EXACT SAME date (day/month/year).
   - Descriptions should be identical or very similar.
   For each duplicate group found, return a list containing objects with "desc", "date", and "amount" for each transaction in that group.
3. Provide actionable advice in Thai.
{f"User specific request: {user_prompt}" if user_prompt else ""}

Return your response in JSON format with the following keys:
- "summary": A brief text summary of the spending in Thai.
- "anomalies": List of transaction objects that look unusual.
- "duplicates": List of lists, where each sub-list contains objects with "desc", "date", and "amount" of transactions that are likely duplicates.
- "advice": A string with financial advice in Thai.

Transactions:
{json.dumps(data_summary, ensure_ascii=False)}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                # "format": "json" # Commented out to test
            },
            timeout=120
        )
        response.raise_for_status()
        result = response.json()
        raw_response = result.get('response', '')
        print(f"Ollama Raw Response: {raw_response[:500]}...") # Print first 500 chars
        
        # Try to find JSON in the response if format:json is disabled
        import re
        json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        return json.loads(raw_response)
    except Exception as e:
        print(f"AI Analysis Error: {str(e)}")
        if 'result' in locals() and 'response' in result:
             print(f"Failed Raw Response: {result['response']}")
        return {
            "error": str(e),
            "summary": "AI Analysis failed.",
            "anomalies": [],
            "duplicates": [],
            "advice": "Please try again later."
        }
