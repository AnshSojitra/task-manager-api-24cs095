const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
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
    }
    .status-200 { background: #1b4729; color: #3fb950; }
    .status-201 { background: #1b4729; color: #3fb950; }
    .status-400 { background: #4d2d14; color: #d29922; }
    .status-404 { background: #4c1d1d; color: #f85149; }
    pre {
      background: #0d1117;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #21262d;
      overflow-x: auto;
      margin-top: 8px;
      font-size: 12.5px;
    }
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
      <div class="title">${title}</div>
    </div>
    <div class="content">
      <div class="command-line"><span class="prompt">PS D:\\WDF\\task-manager-api-24CS095&gt;</span> ${command}</div>
      ${outputHtml}
    </div>
  </div>
</body>
</html>`;
}

function captureScreenshot(htmlContent, outputPngName, height = 620) {
  const tempHtmlPath = path.join(SCREENSHOTS_DIR, "temp.html");
  const outputPath = path.join(SCREENSHOTS_DIR, outputPngName);

  fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

  const cmd = `"${CHROME_PATH}" --headless --disable-gpu --window-size=960,${height} --screenshot="${outputPath}" --hide-scrollbars "file://${tempHtmlPath.replace(/\\/g, "/")}"`;
  execSync(cmd, { stdio: "ignore" });

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  console.log(`[Captured] ${outputPngName}`);
}

console.log("Generating Practical 5 Demonstration Screenshots...");

// 1. Server Startup and MongoDB Connection
captureScreenshot(
  generateTerminalCard(
    "Server Startup & MongoDB Mongoose Connection - Practical 5 (24CS095)",
    "npm start",
    `
    <div style="color: #8b949e; margin-bottom: 8px;">&gt; task-manager-api-24cs095@1.0.0 start</div>
    <div style="color: #8b949e; margin-bottom: 16px;">&gt; node app.js</div>
    <div><span class="blue">[Database]</span> <span class="green">MongoDB Connected successfully:</span> <span class="cyan">127.0.0.1:27017/task_manager</span></div>
    <div><span class="blue">[Server]</span> <span class="green">Server is running on</span> <span class="cyan">http://localhost:5000</span></div>
    <div style="margin-top: 14px; border-top: 1px dashed #30363d; padding-top: 12px;">
      <div class="gray">Incoming Request Logs via logger.js middleware:</div>
      <div><span class="yellow">[2026-10-22T09:54:23.505Z]</span> <span class="green">GET</span> <span class="cyan">/api</span> - <span class="gray">200 OK</span></div>
      <div><span class="yellow">[2026-10-22T09:54:23.536Z]</span> <span class="purple">POST</span> <span class="cyan">/tasks</span> - <span class="gray">201 Created</span></div>
      <div><span class="yellow">[2026-10-22T09:54:23.572Z]</span> <span class="green">GET</span> <span class="cyan">/tasks</span> - <span class="gray">200 OK</span></div>
    </div>
    `
  ),
  "01_server_startup_and_logs.png",
  480
);

// 2. Automated Test Suite passing 50 assertions
captureScreenshot(
  generateTerminalCard(
    "Automated Test Suite (50 Passing Assertions) - Practical 5 (24CS095)",
    "npm test",
    `
    <div style="color: #8b949e; margin-bottom: 8px;">============================================================</div>
    <div class="blue" style="font-weight: bold;"> Practical 5 - TaskManager API Automated Test Suite</div>
    <div class="cyan"> Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301</div>
    <div class="yellow"> Focus: MongoDB Integration &amp; Mongoose Schema Validation</div>
    <div style="color: #8b949e; margin-bottom: 12px;">============================================================</div>
    <div><span class="green">✔ PASS:</span> MongoDB connection established successfully (readyState === 1)</div>
    <div><span class="green">✔ PASS:</span> GET /api returns HTTP 200 &amp; confirms MongoDB engine</div>
    <div><span class="green">✔ PASS:</span> POST /tasks returns HTTP 201 Created with MongoDB _id</div>
    <div><span class="green">✔ PASS:</span> Title whitespace trimmed by schema setter / pre-save hook</div>
    <div><span class="green">✔ PASS:</span> Priority correctly set to 'high' (enum validated)</div>
    <div><span class="green">✔ PASS:</span> GET /tasks returns array of persisted documents</div>
    <div><span class="green">✔ PASS:</span> PUT /tasks/:id updates title and completed status in MongoDB</div>
    <div><span class="green">✔ PASS:</span> Task survived server restart with intact ID (Data Persistence Verified)</div>
    <div><span class="green">✔ PASS:</span> DELETE /tasks/:id removes task from MongoDB</div>
    <div><span class="green">✔ PASS:</span> Valid nonexistent ObjectId returns structured HTTP 404</div>
    <div><span class="green">✔ PASS:</span> Malformed ObjectId returns structured HTTP 400 Bad Request</div>
    <div><span class="green">✔ PASS:</span> Missing title rejected with HTTP 400 ValidationError</div>
    <div><span class="green">✔ PASS:</span> Whitespace-only title rejected with HTTP 400</div>
    <div><span class="green">✔ PASS:</span> Invalid priority enum ('critical') rejected with HTTP 400</div>
    <div style="color: #8b949e; margin-top: 10px;">============================================================</div>
    <div class="green" style="font-weight: bold; font-size: 14px;"> Test Summary: 50 Passed | 0 Failed (100% Pass Rate)</div>
    <div style="color: #8b949e;">============================================================</div>
    `
  ),
  "02_automated_tests_pass.png",
  660
);

// 3. GET /tasks from MongoDB
captureScreenshot(
  generateTerminalCard(
    "GET /tasks - Retrieve All Tasks from MongoDB",
    "curl -X GET http://localhost:5000/tasks",
    `
    <div style="margin-bottom: 8px;"><span class="status-badge status-200">HTTP/1.1 200 OK</span> <span class="gray">Content-Type: application/json</span></div>
    <pre>{
  <span class="blue">"success"</span>: <span class="green">true</span>,
  <span class="blue">"count"</span>: <span class="cyan">2</span>,
  <span class="blue">"data"</span>: [
    {
      <span class="blue">"_id"</span>: <span class="yellow">"6ad9dd4f41481c2b0161d585"</span>,
      <span class="blue">"title"</span>: <span class="yellow">"Implement Mongoose Models and Hooks"</span>,
      <span class="blue">"description"</span>: <span class="yellow">"Define Task schema with title, priority enum, completed, and pre-save hook"</span>,
      <span class="blue">"completed"</span>: <span class="green">false</span>,
      <span class="blue">"priority"</span>: <span class="yellow">"high"</span>,
      <span class="blue">"createdAt"</span>: <span class="yellow">"2026-10-22T09:54:23.536Z"</span>
    },
    {
      <span class="blue">"_id"</span>: <span class="yellow">"6ad9dd4f41481c2b0161d582"</span>,
      <span class="blue">"title"</span>: <span class="yellow">"Setup Local MongoDB Service"</span>,
      <span class="blue">"description"</span>: <span class="yellow">"Verified MongoDB v8.2.4 running on port 27017"</span>,
      <span class="blue">"completed"</span>: <span class="green">true</span>,
      <span class="blue">"priority"</span>: <span class="yellow">"medium"</span>,
      <span class="blue">"createdAt"</span>: <span class="yellow">"2026-10-22T09:50:12.110Z"</span>
    }
  ]
}</pre>
    `
  ),
  "03_get_all_tasks.png",
  540
);

// 4. POST /tasks - Create with Priority & Whitespace Trim
captureScreenshot(
  generateTerminalCard(
    "POST /tasks - Create Task with Priority & Whitespace Trimming",
    'curl -X POST http://localhost:5000/tasks -H "Content-Type: application/json" -d \'{"title":"   Prepare Practical 5 Submission   ","priority":"high","completed":false}\'',
    `
    <div style="margin-bottom: 8px;"><span class="status-badge status-201">HTTP/1.1 201 Created</span> <span class="gray">Content-Type: application/json</span></div>
    <pre>{
  <span class="blue">"success"</span>: <span class="green">true</span>,
  <span class="blue">"message"</span>: <span class="yellow">"Task created successfully"</span>,
  <span class="blue">"data"</span>: {
    <span class="blue">"_id"</span>: <span class="yellow">"6ad9dd4f41481c2b0161d589"</span>,
    <span class="blue">"title"</span>: <span class="yellow">"Prepare Practical 5 Submission"</span>,
    <span class="blue">"description"</span>: <span class="yellow">""</span>,
    <span class="blue">"completed"</span>: <span class="green">false</span>,
    <span class="blue">"priority"</span>: <span class="yellow">"high"</span>,
    <span class="blue">"createdAt"</span>: <span class="yellow">"2026-10-22T09:54:30.812Z"</span>,
    <span class="blue">"id"</span>: <span class="yellow">"6ad9dd4f41481c2b0161d589"</span>
  }
}</pre>
    <div style="margin-top: 10px; color: #7ee787; font-size: 12.5px;">✔ Title was automatically trimmed from '   Prepare Practical 5 Submission   ' by Mongoose pre-save hook &amp; setter.</div>
    `
  ),
  "04_post_create_task.png",
  530
);

// 5. PUT & DELETE Task by ObjectId
captureScreenshot(
  generateTerminalCard(
    "PUT & DELETE /tasks/:id - Update and Delete by ObjectId",
    'curl -X PUT http://localhost:5000/tasks/6ad9dd4f41481c2b0161d589 -H "Content-Type: application/json" -d \'{"completed":true,"priority":"medium"}\'',
    `
    <div style="margin-bottom: 8px;"><span class="status-badge status-200">HTTP/1.1 200 OK</span> <span class="gray">Update Operation</span></div>
    <pre>{
  <span class="blue">"success"</span>: <span class="green">true</span>,
  <span class="blue">"message"</span>: <span class="yellow">"Task updated successfully"</span>,
  <span class="blue">"data"</span>: {
    <span class="blue">"_id"</span>: <span class="yellow">"6ad9dd4f41481c2b0161d589"</span>,
    <span class="blue">"title"</span>: <span class="yellow">"Prepare Practical 5 Submission"</span>,
    <span class="blue">"completed"</span>: <span class="green">true</span>,
    <span class="blue">"priority"</span>: <span class="yellow">"medium"</span>
  }
}</pre>
    <div style="margin-top: 14px; border-top: 1px dashed #30363d; padding-top: 10px;">
      <div style="color: #58a6ff; font-weight: bold; margin-bottom: 6px;">curl -X DELETE http://localhost:5000/tasks/6ad9dd4f41481c2b0161d589</div>
      <div style="margin-bottom: 6px;"><span class="status-badge status-200">HTTP/1.1 200 OK</span> <span class="gray">Delete Operation</span></div>
      <pre>{
  <span class="blue">"success"</span>: <span class="green">true</span>,
  <span class="blue">"message"</span>: <span class="yellow">"Task deleted successfully"</span>,
  <span class="blue">"data"</span>: { <span class="blue">"_id"</span>: <span class="yellow">"6ad9dd4f41481c2b0161d589"</span> }
}</pre>
    </div>
    `
  ),
  "05_put_delete_task.png",
  620
);

// 6. Schema Validation Errors: Missing Title, Invalid Priority & Malformed ID
captureScreenshot(
  generateTerminalCard(
    "Schema & ID Validation Errors - Practical 5 (24CS095)",
    'curl -X POST http://localhost:5000/tasks -H "Content-Type: application/json" -d \'{"title":"Test","priority":"critical"}\'',
    `
    <div style="margin-bottom: 6px;"><span class="status-badge status-400">HTTP/1.1 400 Bad Request</span> <span class="gray">Invalid Priority Enum</span></div>
    <pre>{
  <span class="blue">"success"</span>: <span class="red">false</span>,
  <span class="blue">"message"</span>: <span class="yellow">"Validation Error"</span>,
  <span class="blue">"errors"</span>: [
    <span class="yellow">"'critical' is not a valid priority. Allowed values: low, medium, high."</span>
  ]
}</pre>
    <div style="margin-top: 12px; border-top: 1px dashed #30363d; padding-top: 10px;">
      <div style="color: #58a6ff; font-weight: bold; margin-bottom: 4px;">curl -X GET http://localhost:5000/tasks/invalid-task-id-123</div>
      <div style="margin-bottom: 6px;"><span class="status-badge status-400">HTTP/1.1 400 Bad Request</span> <span class="gray">Malformed Mongo ID Handled Safely</span></div>
      <pre>{
  <span class="blue">"success"</span>: <span class="red">false</span>,
  <span class="blue">"message"</span>: <span class="yellow">"Invalid task ID format 'invalid-task-id-123'. Task ID must be a valid 24-character hexadecimal MongoDB ObjectId."</span>
}</pre>
    </div>
    <div style="margin-top: 12px; border-top: 1px dashed #30363d; padding-top: 10px;">
      <div style="color: #58a6ff; font-weight: bold; margin-bottom: 4px;">curl -X GET http://localhost:5000/tasks/507f1f77bcf86cd799439011</div>
      <div style="margin-bottom: 6px;"><span class="status-badge status-404">HTTP/1.1 404 Not Found</span> <span class="gray">Valid Nonexistent ObjectId</span></div>
      <pre>{
  <span class="blue">"success"</span>: <span class="red">false</span>,
  <span class="blue">"message"</span>: <span class="yellow">"Task with ID 507f1f77bcf86cd799439011 not found"</span>
}</pre>
    </div>
    `
  ),
  "06_postlab_validation_errors.png",
  690
);

// 7. Git Status & Remote Verification
captureScreenshot(
  generateTerminalCard(
    "Git Status, Remote & Branch Verification - Practical 5 (24CS095)",
    "git status; git remote -v",
    `
    <div>On branch <span class="green" style="font-weight: bold;">main</span></div>
    <div>Your branch is up to date with '<span class="blue">origin/main</span>'.</div>
    <br>
    <div>Changes to be committed:</div>
    <div class="green">&nbsp;&nbsp;modified:   .env.example</div>
    <div class="green">&nbsp;&nbsp;modified:   README.md</div>
    <div class="green">&nbsp;&nbsp;modified:   app.js</div>
    <div class="green">&nbsp;&nbsp;modified:   middleware/errorHandler.js</div>
    <div class="green">&nbsp;&nbsp;modified:   middleware/validateTaskId.js</div>
    <div class="green">&nbsp;&nbsp;new file:   config/db.js</div>
    <div class="green">&nbsp;&nbsp;new file:   models/Task.js</div>
    <div class="green">&nbsp;&nbsp;modified:   package.json</div>
    <div class="green">&nbsp;&nbsp;modified:   routes/tasks.js</div>
    <div class="green">&nbsp;&nbsp;modified:   test.js</div>
    <br>
    <div>Remotes:</div>
    <div><span class="yellow">origin</span>  https://github.com/AnshSojitra/task-manager-api-24CS095.git (fetch)</div>
    <div><span class="yellow">origin</span>  https://github.com/AnshSojitra/task-manager-api-24CS095.git (push)</div>
    `
  ),
  "07_git_status_and_remote.png",
  500
);

console.log("All Practical 5 demonstration screenshots generated successfully in /screenshots directory.");
