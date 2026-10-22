# Practical 5: MongoDB Integration and Schema Design with Mongoose

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
- [Mongoose Schema Design (`models/Task.js`)](#mongoose-schema-design-modelstaskjs)
- [Database Connection & Safety (`config/db.js`)](#database-connection--safety-configdbjs)
- [API Routes Reference](#api-routes-reference)
- [Error Handling & ID Validation](#error-handling--id-validation)
- [MongoDB Setup Guide (Local & Atlas)](#mongodb-setup-guide-local--atlas)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Request & Response Examples](#api-request--response-examples)
- [Automated Test Suite & Verification](#automated-test-suite--verification)
- [Evidence & Acceptance Checklist](#evidence--acceptance-checklist)
- [Git Submission & Repository Plan](#git-submission--repository-plan)

---

## Objective
Replace the in-memory array storage from Practical 4 with **MongoDB** and **Mongoose ODM models**, while preserving all RESTful API contracts and adding robust schema validation, whitespace normalization, and safe identifier verification.

### Core Objectives:
1. **Persistent Storage:** Replace ephemeral in-memory storage with MongoDB persistence so tasks remain across server restarts.
2. **Mongoose Schema & Validation:** Design `models/Task.js` featuring strict data types, required constraints, enum verification for `priority`, default timestamps, and pre-save hooks/setters for whitespace trimming.
3. **Safe Identifier Handling:** Safely validate MongoDB 24-character hexadecimal `ObjectId`s. Return structured `400 Bad Request` for malformed IDs and `404 Not Found` when a valid ID is absent.
4. **Asynchronous Error Forwarding:** Forward async route exceptions to centralized error middleware, translating Mongoose `ValidationError` and `CastError` instances into clean, client-readable JSON.
5. **Secure Configuration:** Never hardcode database credentials. Load `MONGO_URI` dynamically from `.env` using `dotenv`, maintain `.env.example`, and enforce `.gitignore` rules.

---

## Architecture & Folder Structure

```
task-manager-api-24CS095/
├── config/
│   └── db.js                   # Mongoose connection manager (loads MONGO_URI from .env)
├── middleware/
│   ├── logger.js               # Global request logger (Method, URL, ISO timestamp)
│   ├── validateContentType.js  # Enforces Content-Type: application/json on POST/PUT
│   ├── validateTaskId.js       # Pre-validates 24-hex MongoDB ObjectId before DB queries
│   └── errorHandler.js         # Formats ValidationError, CastError, and hides stack traces
├── models/
│   └── Task.js                 # Mongoose schema, validation, priority enum & pre-save hook
├── routes/
│   └── tasks.js                # Task CRUD endpoints using Mongoose model methods
├── .env                        # Local secret environment configuration (git-ignored)
├── .env.example                # Safe environment template with placeholder MONGO_URI
├── .gitignore                  # Git ignore rules (node_modules, .env, *.log)
├── app.js                      # Express application entry point, middleware & DB trigger
├── package.json                # Project dependencies (express, mongoose, dotenv)
├── package-lock.json           # Locked dependency tree
├── TaskManagerAPI.postman_collection.json # Postman v2.1 collection for Practical 5
├── test.js                     # Automated test suite (50 passing assertions)
└── README.md                   # University practical documentation and report
```

---

## Mongoose Schema Design (`models/Task.js`)

The `Task` model is defined in `models/Task.js` using Mongoose:

| Field | Type | Constraints & Defaults | Purpose |
|---|---|---|---|
| `title` | `String` | Required (`true`), trimmed of whitespace, non-empty custom validator | Primary title of the task |
| `description` | `String` | Optional, default: `""`, trimmed | Detailed explanation of the task |
| `completed` | `Boolean` | Optional, default: `false` | Completion status flag |
| `createdAt` | `Date` | Default: `Date.now` | Automatic document creation timestamp |
| `priority` | `String` | Enum: `['low', 'medium', 'high']`, default: `'medium'`, lowercase | Priority classification |

### Whitespace Trimming Hook:
To fulfill the requirement to trim title whitespace with a pre-save hook and schema setter:
- **Schema Setter:** `set: (val) => (typeof val === "string" ? val.trim() : val)` strips leading and trailing whitespace on input.
- **Pre-Save Hook:**
  ```javascript
  taskSchema.pre("save", function (next) {
    if (this.title && typeof this.title === "string") {
      this.title = this.title.trim();
    }
    if (this.description && typeof this.description === "string") {
      this.description = this.description.trim();
    }
    if (typeof next === "function") next();
  });
  ```

---

## Database Connection & Safety (`config/db.js`)

The application connects to MongoDB using a dedicated configuration module:
- **No Hardcoded Credentials:** `MONGO_URI` is extracted strictly from `process.env.MONGO_URI`.
- **Fail-Fast Mechanism:** If `MONGO_URI` is missing, the application halts startup with an informative error rather than attempting insecure defaults.
- **Connection Diagnostics:** Successful connection logs host, port, and database name.

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    throw new Error("FATAL: MONGO_URI is not defined in environment variables (.env).");
  }
  return await mongoose.connect(mongoURI);
};
```

---

## API Routes Reference

| Method | Endpoint | Description | Expected Status Codes |
|---|---|---|---|
| `GET` | `/api` | Service info, student metadata, DB status | `200 OK` |
| `GET` | `/tasks` | Retrieve all tasks from MongoDB (sorted newest first) | `200 OK` |
| `GET` | `/tasks/:id` | Retrieve single task by MongoDB ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/tasks` | Create a new task (enforces title & priority enum) | `201 Created`, `400 Bad Request` |
| `PUT` | `/tasks/:id` | Update an existing task by ObjectId with validation | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete a task document by ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

## Error Handling & ID Validation

### 1. Malformed Mongo ID vs Nonexistent Valid ID:
- **Malformed ID (e.g. `GET /tasks/123` or `GET /tasks/abc`):**
  Intercepted by `middleware/validateTaskId.js` using `mongoose.Types.ObjectId.isValid(id)`. Returns:
  ```json
  {
    "success": false,
    "message": "Invalid task ID format '123'. Task ID must be a valid 24-character hexadecimal MongoDB ObjectId."
  }
  ```
  *HTTP Status: 400 Bad Request*
- **Nonexistent Valid ID (e.g. `GET /tasks/507f1f77bcf86cd799439011`):**
  Queried via `Task.findById(id)`. Returns:
  ```json
  {
    "success": false,
    "message": "Task with ID 507f1f77bcf86cd799439011 not found"
  }
  ```
  *HTTP Status: 404 Not Found*

### 2. Mongoose Schema Validation Formatting:
When Mongoose validation fails (missing title, whitespace-only title, invalid priority enum), `middleware/errorHandler.js` formats the error cleanly into JSON:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "'critical' is not a valid priority. Allowed values: low, medium, high."
  ]
}
```
*HTTP Status: 400 Bad Request*

---

## MongoDB Setup Guide (Local & Atlas)

### Option A: Local MongoDB (Default & Recommended for Lab)
1. **Windows Service Check:**
   MongoDB Community Server runs as a Windows Service named `MongoDB` on port `27017`.
   Check service status in PowerShell:
   ```powershell
   Get-Service -Name "*mongo*"
   ```
2. **Start Service (if stopped):**
   ```powershell
   Start-Service -Name "MongoDB"
   ```
3. Set your `.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/task_manager
   ```

### Option B: MongoDB Atlas (Cloud Cluster)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user and password.
3. Under **Network Access**, add `0.0.0.0/0` (or your current IP address).
4. Under **Connect** > **Drivers**, copy the connection string.
5. Set your `.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/task_manager?retryWrites=true&w=majority
   ```

---

## Installation & Setup

1. **Clone or Navigate to the Workspace:**
   ```bash
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
   Ensure `.env` contains your active `MONGO_URI`.

---

## Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Application environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/task_manager` |

> [!IMPORTANT]
> The `.env` file is explicitly ignored by `.gitignore` and is never committed to Git. Only `.env.example` with safe placeholders is tracked in the repository.

---

## Running the Server

### Production Mode:
```bash
npm start
```

### Development Mode (with Node.js auto-reloader):
```bash
npm run dev
```

Expected startup terminal output:
```
[Database] MongoDB Connected successfully: 127.0.0.1:27017/task_manager
Server is running on http://localhost:5000
```

---

## API Request & Response Examples

### 1. Create Task with Priority and Whitespace Trimming
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "   Prepare Practical 5 Submission   ",
    "description": "Verify MongoDB integration and Mongoose validation",
    "completed": false,
    "priority": "high"
  }'
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "6ad9dd4f41481c2b0161d585",
    "title": "Prepare Practical 5 Submission",
    "description": "Verify MongoDB integration and Mongoose validation",
    "completed": false,
    "priority": "high",
    "createdAt": "2026-10-22T09:54:23.536Z",
    "id": "6ad9dd4f41481c2b0161d585"
  }
}
```

### 2. Validation Error on Invalid Priority Enum
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invalid Priority Task",
    "priority": "urgent"
  }'
```
**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "'urgent' is not a valid priority. Allowed values: low, medium, high."
  ]
}
```

### 3. Malformed MongoDB ID
```bash
curl -X GET http://localhost:5000/tasks/invalid-id-123
```
**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Invalid task ID format 'invalid-id-123'. Task ID must be a valid 24-character hexadecimal MongoDB ObjectId."
}
```

