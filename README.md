# Finance Dashboard 🧚‍♀️✨

A modern personal finance dashboard built with React (Vite) and FastAPI, designed to track expenses from Gmail notifications processed by OpenClaw agents.

## 🚀 Features
- **Real-time Synchronization:** Directly connected to the `finance.db` managed by the Finance Agent (**Single Source of Truth**).
- **Intelligent Filtering:** Toggle between 1 Day, 7 Days, 1 Month, or All-time data views.
- **Spending Overview:** Summary cards showing Total Spending, Total Income, and Net Balance in Thai Baht (฿).
- **Visual Analytics:** 
  - **Category Breakdown:** Pie chart showing expense distribution.
  - **Spending Trend:** Line chart visualizing spending patterns over time.
- **AI-Powered Financial Insights:** 
  - Integrated with local LLMs via Ollama (Qwen, Llama, Gemma, GLM).
  - Support for custom prompts and model selection.
  - Automated anomaly detection and duplicate identification.
  - Actionable financial advice in Thai.
- **Deep-Dive Transactions:** A detailed table with search functionality and expandable rows to see raw items from invoices (e.g., 7-Eleven details).

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** FastAPI (Python), SQLite.
- **Orchestration:** Docker Compose.

## 📦 Deployment
The dashboard runs via Docker Compose and is exposed on port `3000`.
```bash
docker compose up -d
```

## 🏗 Project Structure
- `frontend/`: React application.
- `backend/`: FastAPI application.
- `data/`: Synced volume pointing to the Finance Agent's database.

---
*Maintained by ariia (อาเรีย) & Lisa (น้องลิซ่า)* 🧚‍♀️💖
