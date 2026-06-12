# ChronoNutrition (Full Stack)

ChronoNutrition is an intelligent, timing-aware nutrition platform that helps users discover when, why, and what natural foods to eat for optimal health and performance.

## Technology Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend:** FastAPI (Python), SQLAlchemy, SQLite
- **Database:** Fully seeded with 20+ detail-rich ingredients (fruits, vegetables, herbs, spices, nuts, seeds)

---

## Launch Instructions

To launch the full stack application locally:

### 1. Launch FastAPI Backend
Open a terminal, navigate to the `backend/` directory, activate the virtual environment, and start the Uvicorn server:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
The backend API will run at `http://localhost:8000`.

### 2. Launch Next.js Frontend
Open another terminal, navigate to the `frontend/` directory, and start the development server:
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser to view the application dashboard.
