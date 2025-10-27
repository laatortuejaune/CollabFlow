# CollabFlow Setup Guide

This guide will help you configure MongoDB, run the backend server, and verify all REST APIs (auth, projects, boards, tasks, comments, notifications).

## 1) Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (Atlas cluster or local MongoDB 6+)
- Git
- Optional: Postman/Insomnia for API testing

## 2) Clone and install
```
git clone https://github.com/laatortuejaune/CollabFlow.git
cd CollabFlow/backend
npm install
```

## 3) Configure environment (.env)
Create a `.env` file in the backend folder based on `.env.example`:
```
cp .env.example .env
```
Edit `.env` with your values:
```
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/collabflow?retryWrites=true&w=majority
# Or local
# MONGO_URI=mongodb://localhost:27017/collabflow

# JWT
JWT_SECRET=change_me_to_a_strong_secret

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:3000
```
Note: If server.js expects MONGODB_URI instead of MONGO_URI, align the key or update server.js to use `process.env.MONGO_URI`.

## 4) Start MongoDB
- Atlas: Ensure network access allows your IP and a database user exists with readWrite.
- Local: Ensure the mongod service is running.

Test connection from your machine if needed using MongoDB Compass with the same URI.

## 5) Run the backend
```
cd backend
npm start
```
Expected output: server listening on PORT and MongoDB connected without errors.

Health check:
```
curl -s http://localhost:5000/health
```
Expected: `{ "status": "ok" }`

## 6) REST API quick reference
Base URL: `http://localhost:5000/api`

- Auth: `/auth`
- Projects: `/projects`
- Boards: `/boards`
- Tasks: `/tasks`
- Comments: `/comments`
- Notifications: `/notifications`

All non-auth endpoints require Bearer token in `Authorization: Bearer <token>`.

## 7) Authentication flow
Register:
```
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "Password123!"
  }'
```
Login:
```
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"Password123!"}' | jq -r .token)
```
Get current user:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/auth/me
```

## 8) Projects
Create project:
```
PROJECT_ID=$(curl -s -X POST http://localhost:5000/api/projects \
  -H 'Authorization: Bearer '$TOKEN \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo Project","description":"Test"}' | jq -r ._id)
```
List my projects:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/projects
```

## 9) Boards
Create board in project:
```
BOARD_ID=$(curl -s -X POST http://localhost:5000/api/boards \
  -H 'Authorization: Bearer '$TOKEN \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sprint 1","description":"Main board","projectId":"'$PROJECT_ID'"}' | jq -r ._id)
```
List boards for project:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/boards/project/$PROJECT_ID
```

## 10) Tasks
Create task on board:
```
TASK_ID=$(curl -s -X POST http://localhost:5000/api/tasks \
  -H 'Authorization: Bearer '$TOKEN \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Design login",
    "description":"Create UI",
    "priority":"high",
    "status":"todo",
    "projectId":"'$PROJECT_ID'",
    "boardId":"'$BOARD_ID'"
  }' | jq -r ._id)
```
List project tasks:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks/project/$PROJECT_ID
```
Update task:
```
curl -X PUT http://localhost:5000/api/tasks/$TASK_ID \
  -H 'Authorization: Bearer '$TOKEN \
  -H 'Content-Type: application/json' \
  -d '{"status":"in_progress"}'
```

## 11) Comments
Add comment on task:
```
COMMENT_ID=$(curl -s -X POST http://localhost:5000/api/comments \
  -H 'Authorization: Bearer '$TOKEN \
  -H 'Content-Type: application/json' \
  -d '{"content":"Looks good","taskId":"'$TASK_ID'"}' | jq -r ._id)
```
List comments on task:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/comments/task/$TASK_ID
```

## 12) Notifications
List my notifications:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/notifications
```
Unread notifications:
```
curl -H "Authorization: BearER $TOKEN" http://localhost:5000/api/notifications/unread
```
Unread count:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/notifications/count
```
Mark one as read:
```
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/notifications/<NOTIF_ID>/read
```
Mark all read:
```
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/notifications/read-all
```

## 13) Common issues
- 401 Unauthorized: Missing or invalid token header. Ensure `Authorization: Bearer <token>`.
- 403 Forbidden: You do not own or are not a member of the project.
- 404 Not found: Check IDs used in path/body.
- MongoNetworkError: Check MONGO_URI, IP allowlist, and user/password on Atlas.

## 14) Running tests manually
- Use the curl scripts above in order: auth -> project -> board -> task -> comment -> notifications.
- Verify each endpoint returns 2xx and JSON body with expected fields.

## 15) Production notes
- Use a strong JWT_SECRET and never commit your real .env
- Restrict CORS origins appropriately
- Monitor and index MongoDB collections used in filters (project, board, user fields)
- Consider rate limiting and helmet for security

---
If anything fails, capture the error log from the server console and verify your .env values and IDs from previous steps.