### 4. Nonexistent Valid MongoDB ID
```bash
curl -X GET http://localhost:5000/tasks/507f1f77bcf86cd799439011
```
**Response (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Task with ID 507f1f77bcf86cd799439011 not found"
}
```

---

## Automated Test Suite & Verification

Run the automated integration test suite:
```bash
npm test
```

### Test Suite Execution Output:
```
============================================================
 Practical 5 - TaskManager API Automated Test Suite
 Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301
 Focus: MongoDB Integration & Mongoose Schema Validation
============================================================

--- 1. MongoDB Connection Verification ---
[Database] MongoDB Connected successfully: 127.0.0.1:27017/task_manager
  ✔ PASS: MongoDB connection established successfully (readyState === 1)
  Connected to DB host: 127.0.0.1:27017/task_manager

--- 2. API Info & Root Route ---
  ✔ PASS: GET /api returns HTTP 200
  ✔ PASS: GET /api returns success: true
  ✔ PASS: Metadata includes Student ID 24CS095
  ✔ PASS: Metadata confirms MongoDB engine

--- 3. Mongoose CRUD: POST /tasks (Create Task & Whitespace Trimming) ---
  ✔ PASS: POST /tasks returns HTTP 201 Created
  ✔ PASS: POST /tasks returns success: true
  ✔ PASS: Created task has MongoDB _id
  ✔ PASS: Title whitespace trimmed by schema setter/pre-save hook
  ✔ PASS: Priority correctly set to 'high'
  ✔ PASS: Default or provided completed: false set
  ✔ PASS: createdAt timestamp generated automatically

