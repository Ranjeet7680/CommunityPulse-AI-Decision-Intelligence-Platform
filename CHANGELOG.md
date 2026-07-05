# Changelog

All notable changes and improvements to the CommunityPulse AI project.

## [1.1.0] - 2026-07-05

### 🚀 Backend API Integrations & Frontend Bindings
- Connected authentication page forms directly to backend `AuthAPI` login and registration endpoints, replacing firebase mocks.
- Connected AI Chat panel directly to `/api/v1/ai/chat` endpoint, supporting typing indicator state, confidence score outputs, and citations.
- Connected Data Explorer drag-and-drop dashboard panel directly to backend `/api/v1/datasets/upload`, listing active datasets and supporting column previews and summary insights (`/api/v1/ai/summarize`).

### ✨ Design System & Glassmorphic Enhancements
- Redesigned Login, Signup, and Onboarding multi-step card components to support light/dark transparency backdrop blurs.
- Standardized inputs and selector controls to use theme-aware glassmorphic fields that highlight with blue glowing focus indicators.
- Upgraded Referral Center share buttons to use platform-specific brand colors and translations (Email, WhatsApp, X, Facebook, LinkedIn) on hover.
- Synced Leaflet map tiles with the website's dark/light mode toggle automatically.

### 🐛 Onboarding & UX Bug Fixes
- Fixed onboarding continue buttons progression by correctly toggling CSS `style.display` of step frames in `goToOnboardingStep()`.
- Implemented onboarding auto-bypass: manual login attempts now check `localStorage` and skip onboarding for returning users.
- Updated Innovation Team roster and profile details on the dashboard and main `about.html` landing page.

### 🔧 DevOps & Deployment Alignments
- Configured root `vercel.json` with builds and routes, enabling serverless FastAPI deployment side-by-side with static frontend files.
- Dynamicized referral sharing link copying and generators using `window.location.origin` to support active custom domains.
- Resolved launch script port conflicts (where `start.bat` maps Frontend: 8000, Backend: 8080 and `QUICKSTART.bat` maps Frontend: 8080, Backend: 8000) using browser port detection in `api-config.js`.

## [1.0.0] - 2026-07-02

### 🔒 Security Fixes

- **CRITICAL**: Removed hardcoded `SECRET_KEY` from config
  - Added validation to prevent production deployment with default secret
  - Updated `.env.example` with secure configuration instructions
  - Added automatic generation guide for secure keys

- **CRITICAL**: Fixed authentication bypass vulnerability
  - Removed demo user fallback in `get_current_user()`
  - Now properly raises 401 Unauthorized when token is missing/invalid
  - Added user activation status check

- **HIGH**: Improved Firebase token validation
  - Removed insecure mock token bypass
  - Added proper error handling and validation
  - Added clear documentation for production setup

- **MEDIUM**: Enhanced password security
  - Increased minimum password length from 6 to 8 characters
  - Added password strength validation in registration
  - Improved error messages without revealing user existence

### ✨ Improvements

#### Backend

- **Enhanced Input Validation**
  - Added email format validation in registration
  - Added organization name validation
  - Added file upload size limits (50MB max)
  - Added empty file detection
  - Improved dataframe parsing error handling

- **Better Error Handling**
  - More descriptive error messages
  - Consistent HTTP status codes
  - Added proper logging for security events
  - Improved rate limiting error recovery

- **Code Quality**
  - Removed duplicate code in `get_current_user()`
  - Fixed JWT token type validation
  - Normalized email addresses (lowercase, trimmed)
  - Added comprehensive docstrings

- **Rate Limiting Enhancements**
  - Added `Retry-After` header to 429 responses
  - Improved Redis fallback handling
  - Better logging of rate limit violations
  - Exempt health checks and metrics from rate limiting

#### Configuration

- **Environment Configuration**
  - Created comprehensive `.env.example` with detailed comments
  - Added configuration sections with clear descriptions
  - Added secure key generation instructions
  - Created minimal `.env` file for local development

### 🐛 Bug Fixes

- Fixed authentication dependency chain issues
- Fixed case-sensitive email comparison in login
- Fixed inactive account handling
- Improved Redis mock client compatibility
- Fixed token payload validation

### 📚 Documentation

- Enhanced `.env.example` with detailed configuration guide
- Added security warnings and best practices
- Added API key generation instructions
- Created this CHANGELOG for tracking improvements

### 🔄 Breaking Changes

- **Authentication**: No longer returns demo user when unauthenticated
  - Frontend must handle 401 responses properly
  - All API calls now require valid JWT tokens

- **Password Requirements**: Minimum length increased from 6 to 8 characters
  - Existing users unaffected
  - New registrations must meet new requirements

### 📋 Known Issues

- Mock database (in-memory dict) loses data on restart
- No database migrations system
- File uploads stored in memory (not persistent)
- No virus scanning on uploaded files
- No automated test suite

### 🚀 Recommendations for Production

1. Replace mock Firestore with real database (PostgreSQL or Firestore)
2. Implement proper file storage (Google Cloud Storage)
3. Add comprehensive test suite (pytest, integration tests)
4. Enable proper Firebase Authentication
5. Add API rate limiting per user (not just per IP)
6. Implement audit logging for sensitive operations
7. Add HTTPS enforcement
8. Configure proper CORS origins
9. Enable security headers (HSTS, CSP, etc.)
10. Set up proper secret management (GCP Secret Manager)

---

## Version History

- **[Unreleased]** - Current development version with security fixes
- **1.0.0** - Initial hackathon prototype
