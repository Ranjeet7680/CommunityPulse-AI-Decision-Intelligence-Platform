# CommunityPulse AI — Decision Intelligence Platform

CommunityPulse AI is an enterprise-grade Decision Intelligence Platform designed to transform large-scale community data into actionable insights. Powered by **Google Cloud AI** (BigQuery, Vertex AI, Gemini 2.0) and **NVIDIA accelerated computing**, the platform empowers governments, NGOs, educational institutions, researchers, and citizens to analyze indicators, predict outcomes, and automate crisis response workflows.

---

## 🏛️ Project Architecture Overview

```
                          +------------------------+
                          |      User Browser      |
                          +-----------+------------+
                                      |
                 +--------------------+--------------------+
                 |                                         |
     [Next.js 15 App Router]                     [SPA index.html]
    frontend/ (React 19 & TS)                 Root Prototype & JS
                 |                                         |
                 +--------------------+--------------------+
                                      |
                            (REST & WebSockets)
                                      v
                          +------------------------+
                          |  FastAPI REST Backend  |
                          |  backend/ (Python)     |
                          +-----------+------------+
                                      |
      +-----------------+-------------+-------------+------------------+
      |                 |                           |                  |
      v                 v                           v                  v
+-----------+    +-------------+              +-----------+      +------------+
| BigQuery  |    | Gemini 2.0  |              |  Celery   |      | NVIDIA GPU |
| Datastore |    | & Vertex AI |              | Workers   |      | (RAPIDS/   |
+-----------+    +-------------+              +-----+-----+      |  CUDA ML)  |
                                                    |            +------------+
                                                    v
                                              +-----------+
                                              | Redis DB  |
                                              +-----------+
```

---

## 📁 Repository Structure

```
Gen AI Academy APAC Edition/
├── index.html              # Cleaned SPA Landing Page & Workspace Overlay
├── app.js                  # Frontend SPA application logic
├── app.css                 # Premium custom design CSS stylesheet
│
├── frontend/               # Next.js 15 Production React App
│   ├── package.json        # NextJS dependencies (Recharts, Zustand, Tailwind)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css  # Material Design 3 Design Tokens
│   │   │   ├── layout.tsx   # Global Next.js app wrapper
│   │   │   ├── page.tsx     # Session view router (SPA switcher)
│   │   │   ├── auth/        # Login/Signup forms with SSO
│   │   │   ├── onboarding/  # 3-Step Workspace onboarding wizard
│   │   │   ├── dashboard/   # Console workspace (13 interactive modules)
│   │   │   └── components/  # LandingPage layout component
│   │   └── lib/
│   │       └── store.ts     # Unified Zustand application state store
│
└── backend/                # FastAPI Microservices Backend
    ├── requirements.txt    # Python packages (fastapi, python-jose, celery, pandas)
    ├── main.py             # Server initialization & WebSocket streams
    ├── app/
    │   ├── core/           # Config settings, JWT authentication, dependencies
    │   ├── models/         # Pydantic schema declarations
    │   ├── routers/        # 12 REST endpoints (GIS, Predictions, Datasets, AI)
    │   ├── services/       # Core domain services (Gemini API, Report generation)
    │   └── utils/          # NVIDIA GPU telemetry & BigQuery query loaders
```

---

## 🚀 Getting Started

### 1. Running the Next.js Frontend Console
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the platform at [http://localhost:3000](http://localhost:3000).

---

### 2. Running the FastAPI Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Initialize the server using Uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8080 --reload
   ```
4. Access the backend health telemetry or Swagger docs at [http://localhost:8080/docs](http://localhost:8080/docs).

---

### 3. Launching the SPA Prototype
Simply double-click the `index.html` file in the root workspace directory or run:
```bash
start index.html
```
This launches a fully functional, zero-install interactive demo website with local simulated databases and state controls.

---

## 🧹 Emoji-Free Clean Compliance
All parts of the platform are free of emoji characters, using Google's **Material Design 3 system** and **Lucide React Icons** instead.
- **Landing solution cards**: Swapped with `corporate_fare`, `local_hospital`, `school`, and `eco`.
- **Data Integrations step**: Structured using clean database, cloud server, and sensor icons.
- **Telemetry Dashboards**: Rendered using modern CSS badges and micro-indicators.
