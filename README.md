<div align="center">

# ✈️ TripWise AI

### ML-Powered Travel Intelligence Platform

*Personalized tour recommendations, demand-adjusted pricing, and an AI travel concierge — all in one app.*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML%20Model-red)](https://xgboost.readthedocs.io/)
[![Gemini](https://img.shields.io/badge/Gemini-AI%20Concierge-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

</div>

---

## 📖 Overview

TripWise AI is a full-stack travel platform that combines a **trained XGBoost pricing model**, a **hybrid recommendation engine** (content-based + collaborative filtering), and a **Gemini-powered conversational concierge** into a single React experience — helping travelers find the right tour package and understand exactly why a price is what it is.

This isn't a UI mockup with fake numbers. The pricing and recommendation logic is backed by a real model trained on booking data, served by a dedicated Python API.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🎯 | **Smart Recommendations** | Hybrid engine blending content similarity and collaborative filtering, weighted across category fit, budget, popularity, group size, ratings, and seasonality |
| 💰 | **Price Intelligence** | Real XGBoost regression model predicts demand-adjusted pricing from lead time, seasonality, destination popularity, and group size |
| 🤖 | **AI Concierge** | Gemini-powered chatbot for natural-language trip planning and Q&A |
| 🎙️ | **Voice Conversation** | Live voice interaction via the Gemini Live API |
| 📊 | **Analytics Dashboard** | Visual breakdown of pricing trends, booking patterns, and package performance |
| 🗺️ | **Trip Planner** | Build and visualize multi-day itineraries with a drag-friendly timeline |
| 🔍 | **Discover & Compare** | Browse the full package catalog and compare options side by side |
| 📄 | **PDF Export** | Export itineraries and price breakdowns as shareable documents |

---

## 🏗️ Architecture

TripWise AI runs as **two independent services** that talk to each other over HTTP:

```
┌─────────────────────────┐         ┌──────────────────────────┐
│   React Frontend (Vite)  │         │   Node/Express Server     │
│   src/views, components  │◄───────►│   server.ts                │
│   port 3000               │  /api  │   → Gemini chat & voice    │
└─────────────┬─────────────┘         └──────────────────────────┘
              │
              │  fetch()
              ▼
┌──────────────────────────┐
│   Python ML API (FastAPI) │
│   ml_server.py             │
│   port 8000                 │
│   → /predict-price          │
│   → /recommend/{user_id}    │
│   → /similar-packages/{id}  │
└──────────────┬───────────┘
               │ loads at startup
               ▼
┌──────────────────────────┐
│   models/  (trained .pkl) │
│   pricing_model.pkl        │
│   content_similarity.pkl   │
│   cf_predictions.pkl        │
│   rating_matrix.pkl          │
└──────────────────────────┘
```

- **`server.ts`** — Express server handling the Gemini chat/voice endpoints (`/api/chat`, `/api/chat/stream`, `/api/live`) and serving the built frontend in production.
- **`ml_server.py`** — FastAPI service loading the trained pricing and recommendation models, exposing them as REST endpoints.
- The React app calls both: `server.ts` for the AI concierge, `ml_server.py` for pricing/recommendations.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- A **Gemini API key** — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd tripwise-ai

npm install
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 2. Configure environment variables

Copy the example file and fill in your key:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"

MODELS_DIR="models"
PACKAGES_CSV="packages.csv"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
VITE_ML_API_URL="http://localhost:8000"
```

### 3. Run both servers

```bash
# Terminal 1 — ML API (pricing & recommendations)
uvicorn ml_server:app --reload --port 8000

# Terminal 2 — Frontend + Gemini server
npm run dev
```

Open **http://localhost:3000** 🎉

### 4. Verify the ML backend is healthy

```bash
curl http://localhost:8000/health
```
```json
{
  "status": "ok",
  "pricing_model_loaded": true,
  "content_similarity_loaded": true,
  "cf_predictions_loaded": true,
  "rating_matrix_loaded": true,
  "packages_loaded": true,
  "errors": []
}
```

---

## 🧠 The ML Layer

| Model | Type | Trained on |
|---|---|---|
| **Pricing Model** | XGBoost Regressor | Lead time, seasonality, destination popularity, group size, category, duration |
| **Content Similarity** | Cosine similarity matrix | Package feature vectors |
| **Collaborative Filtering** | Truncated SVD | User × package rating matrix |
| **Hybrid Recommender** | Weighted blend (α-tunable) | CF scores + content similarity |

The notebook used to train these lives outside this repo's runtime path — see `tour_package_pricing_and_recs.ipynb` for the full training pipeline, feature engineering, and evaluation.

### API Reference (`ml_server.py`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Reports which model artifacts loaded successfully |
| `POST` | `/predict-price` | Returns a demand-adjusted price for a package/date/group size |
| `GET` | `/similar-packages/{package_id}` | Content-based similar packages |
| `GET` | `/recommend/{user_id}` | Hybrid personalized recommendations |

Interactive docs available at `http://localhost:8000/docs` once running.

---

## 📁 Project Structure

```
tripwise-ai/
├── src/
│   ├── components/       # Reusable UI (chatbot, cards, modals, widgets)
│   ├── views/             # Page-level views (Home, Discover, Pricing, Planner, ...)
│   ├── lib/                # mlEngine.ts, pdfExport.ts — client-side logic & API calls
│   ├── data/                # Static/demo datasets used by the UI
│   └── types.ts              # Shared TypeScript types
├── ml_server.py                # FastAPI backend serving the trained models
├── models/                      # Trained model artifacts (.pkl)
├── packages.csv                  # Tour package catalog
├── requirements.txt               # Python dependencies
├── server.ts                       # Express server (Gemini chat/voice + static hosting)
├── package.json
└── .env.example
```

---

## 🛠️ Tech Stack

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · Framer Motion · Recharts-style custom SVG charts
**Backend:** Express (Node) · FastAPI (Python)
**ML:** XGBoost · scikit-learn · TruncatedSVD (collaborative filtering)
**AI:** Google Gemini API (chat + live voice)
**Export:** jsPDF, html2canvas for itinerary/report downloads

---

## 🚢 Deployment

The frontend/Express server and the Python ML API deploy as **two separate services**.

1. **Frontend + Gemini server** → Cloud Run, Render, Railway, or Vercel
   - Build: `npm run build`
   - Start: `npm start`
   - Set `GEMINI_API_KEY`, `APP_URL`, and `VITE_ML_API_URL` (pointing to your deployed ML API) as environment variables in your host's dashboard

2. **ML API** → Render, Railway, or Fly.io (any host that runs a Python process)
   - Start: `uvicorn ml_server:app --host 0.0.0.0 --port $PORT`
   - Set `ALLOWED_ORIGINS` to your deployed frontend's URL

> 🔐 **Never commit `.env`.** All secrets are injected via your hosting platform's environment variable settings, not the repository.

---

## 📄 License

MIT — feel free to fork, adapt, and build on top of this.

---

<div align="center">

Built with React, FastAPI, and a genuinely trained ML pipeline — not a mockup.

</div>