--- 4. Mongoose CRUD: GET /tasks (Read All) ---
  ✔ PASS: GET /tasks returns HTTP 200
  ✔ PASS: GET /tasks returns success: true
  ✔ PASS: GET /tasks data is an array
  ✔ PASS: Created task present in list returned from MongoDB

--- 5. Mongoose CRUD: GET /tasks/:id (Read Single by Valid ObjectId) ---
  ✔ PASS: GET /tasks/:id returns HTTP 200 for existing ObjectId
  ✔ PASS: Fetched task matches requested _id
  ✔ PASS: Fetched task title is accurate

--- 6. Mongoose CRUD: PUT /tasks/:id (Update Task & Enum Check) ---
  ✔ PASS: PUT /tasks/:id returns HTTP 200
  ✔ PASS: PUT /tasks/:id returns success: true
  ✔ PASS: Updated title is trimmed
  ✔ PASS: Updated completed flag is true
  ✔ PASS: Updated priority changed to 'medium'

--- 7. Verification: Data Persistence Across Server Restart ---
  Stopping HTTP test server...
  Restarting HTTP test server...
  ✔ PASS: GET /tasks/:id after server restart returns HTTP 200
  ✔ PASS: Task survived server restart with intact ID
  ✔ PASS: Task data survived server restart unchanged

