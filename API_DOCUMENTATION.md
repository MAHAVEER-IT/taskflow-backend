# API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...} or [...],
  "pagination": {} (optional)
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Endpoints

### Health Check

#### GET `/health`

No authentication required.

**Response (200):**
```json
{
  "success": true,
  "status": "Server is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## Authentication Module

### POST `/api/auth/google`

Authenticate using Google OAuth token. Creates user if doesn't exist.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| token | string | Yes | Google ID token from frontend |

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcwNTMwMzA0NSwiZXhwIjoxNzA2MDkzMDQ1fQ.c-1qc-3qc-5qc-7qc",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

| Field | Type | Notes |
|-------|------|-------|
| token | string | JWT token for subsequent requests |
| user.id | string | MongoDB user ID |
| user.name | string | User's name |
| user.email | string | User's email (unique) |
| user.picture | string | User's profile picture URL |

**Errors:**
- 400: `token` field is missing or invalid
- 401: Invalid Google token
- 500: Server error (check logs)

---

## Chat Module

### POST `/api/chat`

Ask a question and get an AI response from RAG service.

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "question": "How do I invite a team member?"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| question | string | Yes | Min 1, Max 1000 characters |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "answer": "To invite a team member, navigate to Settings > Team Members and click 'Invite'. Enter their email address and select their role (Member, Lead, or Admin)...",
    "sources": [
      "kb/invite-team-members.md",
      "kb/manage-user-roles.md"
    ],
    "confidence": 0.92,
    "escalate": false
  }
}
```

| Field | Type | Notes |
|-------|------|-------|
| answer | string | AI-generated answer |
| sources | array | Knowledge base article sources |
| confidence | number | Confidence score (0-1) |
| escalate | boolean | If true, user should create support ticket |

**Errors:**
- 400: `question` validation failed
- 401: Invalid/missing JWT token
- 502: RAG service unavailable
- 500: Server error

---

### GET `/api/chat/history`

Retrieve chat history for authenticated user.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| limit | integer | 50 | Max results to return |
| skip | integer | 0 | Number of results to skip (pagination) |

**Example:**
```
GET /api/chat/history?limit=10&skip=0
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
      "answer": "Click on your profile icon and select 'Settings'. Look for 'Security' section and click 'Change Password'...",
      "sources": ["kb/reset-password.md"],
      "confidence": 0.95,
      "escalate": false,
      "createdAt": "2024-01-15T10:30:45.123Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439010",
      "question": "How do I upload files?",
      "answer": "Files can be uploaded through the 'File Manager' section. Drag and drop or click 'Upload'...",
      "sources": ["kb/file-upload.md"],
      "confidence": 0.88,
      "escalate": false,
      "createdAt": "2024-01-15T10:25:30.123Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "skip": 0
  }
}
```

**Errors:**
- 401: Invalid/missing JWT token
- 500: Server error

---

## Ticket Module

### POST `/api/tickets`

Create a new support ticket.

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "question": "My laptop battery is draining fast when using TaskFlow"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| question | string | Yes | Min 1, Max 2000 characters |

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

| Field | Type | Notes |
|-------|------|-------|
| ticketId | string | Auto-generated ticket ID |
| status | string | Always "OPEN" for new tickets |

**Errors:**
- 400: `question` validation failed
- 401: Invalid/missing JWT token
- 500: Server error

---

### GET `/api/tickets`

Get all support tickets for authenticated user.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| limit | integer | 50 | Max results to return |
| skip | integer | 0 | Number of results to skip (pagination) |

**Example:**
```
GET /api/tickets?limit=20&skip=0
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "ticketId": "TKT-0001",
      "userId": "507f1f77bcf86cd799439010",
      "question": "Cannot upload files larger than 1MB",
      "status": "OPEN",
      "createdAt": "2024-01-15T10:30:45.123Z",
      "updatedAt": "2024-01-15T10:30:45.123Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "ticketId": "TKT-0002",
      "userId": "507f1f77bcf86cd799439010",
      "question": "Team member invitations not working",
      "status": "IN_PROGRESS",
      "createdAt": "2024-01-14T15:22:10.456Z",
      "updatedAt": "2024-01-15T09:00:00.789Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "skip": 0
  }
}
```

**Errors:**
- 401: Invalid/missing JWT token
- 500: Server error

---

### PATCH `/api/tickets/:ticketId`

Update ticket status.

**Authentication:** Required

**Content-Type:** `application/json`

**URL Parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| ticketId | string | Ticket ID to update (e.g., TKT-0001) |

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| status | string | Yes | OPEN, IN_PROGRESS, CLOSED |

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

**Errors:**
- 400: Invalid status value
- 401: Invalid/missing JWT token
- 404: Ticket not found
- 500: Server error

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing/invalid JWT |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
| 502 | Bad Gateway - RAG service unavailable |
| 503 | Service Unavailable - ChromaDB missing |

---

## Validation Rules

### Google Auth Token
- Required
- Must be valid Google ID token
- Format: JWT token from Google OAuth

### Question (Chat)
- Required
- Min 1 character
- Max 1000 characters
- Trimmed (leading/trailing spaces removed)

### Question (Ticket)
- Required
- Min 1 character
- Max 2000 characters
- Trimmed

### Ticket Status
- Required
- Must be one of: `OPEN`, `IN_PROGRESS`, `CLOSED`
- Case-sensitive

---

## Rate Limiting (Future)

Currently not implemented. Recommended for production:
- 100 requests per minute per user
- 10 requests per minute for auth endpoint

---

## Examples

### Complete Chat Flow

```bash
# 1. Authenticate
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_GOOGLE_TOKEN"}'

# Extract and save JWT from response
export JWT="eyJhbGciOiJIUzI1NiIs..."

# 2. Ask question
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I reset my password?"}'

# 3. Get chat history
curl -X GET "http://localhost:5000/api/chat/history?limit=10" \
  -H "Authorization: Bearer $JWT"
```

### Complete Ticket Flow

```bash
# 1. Create ticket
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"question": "My laptop battery is draining fast"}'

# Extract ticketId from response

# 2. Get all tickets
curl -X GET http://localhost:5000/api/tickets \
  -H "Authorization: Bearer $JWT"

# 3. Update ticket status
curl -X PATCH http://localhost:5000/api/tickets/TKT-0001 \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

---

## Notes

- All timestamps are in ISO 8601 format
- All array responses support pagination with `limit` and `skip`
- JWT tokens expire after 7 days (configurable via JWT_EXPIRE)
- MongoDB ObjectId format: `507f1f77bcf86cd799439011`
- Ticket IDs are auto-generated: `TKT-0001`, `TKT-0002`, etc.
