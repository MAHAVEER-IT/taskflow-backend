# Backend Setup & Installation Guide

Complete step-by-step guide to set up, configure, and run the TaskFlow Backend.

## 📋 Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Python 3.10+** (for RAG service)
- **Git**
- **Postman** (optional, for testing)
- **Google OAuth Client ID** ([Setup Guide](https://developers.google.com/identity/protocols/oauth2))

---

## 🔧 Installation Steps

### Step 1: Clone/Navigate to Backend

```bash
cd c:\Users\kanna\OneDrive\Documents\INFINATE_SOLUTION\BACKEND
```

### Step 2: Install Node Dependencies

```bash
npm install
```

This installs:
- express
- mongoose
- dotenv
- cors, helmet, morgan
- jsonwebtoken
- google-auth-library
- axios
- joi (validation)

**Output should show:**
```
added XX packages
```

### Step 3: Setup MongoDB

#### Option A: Local MongoDB

**Installation:**
```bash
# Windows - Download from https://www.mongodb.com/try/download/community
# Or via Chocolatey:
choco install mongodb-community

# Start MongoDB
mongod
```

**Connection String:**
```
mongodb://localhost:27017/taskflow
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Create database user
5. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority`

### Step 4: Setup Google OAuth

**Get Google Client ID:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: `TaskFlow Backend`
3. Search for **Google+ API** and enable it
4. Go to **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Select **Web application**
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (React frontend)
   - `http://localhost:5000` (Backend)
8. Copy **Client ID**

### Step 5: Configure Environment

**Copy template:**
```bash
cp .env.example .env
```

**Edit `.env`:**
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/taskflow
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars_12345678901234567890
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# RAG Service
RAG_API_URL=http://localhost:8000

# Logging
LOG_LEVEL=debug
```

**To generate strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 6: Start RAG Service

In separate terminal:

```bash
# Navigate to RAG folder
cd ..\RAG_MODEL

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Ingest knowledge base (first time only)
python ingest.py

# Start RAG service
uvicorn app:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 7: Start Backend

In another terminal:

```bash
cd BACKEND

# Development mode (with auto-reload)
npm run dev
```

**Expected output:**
```
[INFO] 2024-01-15T10:30:45.123Z: MongoDB connected: localhost
[INFO] 2024-01-15T10:30:45.456Z: Server running on http://localhost:5000
[INFO] 2024-01-15T10:30:45.789Z: Environment: development
[INFO] 2024-01-15T10:30:45.890Z: RAG API URL: http://localhost:8000
```

### Step 8: Verify Setup

Test health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "status": "Server is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## 🧪 Testing

### 1. Setup Postman

**Import Collection:**
1. Open Postman
2. Click **Import**
3. Select `TaskFlow_Backend_API.postman_collection.json`

**Setup Environment:**
1. Click **Environments** → **New**
2. Name: `TaskFlow Dev`
3. Add variables:
   - `base_url`: `http://localhost:5000`
   - `token`: (empty, will fill after auth)
   - `ticket_id`: (empty, will fill after ticket creation)

### 2. Test Authentication

**Request:**
```
POST http://localhost:5000/api/auth/google
```

**Body:**
```json
{
  "token": "YOUR_GOOGLE_TOKEN_HERE"
}
```

To get a real Google token:
1. Use [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Or integrate frontend OAuth and copy token from browser console

### 3. Test Chat (requires token)

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "question": "How do I invite a team member?"
}
```

### 4. Test Chat History

**Request:**
```
GET http://localhost:5000/api/chat/history?limit=10
Authorization: Bearer <JWT_TOKEN>
```

### 5. Test Tickets

**Create Ticket:**
```
POST http://localhost:5000/api/tickets
Authorization: Bearer <JWT_TOKEN>

{
  "question": "My laptop battery is draining fast"
}
```

**Get All Tickets:**
```
GET http://localhost:5000/api/tickets
Authorization: Bearer <JWT_TOKEN>
```

**Update Ticket:**
```
PATCH http://localhost:5000/api/tickets/TKT-0001
Authorization: Bearer <JWT_TOKEN>

{
  "status": "IN_PROGRESS"
}
```

---

## 📁 Project Structure Reference

```
BACKEND/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── logger.js          # Logging setup
│   │
│   ├── models/
│   │   ├── User.js            # User schema with Google OAuth
│   │   ├── Chat.js            # Chat history schema
│   │   └── Ticket.js          # Support ticket schema
│   │
│   ├── controllers/
│   │   ├── authController.js  # Auth logic (verify token, create user, JWT)
│   │   ├── chatController.js  # Chat logic (call RAG, store, retrieve history)
│   │   └── ticketController.js # Ticket logic (create, read, update status)
│   │
│   ├── routes/
│   │   ├── authRoutes.js      # POST /api/auth/google
│   │   ├── chatRoutes.js      # POST /api/chat, GET /api/chat/history
│   │   └── ticketRoutes.js    # POST /api/tickets, GET, PATCH
│   │
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification middleware
│   │
│   ├── services/
│   │   └── ragService.js      # FastAPI integration (Axios client)
│   │
│   ├── utils/
│   │   ├── generateTicketId.js # TKT-0001, TKT-0002, etc.
│   │   └── validation.js      # Input validation with Joi
│   │
│   └── app.js                 # Express app setup (middleware, routes, error handling)
│
├── server.js                  # Entry point (dotenv, MongoDB connect, listen)
├── package.json               # Dependencies
├── .env.example               # Template for environment variables
├── .env                       # Actual config (DO NOT COMMIT)
├── .gitignore                 # Git ignore rules
│
├── README.md                  # Full documentation
├── API_DOCUMENTATION.md       # Detailed API specs
├── EXAMPLE_REQUESTS.md        # Complete request/response examples
├── INSTALLATION_GUIDE.md      # This file
└── TaskFlow_Backend_API.postman_collection.json # Postman collection
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'express'"

**Solution:**
```bash
npm install
```

### Error: "ECONNREFUSED 127.0.0.1:27017"

**MongoDB not running:**
```bash
mongod
```

Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

### Error: "ECONNREFUSED 127.0.0.1:8000"

**RAG service not running:**
```bash
cd ../RAG_MODEL
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload
```

### Error: "Port 5000 already in use"

**Kill process:**
```bash
npx kill-port 5000
```

Or change `PORT` in `.env`

### Error: "GOOGLE_API_KEY is not set"

**This error is from RAG service, not backend.**

Edit `../RAG_MODEL/.env` with your Gemini API key.

### Error: "Invalid Google token"

**Solutions:**
1. Ensure GOOGLE_CLIENT_ID matches your frontend's client ID
2. Token must be fresh (not expired)
3. Token must be generated from correct Google project

### MongoDB: "Error: 13 - User is not authorized"

**Solution for Atlas:**
1. Check database user credentials in `.env`
2. Verify IP whitelist in MongoDB Atlas
3. Add your IP: https://cloud.mongodb.com/v2/security/network

### Postman: "Unexpected token 'u' in JSON at position 0"

**Solution:**
1. Set Content-Type to `application/json`
2. Verify request body is valid JSON
3. Check token is valid

---

## 🚀 Running Commands Reference

```bash
# Install dependencies
npm install

# Development (with auto-reload)
npm run dev

# Production
npm start

# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Kill port 5000
npx kill-port 5000

# Test health endpoint
curl http://localhost:5000/health
```

---

## 📚 Next Steps

1. **Setup React Frontend** - Connect to this backend
2. **Enable Authentication** - Implement Google OAuth in frontend
3. **Deploy** - Heroku, AWS EC2, or DigitalOcean
4. **Monitor** - Setup logging and error tracking
5. **Scale** - Add rate limiting and caching

---

## 📞 Support & Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Documentation](https://jwt.io/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Postman Documentation](https://learning.postman.com/)

---

## ✅ Installation Checklist

- [ ] Node.js installed (`node --version`)
- [ ] MongoDB running locally or Atlas configured
- [ ] `npm install` completed successfully
- [ ] `.env` file created and configured
- [ ] Google Client ID obtained
- [ ] RAG service running on localhost:8000
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Health endpoint responds (`curl http://localhost:5000/health`)
- [ ] Postman collection imported
- [ ] Test authentication endpoint

Once all checked, your backend is ready to use! 🎉

---

**Created:** 2024-01-15  
**Last Updated:** 2024-01-15  
**Version:** 1.0.0
