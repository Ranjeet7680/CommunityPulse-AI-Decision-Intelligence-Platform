# CommunityPulse AI

> **AI-Powered Decision Intelligence Platform**  
> Transforming community data into smarter decisions with Google Cloud AI & NVIDIA computing

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-green.svg)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview

**CommunityPulse AI** is an enterprise-grade platform that empowers governments, NGOs, and enterprises to make data-driven decisions using AI-powered analytics, predictive intelligence, and natural language processing.

### Key Capabilities
- 🤖 **AI Assistant** - Gemini-powered conversational analytics
- 📊 **Live Dashboards** - Real-time KPIs and visualizations
- 🗺️ **GIS Mapping** - Interactive spatial analysis with heatmaps
- 📈 **Predictive Analytics** - ML-based forecasting and anomaly detection
- 🔐 **Enterprise Security** - JWT + OAuth authentication, RBAC
- ☁️ **Cloud-Native** - Built on Google Cloud Platform

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Redis (optional, will use mock fallback)
- Web browser (Chrome, Firefox, Edge)

### 1. Clone & Setup Backend

```bash
# Clone repository
git clone <your-repo-url>
cd "Gen AI Academy APAC Edition"

# Setup backend
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Generate secure secret key
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Create .env file
echo "APP_ENV=development" > .env
echo "DEBUG=true" >> .env
echo "SECRET_KEY=your-generated-key-here" >> .env

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend running at**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs

### 2. Serve Frontend

```bash
# In new terminal, from project root
python -m http.server 8080
```

**Frontend running at**: http://localhost:8080

### 3. Test It Out!

1. Open http://localhost:8080
2. Click "Get Started" to register
3. Upload a CSV dataset
4. Ask the AI assistant questions about your data

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**SETUP.md**](SETUP.md) | Complete setup guide with troubleshooting |
| [**CHANGELOG.md**](CHANGELOG.md) | Recent changes and improvements |
| [**PROJECT_SUMMARY.md**](PROJECT_SUMMARY.md) | Architecture and technical overview |
| [**IMPROVEMENTS_COMPLETED.md**](IMPROVEMENTS_COMPLETED.md) | Recent bug fixes and enhancements |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (SPA)                       │
│  HTML5 • CSS3 • Vanilla JS • Leaflet • Canvas Charts   │
└─────────────────────────────────────────────────────────┘
                          ↕ REST API
┌─────────────────────────────────────────────────────────┐
│                 Backend (FastAPI)                       │
│  • Auth (JWT + Firebase)    • AI (Gemini 2.0)         │
│  • Data Processing          • Analytics                 │
│  • GIS Services            • Predictions                │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                 Data & Infrastructure                   │
│  Redis • BigQuery • Firestore • Cloud Storage • Vertex │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🎯 Core Features
- ✅ **AI Chat Assistant** - Ask questions in natural language
- ✅ **Real-time Dashboard** - Live metrics and KPIs
- ✅ **Data Upload** - CSV, Excel, JSON support (50MB max)
- ✅ **Interactive Maps** - Multi-layer GIS visualization
- ✅ **User Management** - Registration, login, profiles
- ✅ **Referral System** - Unique codes and rewards

### 🔒 Security Features
- ✅ JWT authentication with refresh tokens
- ✅ Google OAuth SSO integration
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (100 req/min)
- ✅ Input validation and sanitization
- ✅ Secure password hashing (bcrypt)

### 📊 Analytics Features
- ✅ Custom chart visualizations
- ✅ Anomaly detection
- ✅ Trend analysis
- ✅ Dataset quality validation
- ✅ Automated insights

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI 0.111+
- **Language**: Python 3.12
- **AI**: Google Generative AI (Gemini 2.0 Flash)
- **Data**: Pandas, NumPy, Openpyxl
- **Auth**: python-jose, passlib[bcrypt]
- **Cache**: Redis 7+
- **Async**: Celery, Uvicorn

### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS + Tailwind CDN
- **Maps**: Leaflet.js
- **Charts**: Custom Canvas API
- **Icons**: Material Symbols

### Infrastructure
- **Cloud**: Google Cloud Platform
- **Containers**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

---

## 📁 Project Structure

```
Gen AI Academy APAC Edition/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, security, middleware
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data schemas
│   │   └── workers/       # Background tasks
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── docker-compose.yml
│
├── index.html            # Main frontend
├── app.js               # Frontend logic
├── app.css              # Styles
├── api-config.js        # API client
│
├── SETUP.md             # Setup guide
├── CHANGELOG.md         # Change history
└── README.md            # This file
```

---

## 🔧 Configuration

### Environment Variables

Create `backend/.env`:

```bash
# Required
SECRET_KEY=your-secure-32-char-minimum-key-here
APP_ENV=development
DEBUG=true

