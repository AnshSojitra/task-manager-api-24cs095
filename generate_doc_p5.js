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
  AlignmentType,
  ImageRun,
  Header,
  Footer,
  PageNumber,
} = require("docx");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const OUTPUT_DOCX = path.join(
  __dirname,
  "Practical_5_Report_24CS095_Ansh_Sojitra.docx"
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
  console.log("Compiling Practical 5 Word document...");

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
                    text: "CHARUSAT | ITUE301 | Practical 5: MongoDB & Mongoose",
                    font: "Segoe UI",
                    size: 16,
                    color: "A0AEC0",
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
                    text: "Page ",
                    font: "Segoe UI",
                    size: 18,
                    color: "718096",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Segoe UI",
                    size: 18,
                    bold: true,
                    color: "1A365D",
                  }),
                  new TextRun({
                    text: " of ",
                    font: "Segoe UI",
                    size: 18,
                    color: "718096",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: "Segoe UI",
                    size: 18,
                    bold: true,
                    color: "1A365D",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Header / Title Block
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY",
                bold: true,
                size: 28,
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
                bold: true,
                size: 22,
                color: "2B6CB0",
                font: "Segoe UI",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ITUE301 — ADVANCED WEB DEVELOPMENT FRAMEWORKS",
                bold: true,
                size: 26,
                color: "1A365D",
                font: "Segoe UI",
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PRACTICAL 5 LABORATORY REPORT",
                bold: true,
                size: 32,
                color: "2B6CB0",
                font: "Segoe UI",
              }),
            ],
            spacing: { after: 240 },
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createStyledCell("Student Name", true, 30),
                  createStyledCell("Ansh Sojitra", false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Student ID", true, 30),
                  createStyledCell("24CS095", false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Academic Year", true, 30),
                  createStyledCell("2026–27", false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Practical Title", true, 30),
                  createStyledCell(
                    "Practical 5: MongoDB Integration and Schema Design with Mongoose",
                    false,
                    70
                  ),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Repository Name", true, 30),
                  createStyledCell("task-manager-api-24CS095", false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createStyledCell("Database Engine", true, 30),
                  createStyledCell("MongoDB Community Server v8.2.4 with Mongoose v9.11.3 ODM", false, 70),
                ],
              }),
            ],
          }),

          makeHeading("1. Objective & Scope", HeadingLevel.HEADING_1),
          makeParagraph(
            "The objective of Practical 5 is to elevate the Task Management REST API developed in Practical 4 from an ephemeral in-memory storage model to a robust, persistent production-grade database architecture powered by MongoDB and the Mongoose Object Data Modeling (ODM) library."
          ),
          makeParagraph(
            "All core RESTful endpoints (GET, POST, PUT, DELETE) are preserved while adding schema validation, data type normalization, pre-save hooks, priority enumeration, and safe MongoDB ObjectId parameter verification."
          ),

          makeHeading("2. Key Requirements Implemented", HeadingLevel.HEADING_2),
          makeBullet(
            "Environment-driven connection via process.env.MONGO_URI using dotenv, strictly avoiding hardcoded connection strings.",
            "1. Secure Database Connection:"
          ),
          makeBullet(
            "Defined models/Task.js containing title (required, trimmed), description (optional, trimmed), completed (boolean, default false), createdAt (Date, default Date.now), and priority (enum: 'low', 'medium', 'high', default 'medium').",
            "2. Mongoose Schema Design:"
          ),
          makeBullet(
            "Incorporated schema setters and a pre-save hook to sanitize input and ensure title whitespace is trimmed before saving.",
            "3. Whitespace Trimming Hook:"
          ),
          makeBullet(
            "Replaced all JavaScript array mutations with Mongoose model queries (Task.find(), Task.findById(), Task.create(), Task.findByIdAndUpdate(), Task.findByIdAndDelete()).",
            "4. Mongoose CRUD Operations:"
          ),
          makeBullet(
            "Middleware validates 24-character hexadecimal ObjectId format, returning 400 Bad Request for malformed IDs. Nonexistent valid ObjectIds return structured 404 Not Found.",
            "5. Safe ID Validation:"
          ),
          makeBullet(
            "All async route handlers forward exceptions via next(err) to errorHandler.js, which maps Mongoose ValidationError and CastError to client-readable JSON while suppressing stack traces.",
            "6. Error Middleware & Formatting:"
          ),
          makeBullet(
            "Created tasks persist in MongoDB across server process stops and restarts, verified via automated test suite.",
            "7. Data Persistence Verification:"
          ),

          makeHeading("3. Architecture & File Structure", HeadingLevel.HEADING_1),
          makeParagraph(
            "The repository follows a clean, modular Model-Route-Middleware architectural pattern:"
          ),
          makeBullet("config/db.js — Encapsulates Mongoose database connection logic and fail-fast environment checks.", "•"),
          makeBullet("models/Task.js — Defines the Mongoose Task schema, validation rules, priority enum, and pre-save hooks.", "•"),
          makeBullet("routes/tasks.js — Implements asynchronous Express route handlers mapped to Mongoose model queries.", "•"),
          makeBullet("middleware/validateTaskId.js — Validates MongoDB ObjectId format using mongoose.Types.ObjectId.isValid.", "•"),
          makeBullet("middleware/errorHandler.js — Centralized error handler converting Mongoose validation errors into structured JSON.", "•"),
          makeBullet("middleware/validateContentType.js — Enforces Content-Type: application/json for POST and PUT requests.", "•"),
          makeBullet("middleware/logger.js — Logs HTTP method, request path, and ISO timestamp for server auditing.", "•"),
          makeBullet("app.js — Configures the Express middleware pipeline, mounts routes, and initiates the database connection.", "•"),

          makeHeading("4. Schema Definition & Code Artifacts", HeadingLevel.HEADING_1),
          makeParagraph(
            "The Task schema in models/Task.js enforces required validation and priority enumeration:"
          ),
          makeParagraph(
            "const taskSchema = new mongoose.Schema({\n" +
            "  title: { type: String, required: [true, 'Title is required'], trim: true },\n" +
            "  description: { type: String, default: '', trim: true },\n" +
            "  completed: { type: Boolean, default: false },\n" +
            "  createdAt: { type: Date, default: Date.now },\n" +
            "  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', lowercase: true, trim: true }\n" +
            "});\n" +
            "taskSchema.pre('save', function (next) {\n" +
            "  if (this.title) this.title = this.title.trim();\n" +
            "  if (this.description) this.description = this.description.trim();\n" +
            "  if (typeof next === 'function') next();\n" +
            "});"
          ),

          makeHeading("5. Verification & Testing Evidence", HeadingLevel.HEADING_1),
          makeParagraph(
            "A comprehensive automated integration test suite (test.js) was executed, evaluating 50 distinct test assertions covering connection verification, CRUD operations, title trimming, priority enum validation, server restart persistence, and error handling."
          ),

          ...makeImageSection(
            1,
            "MongoDB Connection & Server Initialization",
            "Verification of successful connection to MongoDB Community Server on port 27017 and Express server startup.",
            "01_server_startup_and_logs.png"
          ),

          ...makeImageSection(
            2,
            "Automated Test Suite Execution (50 Assertions Passing)",
            "Execution of npm test demonstrating 100% pass rate across all MongoDB CRUD, validation, and restart persistence tests.",
            "02_automated_tests_pass.png"
          ),

          ...makeImageSection(
            3,
            "GET /tasks - Persistent Document Retrieval",
            "Retrieving all task documents from MongoDB with generated ObjectIds and timestamps.",
            "03_get_all_tasks.png"
          ),

          ...makeImageSection(
            4,
            "POST /tasks - Create with Priority & Whitespace Trimming",
            "Creating a new task with title whitespace automatically trimmed by the Mongoose pre-save hook and priority enum validated.",
            "04_post_create_task.png"
          ),

          ...makeImageSection(
            5,
            "PUT & DELETE /tasks/:id - Update and Delete by ObjectId",
            "Updating task completion status and priority enum, followed by successful deletion from MongoDB.",
            "05_put_delete_task.png"
          ),

          ...makeImageSection(
            6,
            "Schema Validation & Safe ID Error Handling",
            "Demonstrating HTTP 400 for invalid priority enum ('critical'), HTTP 400 for malformed Mongo ID, and HTTP 404 for nonexistent valid ObjectId.",
            "06_postlab_validation_errors.png"
          ),

          ...makeImageSection(
            7,
            "Git Status, Tracking Remote & Commit Verification",
            "Verification of clean git status on main branch tracking GitHub repository task-manager-api-24CS095.",
            "07_git_status_and_remote.png"
          ),

          makeHeading("6. University Viva Voce Preparation", HeadingLevel.HEADING_1),
          makeParagraph(
            "Key technical questions and concise architectural explanations for the laboratory viva:"
          ),
          makeBullet(
            "Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, translates between code objects and MongoDB documents, and simplifies queries.",
            "Q1: What is Mongoose and why is it preferred over native MongoDB driver?"
          ),
          makeBullet(
            "A Mongoose pre-save hook is middleware that executes before doc.save() is called. In Practical 5, it trims whitespace from task title and description fields before the document is persisted in the database.",
            "Q2: How does the pre-save hook function in models/Task.js?"
          ),
          makeBullet(
            "A malformed ID (e.g., '123') has an invalid format and is intercepted by validateTaskId middleware returning 400 Bad Request. A nonexistent ID is a valid 24-character hexadecimal ObjectId (e.g., '507f1f77bcf86cd799439011') that does not match any document, returning 404 Not Found.",
            "Q3: What is the difference between a malformed ID and a nonexistent ID?"
          ),
          makeBullet(
            "The priority field uses Mongoose enum: ['low', 'medium', 'high']. If a client sends an invalid value (e.g., 'urgent'), Mongoose throws a ValidationError. The global error handler catches it and returns HTTP 400 with a descriptive JSON message.",
            "Q4: How does priority enum validation work?"
          ),
          makeBullet(
            "Database connection strings often contain passwords, ports, and cluster hosts. Hardcoding them leaks credentials in git history. Using process.env.MONGO_URI loaded via dotenv keeps credentials secret in .env, which is excluded by .gitignore.",
            "Q5: Why must MONGO_URI never be hardcoded?"
          ),

          makeHeading("7. Conclusion", HeadingLevel.HEADING_1),
          makeParagraph(
            "Practical 5 successfully transitioned the Task Management REST API to MongoDB and Mongoose. All university laboratory requirements—including schema modeling, priority enum constraints, whitespace pre-save hooks, safe ObjectId handling, server restart persistence, and centralized error translation—were implemented, verified with 50 passing automated tests, documented, and prepared for submission."
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_DOCX, buffer);
  console.log(`[Generated] Practical 5 Word Report: ${OUTPUT_DOCX}`);
}

buildDocument().catch(console.error);
