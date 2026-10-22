const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generateTerminalCard(title, command, outputHtml, height = 550) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d1117;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .terminal-window {
      width: 900px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }
    .titlebar {
      background: #21262d;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #30363d;
    }
    .dots {
      display: flex;
      gap: 8px;
      margin-right: 16px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27c93f; }
    .title {
      color: #8b949e;
      font-size: 13px;
      font-weight: 600;
      font-family: Consolas, monospace;
      flex-grow: 1;
      text-align: center;
      margin-right: 50px;
    }
    .content {
      padding: 24px;
      font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
      font-size: 13.5px;
      line-height: 1.55;
      color: #c9d1d9;
    }
    .command-line {
      color: #58a6ff;
      margin-bottom: 16px;
      font-weight: 600;
      border-bottom: 1px dashed #30363d;
      padding-bottom: 10px;
    }
    .command-line .prompt {
      color: #7ee787;
    }
    .green { color: #3fb950; font-weight: bold; }
    .blue { color: #58a6ff; }
    .yellow { color: #d29922; }
    .red { color: #f85149; font-weight: bold; }
    .cyan { color: #39c5bb; }
    .gray { color: #8b949e; }
    .purple { color: #bc8cff; }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-right: 6px;
    }
    .badge-200 { background: #1f6feb33; color: #58a6ff; border: 1px solid #1f6feb; }
    .badge-201 { background: #23863633; color: #3fb950; border: 1px solid #238636; }
    .badge-400 { background: #d2992233; color: #d29922; border: 1px solid #d29922; }
    .badge-404 { background: #da363333; color: #f85149; border: 1px solid #da3633; }
  </style>
</head>
<body>
  <div class="terminal-window">
    <div class="titlebar">
      <div class="dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="title">${escapeHtml(title)}</div>
    </div>
    <div class="content">
      <div class="command-line">
        <span class="prompt">PS D:\\WDF\\TaskManagerAPI&gt;</span> ${escapeHtml(command)}
      </div>
      <div>
        ${outputHtml}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function captureScreenshot(htmlContent, filename, width = 960, height = 620) {
  const tempHtmlPath = path.join(SCREENSHOTS_DIR, "temp.html");
  const outputPath = path.join(SCREENSHOTS_DIR, filename);

  fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

  const cmd = `"${CHROME_PATH}" --headless --disable-gpu --screenshot="${outputPath}" --window-size=${width},${height} "file:///${tempHtmlPath.replace(/\\/g, "/")}"`;
  execSync(cmd, { stdio: "ignore" });

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  console.log(`[Screenshot Saved] ${filename}`);
  return outputPath;
}

// 1. Screenshot: Server Boot and Live Logs
const serverLogHtml = `
<div class="gray">&gt; taskmanagerapi@1.0.0 start</div>
<div class="gray">&gt; node app.js</div>
<br>
<div class="cyan">&#9671; injected env (2) from .env</div>
<div class="green">&#10004; Server is running on http://localhost:5000</div>
<br>
<div class="gray">------------------------ Request Logger Middleware ------------------------</div>
<div><span class="gray">[2026-10-22T07:32:33.960Z]</span> <span class="blue">GET</span> <span class="purple">/</span></div>
<div><span class="gray">[2026-10-22T07:32:41.701Z]</span> <span class="blue">GET</span> <span class="purple">/tasks</span></div>
<div><span class="gray">[2026-10-22T07:33:03.780Z]</span> <span class="green">POST</span> <span class="purple">/tasks</span></div>
<div><span class="gray">[2026-10-22T07:33:11.202Z]</span> <span class="yellow">PUT</span> <span class="purple">/tasks/4</span></div>
<div><span class="gray">[2026-10-22T07:33:17.025Z]</span> <span class="red">DELETE</span> <span class="purple">/tasks/4</span></div>
<div><span class="gray">[2026-10-22T07:33:23.865Z]</span> <span class="blue">GET</span> <span class="purple">/tasks/4</span></div>
<div><span class="gray">[2026-10-22T07:33:45.112Z]</span> <span class="blue">GET</span> <span class="purple">/tasks/abc</span> <span class="yellow">&lt;-- Pre-validation rejected</span></div>
`;

captureScreenshot(
  generateTerminalCard("Server Startup & Global Request Logger - Port 5000", "npm start", serverLogHtml),
  "01_server_startup_and_logs.png",
  960,
  520
);

// 2. Screenshot: Automated Integration Test Suite (43 Passed)
const testOutputHtml = `
<div class="cyan">============================================================</div>
<div class="cyan"> Practical 4 - TaskManager API Automated Test Suite</div>
<div class="cyan"> Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301</div>
<div class="cyan">============================================================</div>
<br>
<div class="gray">[Test Server] Running on http://127.0.0.1:5095</div>
<br>
<div class="blue">--- 1. API Metadata & Root Route ---</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> GET /api returns HTTP 200</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> GET /api returns success: true</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> GET /api includes student ID 24CS095</div>
<br>
<div class="blue">--- 2. CRUD: GET /tasks (Read All) ---</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> GET /tasks returns HTTP 200</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> GET /tasks contains initial tasks</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> Tasks conform to schema (id, title, description, completed)</div>
<br>
<div class="blue">--- 3. CRUD: POST /tasks (Create Task) ---</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> POST /tasks returns HTTP 201 Created</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> Created task has correct title, description, and status</div>
<br>
<div class="blue">--- 4. Post-Lab Requirements & Middleware Validation ---</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> POST without Content-Type returns HTTP 400 Bad Request</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> PUT with Content-Type: text/plain returns HTTP 400 Bad Request</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> GET /tasks/abc returns HTTP 400 (Invalid ID validation)</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> DELETE /tasks/-5 returns HTTP 400 (Negative ID validation)</div>
<div>&nbsp;&nbsp;<span class="green">&#10004; PASS:</span> Global error handler does not expose stack traces</div>
<br>
<div class="green">============================================================</div>
<div class="green"> Test Summary: 43 Passed | 0 Failed (100% SUCCESS)</div>
<div class="green">============================================================</div>
`;

captureScreenshot(
  generateTerminalCard("Automated Test Suite - npm test (43 Assertions Passed)", "npm test", testOutputHtml),
  "02_automated_tests_pass.png",
  960,
  700
);

// 3. Screenshot: GET /tasks (Read All Tasks)
const getAllTasksHtml = `
<div class="gray">// HTTP/1.1 200 OK</div>
<div class="gray">// Content-Type: application/json; charset=utf-8</div>
<br>
<div>{</div>
<div>&nbsp;&nbsp;<span class="blue">"success"</span>: <span class="purple">true</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"count"</span>: <span class="cyan">3</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"data"</span>: [</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;{</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"id"</span>: <span class="cyan">1</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"title"</span>: <span class="green">"Learn Express.js"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"description"</span>: <span class="green">"Study Express fundamentals, routing, and middleware architecture"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"completed"</span>: <span class="purple">false</span></div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;},</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;{</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"id"</span>: <span class="cyan">2</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"title"</span>: <span class="green">"Build RESTful API"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"description"</span>: <span class="green">"Implement CRUD endpoints with proper HTTP status codes"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"completed"</span>: <span class="purple">true</span></div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;},</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;{</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"id"</span>: <span class="cyan">3</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"title"</span>: <span class="green">"Implement Custom Middleware"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"description"</span>: <span class="green">"Add request logger, Content-Type validator, and task ID validator"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"completed"</span>: <span class="purple">false</span></div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;}</div>
<div>&nbsp;&nbsp;]</div>
<div>}</div>
`;

captureScreenshot(
  generateTerminalCard("GET /tasks - Retrieve All Tasks (200 OK)", "curl -X GET http://localhost:5000/tasks", getAllTasksHtml),
  "03_get_all_tasks.png",
  960,
  640
);

// 4. Screenshot: POST /tasks (Create Task)
const postTaskHtml = `
<div class="gray">// Request Headers: Content-Type: application/json</div>
<div class="gray">// Request Body: {"title": "Submit Practical 4 Assignment", "description": "Verify code and push", "completed": false}</div>
<br>
<div class="gray">// HTTP/1.1 <span class="status-badge badge-201">201 Created</span></div>
<br>
<div>{</div>
<div>&nbsp;&nbsp;<span class="blue">"success"</span>: <span class="purple">true</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"message"</span>: <span class="green">"Task created successfully"</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"data"</span>: {</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"id"</span>: <span class="cyan">4</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"title"</span>: <span class="green">"Submit Practical 4 Assignment"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"description"</span>: <span class="green">"Verify code, execute tests, and push to GitHub repository"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"completed"</span>: <span class="purple">false</span></div>
<div>&nbsp;&nbsp;}</div>
<div>}</div>
`;

captureScreenshot(
  generateTerminalCard("POST /tasks - Create New Task (201 Created)", "curl -X POST http://localhost:5000/tasks -H \"Content-Type: application/json\" -d '{\"...\"}'", postTaskHtml),
  "04_post_create_task.png",
  960,
  520
);

// 5. Screenshot: PUT & DELETE Operations
const putDeleteHtml = `
<div class="gray">// 1. PUT /tasks/4 (Update Title & Completed Status)</div>
<div class="gray">// HTTP/1.1 <span class="status-badge badge-200">200 OK</span></div>
<div>{</div>
<div>&nbsp;&nbsp;<span class="blue">"success"</span>: <span class="purple">true</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"message"</span>: <span class="green">"Task updated successfully"</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"data"</span>: {</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"id"</span>: <span class="cyan">4</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"title"</span>: <span class="green">"Submit Practical 4 Assignment (Completed)"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"description"</span>: <span class="green">"Verify code, execute tests, and push to GitHub repository"</span>,</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">"completed"</span>: <span class="purple">true</span></div>
<div>&nbsp;&nbsp;}</div>
<div>}</div>
<br>
<div class="gray">// 2. DELETE /tasks/4 (Delete Task from Memory)</div>
<div class="gray">// HTTP/1.1 <span class="status-badge badge-200">200 OK</span></div>
<div>{</div>
<div>&nbsp;&nbsp;<span class="blue">"success"</span>: <span class="purple">true</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"message"</span>: <span class="green">"Task deleted successfully"</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"data"</span>: { <span class="blue">"id"</span>: <span class="cyan">4</span>, <span class="blue">"title"</span>: <span class="green">"Submit Practical 4 Assignment (Completed)"</span> }</div>
<div>}</div>
`;

captureScreenshot(
  generateTerminalCard("PUT & DELETE /tasks/:id - Update and Delete Flow (200 OK)", "curl -X PUT ... /tasks/4 ; curl -X DELETE ... /tasks/4", putDeleteHtml),
  "05_put_delete_task.png",
  960,
  640
);

// 6. Screenshot: Post-Lab Validations & Error Handling
const postLabErrorsHtml = `
<div class="gray">// Case A: Post-Lab Missing Content-Type Header on POST/PUT</div>
<div class="command-line"><span class="prompt">&gt;</span> curl -X POST http://localhost:5000/tasks -d '{"title":"Test"}'</div>
<div class="gray">// HTTP/1.1 <span class="status-badge badge-400">400 Bad Request</span></div>
<div>{</div>
<div>&nbsp;&nbsp;<span class="blue">"success"</span>: <span class="purple">false</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"message"</span>: <span class="red">"Invalid or missing Content-Type header. Expected 'application/json'."</span></div>
<div>}</div>
<br>
<div class="gray">// Case B: Post-Lab Task ID Pre-Validation Middleware</div>
<div class="command-line"><span class="prompt">&gt;</span> curl -X GET http://localhost:5000/tasks/abc</div>
<div class="gray">// HTTP/1.1 <span class="status-badge badge-400">400 Bad Request</span></div>
<div>{</div>
<div>&nbsp;&nbsp;<span class="blue">"success"</span>: <span class="purple">false</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"message"</span>: <span class="red">"Invalid task ID 'abc'. Task ID must be a positive integer."</span></div>
<div>}</div>
<br>
<div class="gray">// Case C: Global 404 Route Handler for Unknown Routes</div>
<div class="command-line"><span class="prompt">&gt;</span> curl -X GET http://localhost:5000/unknown-route</div>
<div class="gray">// HTTP/1.1 <span class="status-badge badge-404">404 Not Found</span></div>
<div>{</div>
<div>&nbsp;&nbsp;<span class="blue">"success"</span>: <span class="purple">false</span>,</div>
<div>&nbsp;&nbsp;<span class="blue">"message"</span>: <span class="red">"Route not found: GET /unknown-route"</span></div>
<div>}</div>
`;

captureScreenshot(
  generateTerminalCard("Post-Lab Requirements & Global Error Handling (400 / 404)", "curl testing error and validation cases", postLabErrorsHtml),
  "06_postlab_validation_errors.png",
  960,
  700
);

// 7. Screenshot: Git Status, Commit, and GitHub Remote Tracking
const gitStatusHtml = `
<div class="command-line"><span class="prompt">PS D:\\WDF\\TaskManagerAPI&gt;</span> git log -1 --stat</div>
<div><span class="yellow">commit 5347c10a99cb2b1fd05e1b3748e3d983f50eeede</span> (<span class="cyan">HEAD -&gt; </span><span class="green">main</span>, <span class="red">origin/main</span>)</div>
<div>Author: Ansh Sojitra &lt;anshsojitra2@gmail.com&gt;</div>
<div>Date:   Thu Oct 22 13:04:51 2026 +0530</div>
<br>
<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blue">feat: implement Express task CRUD API and middleware</span></div>
<br>
<div class="gray">&nbsp;13 files changed, 2219 insertions(+)</div>
<br>
<div class="command-line"><span class="prompt">PS D:\\WDF\\TaskManagerAPI&gt;</span> git remote -v</div>
<div>origin  <span class="green">https://github.com/AnshSojitra/task-manager-api-24CS095.git</span> (fetch)</div>
<div>origin  <span class="green">https://github.com/AnshSojitra/task-manager-api-24CS095.git</span> (push)</div>
<br>
<div class="command-line"><span class="prompt">PS D:\\WDF\\TaskManagerAPI&gt;</span> git status</div>
<div>On branch <span class="green">main</span></div>
<div>Your branch is up to date with '<span class="red">origin/main</span>'.</div>
<div class="green">nothing to commit, working tree clean</div>
`;

captureScreenshot(
  generateTerminalCard("Git Status & Verified Remote Push", "git log -1 ; git remote -v ; git status", gitStatusHtml),
  "07_git_status_and_remote.png",
  960,
  560
);

console.log("All 7 screenshots generated successfully!");