--- 8. Mongoose CRUD: DELETE /tasks/:id (Delete Task) ---
  ✔ PASS: DELETE /tasks/:id returns HTTP 200
  ✔ PASS: DELETE /tasks/:id returns success: true
  ✔ PASS: Deleted task document returned
  ✔ PASS: GET /tasks/:id after deletion returns HTTP 404
  ✔ PASS: Deletion verification response has success: false

--- 9. Error Handling: Nonexistent Valid ObjectId vs Malformed ObjectId ---
  ✔ PASS: Valid nonexistent ObjectId returns HTTP 404
  ✔ PASS: Nonexistent task response has success: false
  ✔ PASS: Structured 404 message indicates task not found
  ✔ PASS: Malformed ObjectId returns HTTP 400 Bad Request
  ✔ PASS: Malformed ID returns success: false
  ✔ PASS: Malformed ID error message is clear and structured

--- 10. Mongoose Schema Validation: Missing Title & Invalid Priority Enum ---
  ✔ PASS: POST with missing title returns HTTP 400
  ✔ PASS: Missing title response has success: false
  ✔ PASS: Validation errors returned as readable array
  ✔ PASS: POST with whitespace-only title returns HTTP 400
  ✔ PASS: Whitespace-only title rejected
  ✔ PASS: POST with invalid priority enum returns HTTP 400
  ✔ PASS: Invalid priority rejected
  ✔ PASS: Enum validation error explains allowed values (low, medium, high)

--- 11. Middleware & Protocol Validation ---
  ✔ PASS: POST without application/json returns HTTP 400
  ✔ PASS: Malformed JSON syntax returns HTTP 400 from errorHandler
  ✔ PASS: Stack traces are hidden from error responses
  ✔ PASS: Unknown endpoint returns HTTP 404

============================================================
 Test Summary: 50 Passed | 0 Failed
============================================================
```

---

## Evidence & Acceptance Checklist

- [x] **MongoDB Connection via dotenv**: Loaded from `MONGO_URI`, no credentials hardcoded.
- [x] **Mongoose Schema (`models/Task.js`)**: All fields (`title`, `description`, `completed`, `createdAt`, `priority`) implemented with exact requirements.
- [x] **Whitespace Trimming**: Handled via schema setter and Mongoose pre-save hook.
- [x] **Priority Enum Validation**: Accepts only `low`, `medium`, `high`; rejects invalid values with descriptive error.
- [x] **Mongoose Model Operations**: `Task.find()`, `Task.findById()`, `Task.create()`, `Task.findByIdAndUpdate()`, `Task.findByIdAndDelete()` replace all in-memory arrays.
- [x] **Safe Mongo ID Handling**: Returns `400 Bad Request` for malformed IDs without crashing or throwing uncaught `CastError`.
- [x] **Structured 404**: Returns formatted `{ success: false, message: ... }` for valid nonexistent ObjectIds.
- [x] **Async Error Forwarding**: All route handlers forward errors to `errorHandler.js` via `next(err)`.
- [x] **Server Restart Data Persistence**: Tested and verified — tasks persist across server process restarts.
- [x] **Environment Security**: `.env` is ignored by `.gitignore`; `.env.example` with safe placeholder is committed.
- [x] **Automated Tests**: 50 automated assertions passing with 0 failures.

---

## Git Submission & Repository Plan

- **Repository**: Extended existing `task-manager-api-24CS095` repository from Practical 4.
- **Commit Message**: `feat: persist tasks with MongoDB and Mongoose validation`
- **Remote URL**: `https://github.com/AnshSojitra/task-manager-api-24CS095.git`
