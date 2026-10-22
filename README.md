# Practical 4: Building a RESTful API with Node.js and Express

**Course:** ITUE301 — Advanced Web Development Frameworks  
**Academic Year:** 2026–27  
**Institution:** Chandubhai S. Patel Institute of Technology (CSPIT) / CHARUSAT  
**Student Name:** Ansh Sojitra  
**Student ID:** 24CS095  
**Repository:** `task-manager-api-24CS095`

---

## Table of Contents
- [Objective](#objective)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Features Implemented](#features-implemented)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Routes Reference](#api-routes-reference)
- [API Request & Response Examples](#api-request--response-examples)
- [Post-Lab Requirements](#post-lab-requirements)
- [Automated & Manual Testing Instructions](#automated--manual-testing-instructions)
- [Testing Evidence Checklist](#testing-evidence-checklist)
- [VCS / Git Submission](#vcs--git-submission)

---

## Objective
Build a robust, production-grade Task Management REST API using Node.js and Express utilizing:
1. In-memory data storage (no external database required).
2. Complete CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`).
3. Global request logging middleware capturing HTTP method, URL, and ISO timestamp.
4. JSON body parsing and standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
5. Structured 404 handler for unrecognized routes.
6. Centralized global error handling middleware placed after routes to catch unexpected errors and suppress internal stack traces from leaking to clients.
7. Post-lab validation middleware to enforce `Content-Type: application/json` for `POST`/`PUT` and validate task IDs before controller logic execution.

---

## Architecture & Folder Structure

```
TaskManagerAPI/
├── middleware/
│   ├── logger.js               # Global request logger (Method, URL, ISO timestamp)
│   ├── validateContentType.js  # Rejects POST/PUT lacking Content-Type: application/json
│   ├── validateTaskId.js       # Pre-validates :id route parameter as positive integer
│   └── errorHandler.js         # Centralized error handler (no stack trace leaks)
├── routes/
│   └── tasks.js                # Task CRUD endpoints and in-memory data store
├── .env                        # Local environment configuration (git-ignored)
├── .env.example                # Template for environment configuration
├── .gitignore                  # Git ignore rules (node_modules, .env, logs)
├── app.js                      # Express application entry point & middleware pipeline
├── package.json                # Project dependencies and script definitions
├── package-lock.json           # Locked dependency tree
├── TaskManagerAPI.postman_collection.json # Postman v2.1 collection
├── test.js                     # Automated integration test suite (43 assertions)
└── README.md                   # University practical documentation and report
```

---

## Features Implemented

- **Modular Middleware Pipeline**:
  - Request logging before request processing.
  - Media type validation before body parsing.
  - Param-level ID validation before route controllers.
  - Safe global error handling at the tail of the application pipeline.
- **In-Memory Store**: Fast and self-contained JavaScript array containing seed tasks. Each task has:
  - `id` *(Number, unique auto-incremented)*
  - `title` *(String, required)*
  - `description` *(String, optional)*
  - `completed` *(Boolean, defaults to false)*
- **Data Validation**:
  - Empty or non-string titles on creation rejected with `400 Bad Request`.
  - Non-numeric or negative IDs rejected with `400 Bad Request`.
  - Empty update payloads rejected with `400 Bad Request`.
  - Missing task ID lookups return `404 Not Found`.
- **Security & Reliability**:
  - Internal server errors and JSON parse syntax errors handled cleanly without exposing stack traces.
  - Environment-based port fallback (`PORT=5000`).

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node.js v24.12.0)
- **npm**: v9.0.0 or higher (Tested on npm v11.6.2)
- **cURL / Postman / Thunder Client**: For API testing

---

## Installation & Setup

1. **Clone or Navigate to the Repository:**
   ```bash
   git clone https://github.com/anshsojitra/task-manager-api-24CS095.git
   cd task-manager-api-24CS095
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

---

## Environment Variables

Defined in `.env` (excluded from git):

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server listens |
| `NODE_ENV` | `development` | Application runtime environment |

---

## Running the Server

- **Start in Production Mode:**
  ```bash
  npm start
  ```

- **Start in Development Mode (Live Watch):**
  ```bash
  npm run dev
  ```

The server will display:
```
Server is running on http://localhost:5000
```

---

## API Routes Reference

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/` or `/api` | API Info, metadata, student details & route list | `200` |
| `GET` | `/tasks` | Retrieve all tasks from memory | `200` |
| `GET` | `/tasks/:id` | Retrieve a specific task by its numeric ID | `200`, `400`, `404` |
| `POST` | `/tasks` | Create a new task (Requires `application/json`) | `201`, `400` |
| `PUT` | `/tasks/:id` | Update an existing task (Requires `application/json`) | `200`, `400`, `404` |
| `DELETE` | `/tasks/:id` | Delete a task by its numeric ID | `200`, `400`, `404` |
| `*` | Any other route | Unmatched route handler | `404` |

---

## API Request & Response Examples

### 1. API Metadata & Welcome (`GET /api`)
**Request:**
```bash
curl -X GET http://localhost:5000/api
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task Management REST API - CHARUSAT ITUE301 Practical 4",
  "student": {
    "name": "Ansh Sojitra",
    "studentId": "24CS095",
    "academicYear": "2026-27"
  },
  "endpoints": {
    "GET /tasks": "Retrieve all tasks",
    "GET /tasks/:id": "Retrieve a specific task by ID",
    "POST /tasks": "Create a new task (Content-Type: application/json required)",
    "PUT /tasks/:id": "Update an existing task (Content-Type: application/json required)",
    "DELETE /tasks/:id": "Delete a task by ID"
  }
}
```

---

### 2. Get All Tasks (`GET /tasks`)
**Request:**
```bash
curl -X GET http://localhost:5000/tasks
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "Learn Express.js",
      "description": "Study Express fundamentals, routing, and middleware architecture",
      "completed": false
    },
    {
      "id": 2,
      "title": "Build RESTful API",
      "description": "Implement CRUD endpoints with proper HTTP status codes",
      "completed": true
    },
    {
      "id": 3,
      "title": "Implement Custom Middleware",
      "description": "Add request logger, Content-Type validator, and task ID validator",
      "completed": false
    }
  ]
}
```

---

### 3. Get Single Task by ID (`GET /tasks/1`)
**Request:**
```bash
curl -X GET http://localhost:5000/tasks/1
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Learn Express.js",
    "description": "Study Express fundamentals, routing, and middleware architecture",
    "completed": false
  }
}
```

---

### 4. Create Task (`POST /tasks`)
**Request:**
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Submit Practical 4 Assignment",
    "description": "Verify code, execute tests, and push to GitHub repository",
    "completed": false
  }'
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 4,
    "title": "Submit Practical 4 Assignment",
    "description": "Verify code, execute tests, and push to GitHub repository",
    "completed": false
  }
}
```

