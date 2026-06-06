# TaskFlow Backend - Production Setup Guide

A Node.js + Express + MongoDB backend for the TaskFlow Support Assistant, integrating with a Python RAG (Retrieval Augmented Generation) service.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Testing with Postman](#testing-with-postman)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

```bash
# Clone and navigate to backend folder
cd BACKEND

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Start MongoDB
# Option 1: Local MongoDB
mongod

# Option 2: MongoDB Atlas
# Update MONGODB_URI in .env

# Ensure RAG service is running on localhost:8000
cd ../RAG_MODEL
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python ingest.py
uvicorn app:app --reload

# In another terminal, start Node backend
cd ../BACKEND
npm start
# or for development
npm run dev
```

Server runs on **http://localhost:5000**

---

## 📁 Project Structure

```
BACKEND/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── logger.js          # Logging setup
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Chat.js            # Chat history schema
│   │   └── Ticket.js          # Support tickets schema
│   ├── controllers/
│   │   ├── authController.js  # Google OAuth logic
│   │   ├── chatController.js  # Chat Q&A logic
│   │   └── ticketController.js # Ticket management
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth routes
│   │   ├── chatRoutes.js      # /api/chat routes
│   │   └── ticketRoutes.js    # /api/tickets routes
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── services/
│   │   └── ragService.js      # FastAPI integration
│   ├── utils/
│   │   ├── generateTicketId.js # Ticket ID generation
│   │   └── validation.js      # Input validation
│   └── app.js                 # Express app setup
├── server.js                  # Server entry point
├── package.json               # Dependencies
├── .env.example               # Environment template
├── .env                       # Environment config (gitignored)
└── README.md                  # This file
```

---

## 📦 Installation

### Prerequisites

- **Node.js**: v16 or higher
- **MongoDB**: Local or Atlas
- **Python RAG Service**: Running on localhost:8000
- **Google OAuth**: Client ID from Google Cloud Console

### Steps

```bash
# 1. Navigate to backend folder
cd BACKEND

# 2. Install dependencies
npm install

# 3. Install development dependencies (optional)
npm install --save-dev nodemon

# 4. Copy environment file
cp .env.example .env

# 5. Edit .env with your configuration
# Update: MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, RAG_API_URL
```

---

## ⚙️ Configuration

Edit `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Use one of:
# Local: mongodb://localhost:27017/taskflow
# Atlas: mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/taskflow

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# RAG Service
RAG_API_URL=http://localhost:8000

# Logging
LOG_LEVEL=debug
```

### Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized JavaScript origins: `http://localhost:3000` (your frontend)
6. Copy **Client ID** and paste in `.env`

---

## 🏃 Running Locally

### Development Mode (with auto-reload)

```bash
npm run dev
```

Output:
```
[INFO] 2024-01-15T10:30:45.123Z: MongoDB connected: localhost
[INFO] 2024-01-15T10:30:45.456Z: Server running on http://localhost:5000
[INFO] 2024-01-15T10:30:45.789Z: Environment: development
[INFO] 2024-01-15T10:30:45.890Z: RAG API URL: http://localhost:8000
```

### Production Mode

```bash
npm start
```

### Test Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "status": "Server is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## 🔌 API Endpoints

### Authentication

#### POST `/api/auth/google`

Authenticate with Google token, create user, return JWT.

**Request:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

---

### Chat

#### POST `/api/chat`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "question": "How do I invite a team member?"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "answer": "To invite a team member, navigate to Settings > Team Members and click 'Invite'. Enter their email and select their role...",
    "sources": ["kb/invite-team-members.md", "kb/manage-user-roles.md"],
    "confidence": 0.92,
    "escalate": false
  }
}
```

#### GET `/api/chat/history?limit=50&skip=0`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "question": "How do I reset my password?",
      "answer": "Click on your profile icon and select 'Settings'...",
      "sources": ["kb/reset-password.md"],
      "confidence": 0.95,
      "escalate": false,
      "createdAt": "2024-01-15T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "skip": 0
  }
}
```

---

### Tickets

#### POST `/api/tickets`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "question": "My laptop battery is draining fast"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "ticketId": "TKT-0001",
    "status": "OPEN"
  }
}
```

#### GET `/api/tickets?limit=50&skip=0`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "ticketId": "TKT-0001",
      "userId": "507f1f77bcf86cd799439010",
      "question": "Cannot upload files larger than 1MB",
      "status": "OPEN",
      "createdAt": "2024-01-15T10:30:45.123Z",
      "updatedAt": "2024-01-15T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 50,
    "skip": 0
  }
}
```

#### PATCH `/api/tickets/:ticketId`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "IN_PROGRESS"
}
```

Valid statuses: `OPEN`, `IN_PROGRESS`, `CLOSED`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "TKT-0001",
    "status": "IN_PROGRESS"
  }
}
```

---

## 💾 Database Models

### User

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  picture: String | null,
  googleId: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`
- `googleId`

---

### Chat

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  question: String,
  answer: String,
  sources: [String],
  confidence: Number (0-1),
  escalate: Boolean,
  createdAt: Date
}
```

