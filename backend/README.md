# CommunityPulse AI — Enterprise Microservices Backend

This is the complete enterprise-grade microservices backend for **CommunityPulse AI** decision intelligence platform. It runs on **FastAPI (Python 3.12)**, **Google BigQuery**, **Firestore**, **Gemini / Vertex AI**, **Redis**, **Celery**, and **NVIDIA GPU accelerators**.

---

## Technical Architecture

```
                               ┌──────────────────┐
                               │   index.html     │
                               │   (SPA Client)   │
                               └────────┬─────────┘
                                        │ (REST / WebSockets)
                                        ▼
                               ┌──────────────────┐
                               │   API Gateway    │
                               │    (FastAPI)     │
                               └────────┬─────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
   │   Auth & Orgs    │       │   Analytics AI   │       │   GIS spatial    │
   │   (Firestore)    │       │ (Gemini/BigQuery)│       │ (Heatmaps/Route) │
   └──────────────────┘       └──────────────────┘       └──────────────────┘
```

- **API Gateway**: FastAPI routing with CORS, structured logging, and Redis-backed rate limiting.
- **AI Core**: Gemini 2.0 Flash integrations with offline rules model fallback.
- **Analytics Engine**: Custom query logic designed for Google Cloud BigQuery pipelines.
- **GPU Acceleration**: Built-in RAPIDS (cuDF/cupy) detection with automatic CPU fallback.
- **DevOps**: Docker, Docker Compose, Kubernetes Deployments/Services, and GitHub Actions CI/CD workflows.

---

## ⚡ Quick Start

### 1. Configure Environment
Copy `.env.example` to `.env` and configure settings:
```bash
cp .env.example .env
```

### 2. Start Services (Docker Compose)
Start the entire API, Celery worker, and Redis server stack:
```bash
docker-compose up --build
```
The server will start at `http://localhost:8080`.

- **API Gateway Health**: `http://localhost:8080/health`
- **Swagger API Docs (Interactive)**: `http://localhost:8080/docs`

---

## 📚 API Endpoints Summary

### Authentication (`/api/v1/auth`)
- `POST /register`: Registers org workspace & owner profile user.
- `POST /login`: Returns access + refresh tokens.
- `POST /google-login`: Google OAuth SSO using Firebase ID tokens.
- `POST /refresh-token`: Standard OAuth renewal token.
- `GET /profile`: Profile of current user.

### Datasets (`/api/v1/datasets`)
- `POST /upload`: Uploads CSV/Excel/JSON files, running schemas through BQ ETL pipeline.
- `GET /`: Lists all metadata files.
- `GET /{dataset_id}/preview`: Return first 100 rows.

### AI Assistant (`/api/v1/ai`)
- `POST /chat`: Gemini conversational chat queries.
- `POST /summarize`: Auto-summarize files.
- `POST /recommend`: Suggests automated platform recommendations.

### GIS spatial maps (`/api/v1/gis`)
- `GET /heatmap`: Heatmap coordinates.
- `POST /route-optimize`: Optimizes route travel path (TSP).
- `GET /nearby`: POI search for hospitals, schools, police posts.

### Referrals (`/api/v1/referral`)
- `GET /my-code`: View user referral code.
- `POST /validate`: Apply code (`GEMINI50`, etc.) to credit wallet.
- `GET /stats`: Referral statistics.