---

### 5. Update Task (`PUT /tasks/4`)
**Request:**
```bash
curl -X PUT http://localhost:5000/tasks/4 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Submit Practical 4 Assignment (Completed)",
    "completed": true
  }'
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 4,
    "title": "Submit Practical 4 Assignment (Completed)",
    "description": "Verify code, execute tests, and push to GitHub repository",
    "completed": true
  }
}
```

---

### 6. Delete Task (`DELETE /tasks/4`)
**Request:**
```bash
curl -X DELETE http://localhost:5000/tasks/4
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": 4,
    "title": "Submit Practical 4 Assignment (Completed)",
    "description": "Verify code, execute tests, and push to GitHub repository",
    "completed": true
  }
}
```

---

### 7. Validation & Error Responses

#### A. Missing Content-Type Header on POST/PUT (Post-Lab)
**Request:**
```bash
curl -X POST http://localhost:5000/tasks -d '{"title": "Test"}'
```
**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Invalid or missing Content-Type header. Expected 'application/json'."
}
```

#### B. Invalid Task ID Format (Post-Lab)
**Request:**
```bash
curl -X GET http://localhost:5000/tasks/abc
```
**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Invalid task ID 'abc'. Task ID must be a positive integer."
}
```

#### C. Nonexistent Task ID
**Request:**
```bash
curl -X GET http://localhost:5000/tasks/9999
```
**Response (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Task with ID 9999 not found"
}
```

#### D. Missing Required Title on POST
**Request:**
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"description": "No title here"}'
```
**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Title is required and must be a non-empty string."
}
```

#### E. Unrecognized Route (404 Handler)
**Request:**
```bash
curl -X GET http://localhost:5000/unknown-route
```
**Response (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Route not found: GET /unknown-route"
}
```

#### F. Malformed JSON Body (Global Error Handler)
**Request:**
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{ title: broken-json }'
```
**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Expected property name or '}' in JSON at position 2 (line 1 column 3)",
  "error": "SyntaxError"
}
```
*(No server stack trace leaked to client)*

---

## Post-Lab Requirements

1. **Strict Content-Type Validation (`middleware/validateContentType.js`)**:
   - Rejects any `POST` or `PUT` request lacking `Content-Type: application/json` before reaching controllers.
   - Responds with `400 Bad Request` and descriptive error message.

2. **Route Parameter Pre-Validation (`middleware/validateTaskId.js`)**:
   - Validates that the `:id` parameter on `/tasks/:id` is a strictly positive integer string.
   - Rejects non-numeric characters, negative numbers, and zero with `400 Bad Request` prior to executing any array operations or business logic.

---

## Automated & Manual Testing Instructions

### Automated Test Suite (`npm test`)
Execute the automated test script containing 43 unit and integration assertions:
```bash
npm test
```

