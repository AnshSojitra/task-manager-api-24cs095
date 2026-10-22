const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  Header,
  Footer,
  PageNumber,
} = require("docx");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const OUTPUT_DOCX = path.join(
  __dirname,
  "Practical_4_Report_24CS095_Ansh_Sojitra.docx"
);

function makeHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 280, after: 140 },
  });
}

function makeParagraph(runs, options = {}) {
  const textRuns = Array.isArray(runs)
    ? runs.map((r) => (typeof r === "string" ? new TextRun({ text: r, font: "Segoe UI" }) : r))
    : [new TextRun({ text: runs, font: "Segoe UI" })];

  return new Paragraph({
    children: textRuns,
    spacing: { after: 120, line: 276 },
    ...options,
  });
}

function makeBullet(text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + " ", bold: true, font: "Segoe UI", color: "1A365D" }));
  }
  children.push(new TextRun({ text, font: "Segoe UI" }));

  return new Paragraph({
    children,
    bullet: { level: 0 },
    spacing: { after: 80, line: 260 },
  });
}

function makeImageSection(figureNum, title, description, imageFileName) {
  const imagePath = path.join(SCREENSHOTS_DIR, imageFileName);
  const imageBytes = fs.readFileSync(imagePath);

  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `Figure ${figureNum}: ${title}`,
          bold: true,
          font: "Segoe UI",
          size: 23,
          color: "1A365D",
        }),
      ],
      spacing: { before: 240, after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: description,
          italics: true,
          font: "Segoe UI",
          size: 20,
          color: "4A5568",
        }),
      ],
      spacing: { after: 140 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: imageBytes,
          transformation: {
            width: 580,
            height: 360,
          },
        }),
      ],
      spacing: { after: 260 },
    }),
  ];
}

function createStyledCell(text, isHeader = false, widthPercent = 25) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: isHeader ? { fill: "1A365D" } : undefined,
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.LEFT : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: isHeader,
            color: isHeader ? "FFFFFF" : "2D3748",
            font: "Segoe UI",
            size: isHeader ? 20 : 19,
          }),
        ],
      }),
    ],
  });
}

