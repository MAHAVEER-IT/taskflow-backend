# Example API Requests

This file contains complete example requests and responses for all API endpoints.

## Table of Contents

1. [Authentication](#authentication)
2. [Chat](#chat)
3. [Tickets](#tickets)
4. [Error Examples](#error-examples)

---

## Authentication

### 1. Google OAuth Login

**Request:**
```
POST http://localhost:5000/api/auth/google
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjExZTcyOTIwZjM1ODk0YWJlNmU4MTQ2MDhiMzAxZjI3ZTg2ZGQwMDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMjM0NTY3ODkwLWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MC1hYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ei5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzMyNzQ5MjI3MjA2NDYwMjA2IiwibmFtZSI6IkpvaG4gRG9lIiwiZ2l2ZW5fbmFtZSI6IkpvaG4iLCJmYW1pbHlfbmFtZSI6IkRvZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vLXBpY191cmwvcGhvdG8uanBnIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImxvY2FsZSI6ImVuLVVTIiwiaWF0IjoxNjMwNzA3MDAwLCJleHAiOjE2MzA3MTA2MDB9.signature"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTc5YTYwZWMzMTQ1MDAxMjM0NTY3OCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcwNTMwMzA0NSwiZXhwIjoxNzA2MDkzMDQ1fQ.c-1qc-3qc-5qc-7qc-9qc-11qc-13qc",
  "user": {
    "id": "64a79a60ec314500123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://lh3.googleusercontent.com/-pic_url/photo.jpg"
  }
}
```

---

## Chat

### 1. Post a Question

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTc5YTYwZWMzMTQ1MDAxMjM0NTY3OCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcwNTMwMzA0NSwiZXhwIjoxNzA2MDkzMDQ1fQ.c-1qc-3qc-5qc-7qc-9qc-11qc-13qc
Content-Type: application/json

{
  "question": "How do I invite a team member?"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "answer": "To invite a team member to your TaskFlow project:\n\n1. Navigate to **Settings** in the sidebar\n2. Click on **Team Members**\n3. Click the **'Invite'** button\n4. Enter the team member's email address\n5. Select their role:\n   - **Member**: Can view and edit tasks\n   - **Lead**: Can manage team and tasks\n   - **Admin**: Full project access\n6. Click **Send Invite**\n\nThe team member will receive an email invitation with a link to join your project. They must have a TaskFlow account to accept the invitation.\n\nFor more information, see **Managing User Roles** to understand permission levels.",
    "sources": [
      "kb/invite-team-members.md",
      "kb/manage-user-roles.md"
    ],
    "confidence": 0.92,
    "escalate": false
  }
}
```

### 2. Different Questions and Responses

#### Question: "How do I create a project?"

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "question": "How do I create a project?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "To create a new project in TaskFlow:\n\n1. Click the **'New Project'** button on the dashboard\n2. Enter a project name\n3. Select a project template (or start blank)\n4. Set privacy level (Private or Public)\n5. Click **Create**\n\nYou'll be taken to your new project. You can then add team members, create boards, and configure project settings.",
    "sources": ["kb/create-project.md"],
    "confidence": 0.95,
    "escalate": false
  }
}
```

#### Question: "How do I reset my password?"

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "question": "How do I reset my password?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "To reset your password:\n\n1. On the login page, click **'Forgot Password?'**\n2. Enter your email address\n3. Click **'Send Reset Link'**\n4. Check your email for the reset link\n5. Click the link (valid for 24 hours)\n6. Enter your new password\n7. Click **'Reset Password'**\n\nYou can now log in with your new password.\n\nIf you don't receive the email, check your spam folder or contact support.",
    "sources": ["kb/reset-password.md"],
    "confidence": 0.98,
    "escalate": false
  }
}
```

#### Low Confidence - Escalation

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "question": "How do I integrate with Slack?"
}
```

**Response (escalate=true):**
```json
{
  "success": true,
  "data": {
    "answer": "I couldn't find specific information about Slack integration in our current knowledge base. This might be a new feature or not yet documented. We recommend creating a support ticket so our team can assist you with your Slack integration needs.",
    "sources": [],
    "confidence": 0.35,
    "escalate": true
  }
}
```

### 3. Get Chat History

**Request:**
```
GET http://localhost:5000/api/chat/history?limit=10&skip=0
Authorization: Bearer <JWT>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a79a60ec314500123456789",
      "userId": "64a79a60ec314500123456788",
      "question": "How do I invite a team member?",
      "answer": "To invite a team member to your TaskFlow project:\n\n1. Navigate to Settings...",
      "sources": [
        "kb/invite-team-members.md",
        "kb/manage-user-roles.md"
      ],
      "confidence": 0.92,
      "escalate": false,
      "createdAt": "2024-01-15T14:30:45.123Z"
    },
    {
      "_id": "64a79a60ec314500123456790",
      "userId": "64a79a60ec314500123456788",
      "question": "How do I reset my password?",
      "answer": "To reset your password:\n\n1. On the login page, click 'Forgot Password?'...",
      "sources": ["kb/reset-password.md"],
      "confidence": 0.98,
      "escalate": false,
      "createdAt": "2024-01-15T14:25:30.456Z"
    },
    {
      "_id": "64a79a60ec314500123456791",
      "userId": "64a79a60ec314500123456788",
      "question": "How do I upload files?",
      "answer": "Files can be uploaded through the File Manager section. Here's how:\n\n1. Click on File Manager in the sidebar...",
      "sources": ["kb/file-upload.md"],
      "confidence": 0.88,
      "escalate": false,
      "createdAt": "2024-01-15T10:15:20.789Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "skip": 0
  }
}
```

### 4. Get Next Page of Chat History

**Request:**
```
GET http://localhost:5000/api/chat/history?limit=10&skip=10
Authorization: Bearer <JWT>
```

---

## Tickets

### 1. Create Ticket

**Request:**
```
POST http://localhost:5000/api/tickets
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "question": "My laptop battery is draining fast when using TaskFlow"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "ticketId": "TKT-0001",
    "status": "OPEN"
  }
}
```

### 2. Get All Tickets

**Request:**
```
GET http://localhost:5000/api/tickets?limit=20&skip=0
Authorization: Bearer <JWT>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a79a60ec314500123456792",
      "ticketId": "TKT-0001",
      "userId": "64a79a60ec314500123456788",
      "question": "My laptop battery is draining fast when using TaskFlow",
      "status": "OPEN",
      "createdAt": "2024-01-15T15:30:45.123Z",
      "updatedAt": "2024-01-15T15:30:45.123Z"
    },
    {
      "_id": "64a79a60ec314500123456793",
      "ticketId": "TKT-0002",
      "userId": "64a79a60ec314500123456788",
      "question": "Cannot upload files larger than 5MB",
      "status": "IN_PROGRESS",
      "createdAt": "2024-01-15T14:22:10.456Z",
      "updatedAt": "2024-01-15T14:50:00.123Z"
    },
    {
      "_id": "64a79a60ec314500123456794",
      "ticketId": "TKT-0003",
      "userId": "64a79a60ec314500123456788",
      "question": "Team member invitations not working",
      "status": "CLOSED",
      "createdAt": "2024-01-14T12:15:30.789Z",
      "updatedAt": "2024-01-15T11:00:00.456Z"
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 20,
    "skip": 0
  }
}
```

### 3. Update Ticket to IN_PROGRESS

**Request:**
```
PATCH http://localhost:5000/api/tickets/TKT-0001
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

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

### 4. Update Ticket to CLOSED

**Request:**
```
PATCH http://localhost:5000/api/tickets/TKT-0001
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "status": "CLOSED"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "TKT-0001",
    "status": "CLOSED"
  }
}
```

---

## Error Examples

### 1. Missing JWT Token

**Request:**
```
POST http://localhost:5000/api/chat
Content-Type: application/json

