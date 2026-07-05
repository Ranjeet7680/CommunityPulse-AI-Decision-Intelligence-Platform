# CommunityPulse AI - Setup Guide

Complete setup instructions for running the CommunityPulse AI platform locally.

## 📋 Prerequisites

### Required Software

- **Python 3.12+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** (optional, for frontend tooling) - [Download](https://nodejs.org/)
- **Redis 7+** (optional, will fallback to mock) - [Download](https://redis.io/download)
- **Git** - [Download](https://git-scm.com/downloads)

### Optional (for full GCP integration)

- Google Cloud Platform account
- Firebase project
- Gemini API key

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Gen AI Academy APAC Edition"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Generate secure secret key
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Copy the output and add to .env file
# Create .env from template
copy .env.example .env  # Windows
# OR
cp .env.example .env    # macOS/Linux

# Edit .env and update SECRET_KEY with generated value
```

### 3. Start Backend Server

```bash
# Make sure you're in the backend directory with venv activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 4. Frontend Setup

Open a new terminal:

```bash
# Go back to project root
cd ..

# Serve frontend files (choose one method)

# Method 1: Python HTTP server
python -m http.server 8080

# Method 2: If you have Node.js installed
npx http-server -p 8080

# Method 3: Use VS Code Live Server extension
# Right-click on index.html → Open with Live Server
```

The frontend will be available at: http://localhost:8080

---

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# REQUIRED: Generate a secure secret key
SECRET_KEY=your-secure-32-char-minimum-key-here

# Optional: Gemini AI API Key (get from https://ai.google.dev/)
GEMINI_API_KEY=your-gemini-api-key

# Optional: Redis URL (falls back to mock if not available)
REDIS_URL=redis://localhost:6379/0

# Development mode (set to false in production)
DEBUG=true
APP_ENV=development
```

### Generate Secure Secret Key

```bash
# Method 1: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Method 2: OpenSSL
openssl rand -base64 32

# Method 3: Online generator
# Visit: https://randomkeygen.com/
```

---

## 🎯 Feature Configuration

### Enable AI Assistant (Gemini)

1. Get API key from [Google AI Studio](https://ai.google.dev/)
2. Add to `.env`:
   ```bash
   GEMINI_API_KEY=your-api-key-here
   ```
3. Restart backend server

### Enable Redis Caching

1. Install Redis:
   ```bash
   # Windows: Download from https://redis.io/download
   # macOS: brew install redis
   # Linux: sudo apt-get install redis-server
   ```

2. Start Redis:
   ```bash
   # Windows: redis-server
   # macOS/Linux: redis-server
   ```

3. Update `.env`:
   ```bash
   REDIS_URL=redis://localhost:6379/0
   ```

### Enable Firebase Authentication

1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Download service account key JSON
3. Update `.env`:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key"
   ```

---

## 🐳 Docker Setup (Alternative)

### Run with Docker Compose

```bash
cd backend

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services available:
- Backend API: http://localhost:8000
- Redis: localhost:6379
- Celery Worker: (background)

---

## 🧪 Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-02T..."
}
```

### 2. Test Frontend

1. Open http://localhost:8080
2. You should see the CommunityPulse AI landing page
3. Try registering a new account

### 3. Test API Endpoints

Visit http://localhost:8000/docs for interactive API documentation.

Try creating an account:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "name": "Test User",
    "org_name": "Test Organization"
  }'
```

---

## 🔍 Troubleshooting

### Backend won't start

**Error**: `SECRET_KEY must be changed from default value`
- **Solution**: Generate and set a secure SECRET_KEY in `.env`

**Error**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Activate venv and install dependencies:
  ```bash
  venv\Scripts\activate  # Windows
  pip install -r requirements.txt
  ```

### Frontend can't connect to backend

**Error**: CORS errors in browser console
- **Solution**: Add your frontend URL to `CORS_ORIGINS` in `.env`:
  ```bash
  CORS_ORIGINS='["http://localhost:8080","http://127.0.0.1:8080"]'
  ```

### Redis connection fails

**Error**: Redis connection refused
- **Solution**: Redis is optional. The app will use a mock Redis client if connection fails. To use real Redis, ensure Redis is running:
  ```bash
  redis-server
  ```

### File upload fails

**Error**: 400 Bad Request on file upload
- **Solution**: Ensure file is CSV, Excel, or JSON format and under 50MB

---

## 📊 Development Workflow

### Making Code Changes

1. **Backend changes**: Server auto-reloads with `--reload` flag
2. **Frontend changes**: Refresh browser (Ctrl+R or Cmd+R)
3. **Configuration changes**: Restart backend server

### Viewing Logs

```bash
# Backend logs appear in terminal where uvicorn is running

# For Docker:
docker-compose logs -f api
```

### Database Management

Currently using in-memory mock database:
- Data persists only while server is running
- Restart = data loss
- For production, replace with real database

---

## 🚀 Next Steps

1. **Customize**: Update branding, colors in `app.css`
2. **Add Features**: Extend routers in `backend/app/routers/`
3. **Deploy**: See deployment guides for GCP, AWS, or Azure
4. **Secure**: Follow production checklist in CHANGELOG.md

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Redis Documentation](https://redis.io/documentation)

---

## 🆘 Need Help?

- Check API docs: http://localhost:8000/docs
- Review CHANGELOG.md for recent changes
- Check browser console for frontend errors
- Check terminal logs for backend errors

---

**Happy Developing! 🎉**