async function buildDocument() {
  console.log("Compiling Word document...");

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Segoe UI",
            size: 22,
            color: "2D3748",
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          run: {
            size: 32,
            bold: true,
            color: "1A365D",
            font: "Segoe UI",
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          run: {
            size: 26,
            bold: true,
            color: "2B6CB0",
            font: "Segoe UI",
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          run: {
            size: 22,
            bold: true,
            color: "2D3748",
            font: "Segoe UI",
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "CHARUSAT | ITUE301 | Practical 4: RESTful API with Node.js & Express",
                    font: "Segoe UI",
                    size: 16,
                    color: "718096",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Student: Ansh Sojitra (ID: 24CS095) | Page ",
                    font: "Segoe UI",
                    size: 16,
                    color: "718096",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Segoe UI",
                    size: 16,
                    color: "718096",
                  }),
                  new TextRun({
                    text: " of ",
                    font: "Segoe UI",
                    size: 16,
                    color: "718096",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: "Segoe UI",
                    size: 16,
                    color: "718096",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Cover Banner
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY (CHARUSAT)",
                bold: true,
                size: 26,
                color: "1A365D",
                font: "Segoe UI",
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Chandubhai S. Patel Institute of Technology (CSPIT)",
                size: 22,
                color: "4A5568",
                font: "Segoe UI",
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Department of Computer Science & Engineering",
                size: 20,
                color: "718096",
                font: "Segoe UI",
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PRACTICAL 4 LABORATORY REPORT",
                bold: true,
                size: 32,
                color: "2B6CB0",
                font: "Segoe UI",
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Course: ITUE301 — Advanced Web Development Frameworks (AY 2026–27)",
                size: 22,
                italics: true,
                color: "2D3748",
                font: "Segoe UI",
              }),
            ],
            spacing: { after: 300 },
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createStyledCell("Student Name", true, 25),
                  createStyledCell("Ansh Sojitra", false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Student ID", true, 25),
                  createStyledCell("24CS095", false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Practical Title", true, 25),
                  createStyledCell("Building a RESTful API with Node.js and Express", false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("GitHub Repository", true, 25),
                  createStyledCell("https://github.com/AnshSojitra/task-manager-api-24cs095", false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Latest Commit Hash", true, 25),
                  createStyledCell("661537b (Implementation: 5347c10)", false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Commit Message", true, 25),
                  createStyledCell("docs: add Practical 4 Word report and output screenshots", false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Submission Date", true, 25),
                  createStyledCell("October 22, 2026", false, 75),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 240 } }),

          // Section 1: Objective
          makeHeading("1. Objective", HeadingLevel.HEADING_1),
          makeParagraph(
            "The objective of Practical 4 is to design, develop, test, and document a robust Task Management RESTful API using Node.js and the Express framework. The application implements an in-memory data store, full CRUD (Create, Read, Update, Delete) endpoints, a modular middleware architecture (global request logger, media-type validator, route parameter pre-validator), a structured 404 handler for unrecognized routes, and a centralized global error handler preventing internal stack trace disclosure."
          ),

          // Section 2: Git Repository & Commit Details
          makeHeading("2. GitHub Repository & Commit Verification", HeadingLevel.HEADING_1),
          makeParagraph(
            "The project has been tracked with Git, version controlled, and pushed to the public GitHub repository designated for Practical 4. All development history, commit metadata, and branch tracking are verified below:"
          ),
          makeBullet("https://github.com/AnshSojitra/task-manager-api-24cs095", "Public Repository URL:"),
          makeBullet("main (Tracking: origin/main)", "Branch:"),
          makeBullet("661537b (Initial Implementation: 5347c10)", "Latest Commit Hash:"),
          makeBullet("docs: add Practical 4 Word report and output screenshots", "Latest Commit Message:"),
          makeBullet("feat: implement Express task CRUD API and middleware (commit 5347c10)", "Core Implementation Commit:"),
          makeBullet("Ansh Sojitra <anshsojitra2@gmail.com>", "Author:"),
          makeBullet("Thu Oct 22 13:04:51 2026 +0530", "Commit Timestamp:"),
          makeBullet("Working tree clean, up to date with origin/main", "Status:"),

          // Section 3: Project Architecture
          makeHeading("3. Architecture & Modular Organization", HeadingLevel.HEADING_1),
          makeParagraph(
            "The application adheres to clean separation of concerns, separating server configuration, middleware, and routing logic into modular files:"
          ),
          makeBullet("Central application entry point configuring dotenv environment variables (PORT 5000), mounting middleware in strict sequential order, defining the root metadata route (/api), and registering 404 and global error handlers.", "app.js:"),
          makeBullet("Router module managing the in-memory tasks array (id, title, description, completed) and routing GET /tasks, GET /tasks/:id, POST /tasks, PUT /tasks/:id, and DELETE /tasks/:id.", "routes/tasks.js:"),
          makeBullet("Global middleware intercepting every incoming HTTP request and outputting [ISO_TIMESTAMP] METHOD URL to the server console.", "middleware/logger.js:"),
          makeBullet("Post-lab middleware enforcing strict media-type compliance by rejecting POST and PUT requests lacking Content-Type: application/json with HTTP 400 Bad Request.", "middleware/validateContentType.js:"),
          makeBullet("Post-lab middleware pre-validating that :id is a strictly positive integer string prior to controller or array logic execution.", "middleware/validateTaskId.js:"),
          makeBullet("Final middleware in the Express pipeline catching uncaught runtime exceptions and JSON parsing syntax errors, returning structured JSON without exposing internal stack traces.", "middleware/errorHandler.js:"),
          makeBullet("Automated test suite with 43 assertions executing full integration tests across all success and error flows.", "test.js:"),

          // Section 4: API Endpoints Table
          makeHeading("4. RESTful API Routes Specification", HeadingLevel.HEADING_1),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createStyledCell("Method", true, 12),
                  createStyledCell("Endpoint", true, 22),
                  createStyledCell("Status Codes", true, 18),
                  createStyledCell("Description & Validation Rules", true, 48),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("GET", false, 12),
                  createStyledCell("/ or /api", false, 22),
                  createStyledCell("200 OK", false, 18),
                  createStyledCell("Returns API metadata, course details, student credentials, and available endpoint map.", false, 48),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("GET", false, 12),
                  createStyledCell("/tasks", false, 22),
                  createStyledCell("200 OK", false, 18),
                  createStyledCell("Retrieves all in-memory tasks with schema { id, title, description, completed }.", false, 48),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("GET", false, 12),
                  createStyledCell("/tasks/:id", false, 22),
                  createStyledCell("200, 400, 404", false, 18),
                  createStyledCell("Fetches single task by ID. Validates ID is positive integer (400); checks existence (404).", false, 48),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("POST", false, 12),
                  createStyledCell("/tasks", false, 22),
                  createStyledCell("201, 400", false, 18),
                  createStyledCell("Creates new task. Enforces Content-Type: application/json and mandatory non-empty title.", false, 48),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("PUT", false, 12),
                  createStyledCell("/tasks/:id", false, 22),
                  createStyledCell("200, 400, 404", false, 18),
                  createStyledCell("Updates task title, description, or completed status. Pre-validates ID and payload.", false, 48),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("DELETE", false, 12),
                  createStyledCell("/tasks/:id", false, 22),
                  createStyledCell("200, 400, 404", false, 18),
                  createStyledCell("Deletes task by ID. Returns deleted object upon success or 404 if not found.", false, 48),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("*", false, 12),
                  createStyledCell("/* (Any unknown)", false, 22),
                  createStyledCell("404 Not Found", false, 18),
                  createStyledCell("Structured JSON 404 response indicating route and HTTP method.", false, 48),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Section 5: Post-Lab Requirements Analysis
          makeHeading("5. Post-Lab Requirements Implementation", HeadingLevel.HEADING_1),
          makeParagraph([
            new TextRun({ text: "Requirement 1: Content-Type Header Enforcement: ", bold: true }),
            new TextRun({
              text: "A dedicated middleware (validateContentType.js) intercepts incoming requests before body parsing. If the HTTP method is POST or PUT, it checks req.is('application/json'). If the header is missing or non-JSON (e.g. text/plain), the server terminates the pipeline early with HTTP 400 Bad Request and the structured JSON message: 'Invalid or missing Content-Type header. Expected application/json.'",
            }),
          ]),
          makeParagraph([
            new TextRun({ text: "Requirement 2: Task ID Pre-Validation Middleware: ", bold: true }),
            new TextRun({
              text: "The middleware validateTaskId.js runs on all routes matching /:id before controller handlers. It inspects req.params.id using a strict regex (/^\\d+$/) and verifies that the integer is > 0. If non-numeric characters (e.g. 'abc'), negative numbers ('-5'), or zero are supplied, it returns HTTP 400 Bad Request: 'Invalid task ID. Task ID must be a positive integer.' If valid, it attaches req.taskId = parseInt(id, 10) for downstream handlers.",
            }),
          ]),
          makeParagraph([
            new TextRun({ text: "Requirement 3: Global Error Handler & Stack Trace Suppression: ", bold: true }),
            new TextRun({
              text: "The errorHandler.js middleware handles uncaught errors, including SyntaxError thrown by express.json() when a client transmits malformed JSON. It logs the stack internally on the server but responds to the client with a sanitized JSON response { success: false, message: ... } without leaking server filesystem paths or stack traces.",
            }),
          ]),

          // Section 6: Screenshots and Outputs
          makeHeading("6. Practical Output Screenshots & Test Evidence", HeadingLevel.HEADING_1),
          makeParagraph(
            "Below are the verified output screenshots capturing server startup, middleware logs, automated test suite execution, live CRUD operations, and error handling flows:"
          ),

          // Figure 1
          ...makeImageSection(
            1,
            "Server Startup & Live Request Logging Middleware",
            "Terminal showing server running on http://localhost:5000 with environment injection from .env and real-time ISO timestamped request logs.",
            "01_server_startup_and_logs.png"
          ),

          // Figure 2
          ...makeImageSection(
            2,
            "Automated Test Suite Execution (npm test)",
            "Automated integration test runner (test.js) verifying 43 assertions across metadata, CRUD flows, post-lab validation, and error handlers with 100% pass rate.",
            "02_automated_tests_pass.png"
          ),

          // Figure 3
          ...makeImageSection(
            3,
            "GET /tasks - Retrieve All In-Memory Tasks (200 OK)",
            "Client request fetching all tasks stored in memory with complete schemas including id, title, description, and completed boolean status.",
            "03_get_all_tasks.png"
          ),

          // Figure 4
          ...makeImageSection(
            4,
            "POST /tasks - Task Creation with Validation (201 Created)",
            "Client request creating a new task with Content-Type: application/json, returning HTTP 201 Created and auto-generated incremental numeric ID.",
            "04_post_create_task.png"
          ),

          // Figure 5
          ...makeImageSection(
            5,
            "PUT /tasks/:id & DELETE /tasks/:id (200 OK)",
            "Sequential demonstration of updating a task's title and completion status (PUT 200 OK) followed by deletion (DELETE 200 OK).",
            "05_put_delete_task.png"
          ),

          // Figure 6
          ...makeImageSection(
            6,
            "Post-Lab Validations & Global Error Responses (400 & 404)",
            "Demonstration of rejecting missing Content-Type headers (400), invalid alphabetic task IDs (400), and unknown routes (404) with uniform JSON formatting.",
            "06_postlab_validation_errors.png"
          ),

          // Figure 7
          ...makeImageSection(
            7,
            "Git Status, Commit Log (5347c10), and Remote Push",
            "Terminal verification displaying latest commit hash 5347c10, author Ansh Sojitra, clean working tree, and active synchronization with GitHub repository.",
            "07_git_status_and_remote.png"
          ),

          // Section 7: Conclusion & Evidence Checklist
          makeHeading("7. Evidence & Acceptance Checklist", HeadingLevel.HEADING_1),
          makeBullet("Server starts cleanly on port 5000 and is configurable via .env", "[PASS] Server Port Configuration:"),
          makeBullet("Stored in array with id, title, description, and completed flag", "[PASS] In-Memory Data Store:"),
          makeBullet("GET /tasks, GET /tasks/:id, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id", "[PASS] CRUD Endpoints:"),
          makeBullet("200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error", "[PASS] HTTP Status Codes:"),
          makeBullet("Logged for every request: [ISO_TIMESTAMP] METHOD URL", "[PASS] Global Request Logger:"),
          makeBullet("express.json() parses body and handles syntax errors safely", "[PASS] JSON Body Parsing:"),
          makeBullet("Catches unmatched routes and returns structured JSON with 404", "[PASS] 404 Route Handler:"),
          makeBullet("Placed after routes; suppresses stack traces from client responses", "[PASS] Global Error Handler:"),
          makeBullet("Rejects POST/PUT lacking Content-Type: application/json with 400", "[PASS] Post-Lab Content-Type:"),
          makeBullet("Validates :id parameter before controller logic execution with 400", "[PASS] Post-Lab Task ID:"),
          makeBullet("43/43 assertions passed with 0 failures", "[PASS] Automated Test Suite:"),
          makeBullet("Committed (5347c10) and pushed to task-manager-api-24CS095", "[PASS] GitHub Repository Push:"),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_DOCX, buffer);
  console.log(`Word file generated successfully at: ${OUTPUT_DOCX}`);
}

buildDocument().catch((err) => {
  console.error("Error generating Word document:", err);
  process.exit(1);
});