# Optional
GEMINI_API_KEY=your-gemini-api-key
REDIS_URL=redis://localhost:6379/0
LOG_LEVEL=INFO
```

**Generate Secure Key**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

See `backend/.env.example` for all configuration options.

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secure123",
    "name": "Test User",
    "org_name": "Test Org"
  }'
```

### Test Frontend
1. Open http://localhost:8080
2. Open DevTools (F12)
3. Check Console for errors
4. Try registering and logging in

---

## 🐳 Docker Deployment

```bash
cd backend

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Services:
- API: http://localhost:8000
- Redis: localhost:6379

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google-login` - Google OAuth
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/refresh-token` - Refresh tokens

### Datasets
- `POST /api/v1/datasets/upload` - Upload dataset
- `GET /api/v1/datasets/` - List datasets
- `GET /api/v1/datasets/{id}` - Get dataset details
- `GET /api/v1/datasets/{id}/preview` - Preview data
- `DELETE /api/v1/datasets/{id}` - Delete dataset

### AI Assistant
- `POST /api/v1/ai-assistant/chat` - Chat with AI
- `POST /api/v1/ai-assistant/summarize-dataset` - Summarize data
- `GET /api/v1/ai-assistant/recommendations` - Get insights

See http://localhost:8000/docs for complete API documentation.

---

## 🔐 Security

### Recent Security Improvements ✅
- Removed hardcoded secrets
- Fixed authentication bypass vulnerability
- Enhanced password requirements (min 8 chars)
- Added comprehensive input validation
- Improved token validation
- Added file upload size limits

See [CHANGELOG.md](CHANGELOG.md) for details.

### Production Checklist
- [ ] Set strong SECRET_KEY (32+ chars)
- [ ] Disable DEBUG mode
- [ ] Configure Firebase properly
- [ ] Set up HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Enable GCP Secret Manager
- [ ] Set up database persistence
- [ ] Configure monitoring & logging
- [ ] Implement rate limiting per user
- [ ] Add automated backups

---

## 🚧 Known Issues

- Mock database (in-memory) - data lost on restart
- File uploads stored in memory (not persistent)
- No automated test suite yet
- Some GCP services are mocked for offline development

See [CHANGELOG.md](CHANGELOG.md) for complete list and planned fixes.

---

## 🗺️ Roadmap

### Phase 1: Stability (Current)
- [x] Security hardening
- [x] Input validation
- [x] Documentation
- [ ] Automated tests
- [ ] Real database integration

### Phase 2: Features
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Report generation
- [ ] Data export

### Phase 3: Scale
- [ ] Multi-tenancy
- [ ] Advanced ML models
- [ ] Real-time WebSockets
- [ ] Marketplace
- [ ] White-label solution

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

[Add your license here - e.g., MIT, Apache 2.0]

---

## 🏆 Acknowledgments

- **Google Cloud Platform** - AI infrastructure
- **NVIDIA** - GPU computing
- **FastAPI Community** - Excellent framework
- **Event**: Google Cloud GenAI Hackathon APAC Edition

---

## 📞 Support & Contact

- **Documentation**: See `SETUP.md` for detailed setup
- **Issues**: [GitHub Issues](your-repo-url)
- **API Docs**: http://localhost:8000/docs

---

## 🎉 Get Started Now!

```bash
# 1. Setup backend
cd backend && pip install -r requirements.txt
echo "SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(32))')" > .env

# 2. Start services
uvicorn main:app --reload &
python -m http.server 8080

# 3. Open browser
open http://localhost:8080
```

**Welcome to CommunityPulse AI! 🚀**

---

*Last Updated: July 2, 2026 | Version 1.0.1 (Security Enhanced)*