**Indexes:**
- `userId, createdAt (descending)`

---

### Ticket

```javascript
{
  _id: ObjectId,
  ticketId: String (unique, e.g., "TKT-0001"),
  userId: ObjectId (ref: User),
  question: String,
  status: String (enum: OPEN, IN_PROGRESS, CLOSED),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `ticketId`
- `userId, createdAt (descending)`

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Frontend  │
└─────────────┘
       │
       │ 1. Get Google Token
       ▼
┌─────────────────────────┐
│  Google OAuth Provider  │
└─────────────────────────┘
       │
       │ 2. Send token to backend
       ▼
┌─────────────────────────────────────┐
│  POST /api/auth/google              │
│  - Verify token with Google         │
│  - Create/update user in MongoDB    │
│  - Generate JWT                     │
└─────────────────────────────────────┘
       │
       │ 3. Return JWT token
       ▼
┌─────────────┐
│   Frontend  │
│ Store JWT   │
└─────────────┘
       │
       │ 4. Include JWT in all requests
       │ Authorization: Bearer <JWT>
       ▼
┌─────────────────────────┐
│   Protected Endpoints   │
│ /api/chat               │
│ /api/tickets            │
└─────────────────────────┘
```

---

## ⚠️ Error Handling

### Common Error Responses

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation error: question must not be empty"
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Ticket not found"
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

#### 502 - Bad Gateway (RAG Service down)
```json
{
  "success": false,
  "message": "Failed to get response from RAG service: Connection refused"
}
```

---

## 📮 Testing with Postman

### 1. Import API Collection

Create new Postman collection `TaskFlow Backend`

### 2. Set Environment Variables

Create environment `TaskFlow Dev`:
- `base_url`: http://localhost:5000
- `token`: (will be filled after auth)
- `ticket_id`: (will be filled after ticket creation)

### 3. Test Endpoints

**Authentication**
```
POST {{base_url}}/api/auth/google
Body (raw JSON):
{
  "token": "YOUR_GOOGLE_TOKEN_HERE"
}
```

Save the `token` from response to environment variable.

**Chat**
```
POST {{base_url}}/api/chat
Headers: Authorization: Bearer {{token}}
Body (raw JSON):
{
  "question": "How do I invite a team member?"
}
```

**Chat History**
```
GET {{base_url}}/api/chat/history?limit=10
Headers: Authorization: Bearer {{token}}
```

**Create Ticket**
```
POST {{base_url}}/api/tickets
Headers: Authorization: Bearer {{token}}
Body (raw JSON):
{
  "question": "My laptop battery is draining fast"
}
```

Save `ticketId` from response to environment variable.

**Update Ticket**
```
PATCH {{base_url}}/api/tickets/{{ticket_id}}
Headers: Authorization: Bearer {{token}}
Body (raw JSON):
{
  "status": "IN_PROGRESS"
}
```

---

## 🚀 Deployment

### Environment Setup

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow
JWT_SECRET=use_a_strong_random_key_here_min_32_chars
GOOGLE_CLIENT_ID=your_production_client_id.apps.googleusercontent.com
RAG_API_URL=https://your-rag-service.com
LOG_LEVEL=info
```

### Deploy to Heroku

```bash
# 1. Create Heroku app
heroku create taskflow-backend

# 2. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your_production_mongodb_uri>
heroku config:set JWT_SECRET=<strong_secret>
heroku config:set GOOGLE_CLIENT_ID=<production_client_id>
heroku config:set RAG_API_URL=<rag_service_url>

# 3. Deploy
git push heroku main
```

### Deploy to AWS EC2 / DigitalOcean

```bash
# SSH into server
ssh user@your_server_ip

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB (or use MongoDB Atlas)
sudo apt-get install -y mongodb

# Clone repo
git clone <your_repo>
cd BACKEND

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name "taskflow-backend"
pm2 startup
pm2 save
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error:** `MongoDB connection failed: connect ECONNREFUSED`

**Solutions:**
1. Ensure MongoDB is running: `mongod`
2. Check MONGODB_URI in .env
3. For MongoDB Atlas, check IP whitelist

### Google Token Invalid

**Error:** `Invalid Google token`

**Solutions:**
1. Verify GOOGLE_CLIENT_ID matches your frontend
2. Check token hasn't expired
3. Ensure token was generated from correct Google project

### RAG Service Connection Failed

**Error:** `Failed to get response from RAG service: Connection refused`

**Solutions:**
1. Start RAG service: `uvicorn app:app --reload`
2. Check RAG_API_URL in .env (default: http://localhost:8000)
3. Verify RAG service is accessible: `curl http://localhost:8000/health`

### JWT Secret Too Short

**Error:** `Error: secretOrPrivateKey required` during token verification

**Solutions:**
1. Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update .env with new secret

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Kill process: `npx kill-port 5000`
2. Change PORT in .env

---

## 📞 Support

For issues, errors, or questions:

1. Check logs: `npm run dev` shows detailed debugging
2. Review database with MongoDB Compass
3. Test RAG service independently
4. Verify all environment variables are set

---

## 📄 License

MIT

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0