**Real Test Output:**
```
============================================================
 Practical 4 - TaskManager API Automated Test Suite
 Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301
============================================================

[Test Server] Running on http://127.0.0.1:5095

--- 1. API Metadata & Root Route ---
  ✔ PASS: GET /api returns HTTP 200
  ✔ PASS: GET /api returns success: true
  ✔ PASS: GET /api includes student ID 24CS095

--- 2. CRUD: GET /tasks (Read All) ---
  ✔ PASS: GET /tasks returns HTTP 200
  ✔ PASS: GET /tasks returns success: true
  ✔ PASS: GET /tasks data is an array
  ✔ PASS: GET /tasks contains initial tasks
  ✔ PASS: Tasks conform to schema (id, title, description, completed)

--- 3. CRUD: POST /tasks (Create Task) ---
  ✔ PASS: POST /tasks returns HTTP 201 Created
  ✔ PASS: POST /tasks returns success: true
  ✔ PASS: Created task has correct title
  ✔ PASS: Created task has correct description
  ✔ PASS: Created task has correct completed status
  ✔ PASS: Created task has numeric ID

--- 4. CRUD: GET /tasks/:id (Read Single) ---
  ✔ PASS: GET /tasks/:id returns HTTP 200
  ✔ PASS: Fetched task matches requested ID

--- 5. CRUD: PUT /tasks/:id (Update Task) ---
  ✔ PASS: PUT /tasks/:id returns HTTP 200
  ✔ PASS: PUT /tasks/:id returns success: true
  ✔ PASS: Updated task has new title
  ✔ PASS: Updated task has completed: true
  ✔ PASS: Unmodified fields remain intact

--- 6. CRUD: DELETE /tasks/:id (Delete Task) ---
  ✔ PASS: DELETE /tasks/:id returns HTTP 200
  ✔ PASS: DELETE /tasks/:id returns success: true
  ✔ PASS: Deleted task returned in response
  ✔ PASS: GET /tasks/:id after deletion returns HTTP 404

--- 7. Post-Lab Requirement: Content-Type Validation ---
  ✔ PASS: POST without Content-Type returns HTTP 400
  ✔ PASS: Missing Content-Type returns success: false
  ✔ PASS: PUT with Content-Type: text/plain returns HTTP 400

--- 8. Post-Lab Requirement: Task ID Validation ---
  ✔ PASS: GET /tasks/abc returns HTTP 400 Bad Request
  ✔ PASS: Invalid ID response has success: false
  ✔ PASS: DELETE /tasks/-5 returns HTTP 400 Bad Request
  ✔ PASS: GET /tasks/0 returns HTTP 400 Bad Request

--- 9. Error Handling: Nonexistent Task & Missing Body Fields ---
  ✔ PASS: GET /tasks/99999 returns HTTP 404 Not Found
  ✔ PASS: Nonexistent ID returns success: false
  ✔ PASS: POST /tasks with missing title returns HTTP 400
  ✔ PASS: Missing title returns success: false
  ✔ PASS: PUT /tasks/1 with empty payload returns HTTP 400

--- 10. Unknown Route (404) & Global Error Handling ---
  ✔ PASS: Unknown route returns HTTP 404
  ✔ PASS: Unknown route response has success: false
  ✔ PASS: Unknown route returns descriptive message
  ✔ PASS: Malformed JSON returns HTTP 400 from errorHandler
  ✔ PASS: Malformed JSON returns success: false
  ✔ PASS: Global error handler does not expose stack traces to client

============================================================
 Test Summary: 43 Passed | 0 Failed
============================================================
```

### Manual Testing with Postman
Import `TaskManagerAPI.postman_collection.json` into Postman or Thunder Client to run the requests against `http://localhost:5000`.

---

## Testing Evidence Checklist

- [x] Server boots successfully on port 5000 (configurable via `.env`).
- [x] `GET /tasks` lists all seed tasks with `id`, `title`, `description`, `completed`.
- [x] `POST /tasks` validates title and creates a new task (`201 Created`).
- [x] `GET /tasks/:id` retrieves single task by numeric ID (`200 OK`).
- [x] `PUT /tasks/:id` updates title, description, or completed status (`200 OK`).
- [x] `DELETE /tasks/:id` deletes task by ID (`200 OK`).
- [x] `validateContentType` rejects POST/PUT requests missing `Content-Type: application/json` (`400 Bad Request`).
- [x] `validateTaskId` pre-validates task ID parameters prior to controller logic (`400 Bad Request`).
- [x] Nonexistent task ID returns clean JSON (`404 Not Found`).
- [x] Unknown routes return structured JSON (`404 Not Found`).
- [x] Global error handler catches errors without exposing stack traces (`500` / `400`).
- [x] Every request generates ISO timestamped console log: `[<ISO_TIMESTAMP>] <METHOD> <URL>`.

---

## VCS / Git Submission

- **Repository Name:** `task-manager-api-24CS095`
- **Branch:** `main`
- **Ignored Artifacts:** `node_modules/`, `.env`
- **Tracked Artifacts:** Codebase, `package.json`, `package-lock.json`, Postman collection, test suite, and `README.md`.