{
  "question": "How do I invite a team member?"
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "No authentication token provided"
}
```

### 2. Invalid JWT Token

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer invalid_token_here
Content-Type: application/json

{
  "question": "How do I invite a team member?"
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 3. Validation Error - Empty Question

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "question": ""
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation error: \"question\" must not be empty"
}
```

### 4. Validation Error - Question Too Long

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "question": "Lorem ipsum dolor sit amet... (more than 1000 chars)"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation error: \"question\" length must be less than or equal to 1000 characters"
}
```

### 5. RAG Service Unavailable

**Request:**
```
POST http://localhost:5000/api/chat
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "question": "How do I invite a team member?"
}
```

**Response (502):**
```json
{
  "success": false,
  "message": "Failed to get response from RAG service: connect ECONNREFUSED 127.0.0.1:8000"
}
```

### 6. Invalid Ticket Status

**Request:**
```
PATCH http://localhost:5000/api/tickets/TKT-0001
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "status": "RESOLVED"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation error: \"status\" must be one of [OPEN, IN_PROGRESS, CLOSED]"
}
```

### 7. Ticket Not Found

**Request:**
```
PATCH http://localhost:5000/api/tickets/TKT-9999
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Ticket not found"
}
```

### 8. Invalid Google Token

**Request:**
```
POST http://localhost:5000/api/auth/google
Content-Type: application/json

{
  "token": "invalid.token.here"
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid Google token"
}
```

### 9. Health Check Success

**Request:**
```
GET http://localhost:5000/health
```

**Response (200):**
```json
{
  "success": true,
  "status": "Server is running",
  "timestamp": "2024-01-15T15:30:45.123Z"
}
```

---

## Notes

- All timestamps are ISO 8601 formatted
- JWT tokens are example values and should be replaced with real tokens
- Ticket IDs are auto-generated sequentially: TKT-0001, TKT-0002, etc.
- Response times vary based on RAG service latency
- Confidence scores range from 0 to 1 (0% to 100%)
