/**
 * Automated Test Suite for TaskManager REST API
 * Practical 4: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Runs comprehensive automated tests covering all CRUD operations,
 * middleware validation, error handling, and post-lab requirements.
 */

const http = require("http");
const app = require("./app");

const TEST_PORT = 5095;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let server;
let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("============================================================");
  console.log(" Practical 4 - TaskManager API Automated Test Suite");
  console.log(" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301");
  console.log("============================================================\n");

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[Test Server] Running on ${BASE_URL}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    console.log("--- 1. API Metadata & Root Route ---");
    // -------------------------------------------------------------------------
    const resRoot = await fetch(`${BASE_URL}/api`);
    const dataRoot = await resRoot.json();
    assert(resRoot.status === 200, "GET /api returns HTTP 200");
    assert(dataRoot.success === true, "GET /api returns success: true");
    assert(dataRoot.student && dataRoot.student.studentId === "24CS095", "GET /api includes student ID 24CS095");

    // -------------------------------------------------------------------------
    console.log("\n--- 2. CRUD: GET /tasks (Read All) ---");
    // -------------------------------------------------------------------------
    const resGetAll = await fetch(`${BASE_URL}/tasks`);
    const dataGetAll = await resGetAll.json();
    assert(resGetAll.status === 200, "GET /tasks returns HTTP 200");
    assert(dataGetAll.success === true, "GET /tasks returns success: true");
    assert(Array.isArray(dataGetAll.data), "GET /tasks data is an array");
    assert(dataGetAll.data.length >= 2, "GET /tasks contains initial tasks");
    assert(
      dataGetAll.data.every((t) => t.id && t.title && t.description !== undefined && typeof t.completed === "boolean"),
      "Tasks conform to schema (id, title, description, completed)"
    );

    // -------------------------------------------------------------------------
    console.log("\n--- 3. CRUD: POST /tasks (Create Task) ---");
    // -------------------------------------------------------------------------
    const newTaskPayload = {
      title: "Write Lab Report",
      description: "Document Practical 4 implementation and test results",
      completed: false,
    };
    const resCreate = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTaskPayload),
    });
    const dataCreate = await resCreate.json();
    assert(resCreate.status === 201, "POST /tasks returns HTTP 201 Created");
    assert(dataCreate.success === true, "POST /tasks returns success: true");
    assert(dataCreate.data && dataCreate.data.title === newTaskPayload.title, "Created task has correct title");
    assert(dataCreate.data.description === newTaskPayload.description, "Created task has correct description");
    assert(dataCreate.data.completed === false, "Created task has correct completed status");
    const createdId = dataCreate.data ? dataCreate.data.id : null;
    assert(typeof createdId === "number", "Created task has numeric ID");

    // -------------------------------------------------------------------------
    console.log("\n--- 4. CRUD: GET /tasks/:id (Read Single) ---");
    // -------------------------------------------------------------------------
    const resGetSingle = await fetch(`${BASE_URL}/tasks/${createdId}`);
    const dataGetSingle = await resGetSingle.json();
    assert(resGetSingle.status === 200, "GET /tasks/:id returns HTTP 200");
    assert(dataGetSingle.data && dataGetSingle.data.id === createdId, "Fetched task matches requested ID");

    // -------------------------------------------------------------------------
    console.log("\n--- 5. CRUD: PUT /tasks/:id (Update Task) ---");
    // -------------------------------------------------------------------------
    const updatePayload = {
      title: "Write Lab Report (Completed)",
      completed: true,
    };
    const resUpdate = await fetch(`${BASE_URL}/tasks/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });
    const dataUpdate = await resUpdate.json();
    assert(resUpdate.status === 200, "PUT /tasks/:id returns HTTP 200");
    assert(dataUpdate.success === true, "PUT /tasks/:id returns success: true");
    assert(dataUpdate.data.title === updatePayload.title, "Updated task has new title");
    assert(dataUpdate.data.completed === true, "Updated task has completed: true");
    assert(dataUpdate.data.description === newTaskPayload.description, "Unmodified fields remain intact");

    // -------------------------------------------------------------------------
    console.log("\n--- 6. CRUD: DELETE /tasks/:id (Delete Task) ---");
    // -------------------------------------------------------------------------
    const resDelete = await fetch(`${BASE_URL}/tasks/${createdId}`, {
      method: "DELETE",
    });
    const dataDelete = await resDelete.json();
    assert(resDelete.status === 200, "DELETE /tasks/:id returns HTTP 200");
    assert(dataDelete.success === true, "DELETE /tasks/:id returns success: true");
    assert(dataDelete.data.id === createdId, "Deleted task returned in response");

    // Verify task is really deleted
    const resVerifyDeleted = await fetch(`${BASE_URL}/tasks/${createdId}`);
    assert(resVerifyDeleted.status === 404, "GET /tasks/:id after deletion returns HTTP 404");

    // -------------------------------------------------------------------------
    console.log("\n--- 7. Post-Lab Requirement: Content-Type Validation ---");
    // -------------------------------------------------------------------------
    // POST without Content-Type header
    const resMissingCT = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title: "No Header" }),
    });
    const dataMissingCT = await resMissingCT.json();
    assert(resMissingCT.status === 400, "POST without Content-Type returns HTTP 400");
    assert(dataMissingCT.success === false, "Missing Content-Type returns success: false");

    // PUT with wrong Content-Type
    const resWrongCT = await fetch(`${BASE_URL}/tasks/1`, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: "plain text",
    });
    assert(resWrongCT.status === 400, "PUT with Content-Type: text/plain returns HTTP 400");

    // -------------------------------------------------------------------------
    console.log("\n--- 8. Post-Lab Requirement: Task ID Validation ---");
    // -------------------------------------------------------------------------
    // Alphabetic ID: /tasks/abc
    const resAlphaId = await fetch(`${BASE_URL}/tasks/abc`);
    const dataAlphaId = await resAlphaId.json();
    assert(resAlphaId.status === 400, "GET /tasks/abc returns HTTP 400 Bad Request");
    assert(dataAlphaId.success === false, "Invalid ID response has success: false");

    // Negative ID: /tasks/-5
    const resNegId = await fetch(`${BASE_URL}/tasks/-5`, { method: "DELETE" });
    assert(resNegId.status === 400, "DELETE /tasks/-5 returns HTTP 400 Bad Request");

    // Zero ID: /tasks/0
    const resZeroId = await fetch(`${BASE_URL}/tasks/0`);
    assert(resZeroId.status === 400, "GET /tasks/0 returns HTTP 400 Bad Request");

    // -------------------------------------------------------------------------
    console.log("\n--- 9. Error Handling: Nonexistent Task & Missing Body Fields ---");
    // -------------------------------------------------------------------------
    // Nonexistent task ID: /tasks/99999
    const resNotFound = await fetch(`${BASE_URL}/tasks/99999`);
    const dataNotFound = await resNotFound.json();
    assert(resNotFound.status === 404, "GET /tasks/99999 returns HTTP 404 Not Found");
    assert(dataNotFound.success === false, "Nonexistent ID returns success: false");

    // POST missing title
    const resNoTitle = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Missing title" }),
    });
    const dataNoTitle = await resNoTitle.json();
    assert(resNoTitle.status === 400, "POST /tasks with missing title returns HTTP 400");
    assert(dataNoTitle.success === false, "Missing title returns success: false");

    // PUT with empty payload
    const resEmptyPut = await fetch(`${BASE_URL}/tasks/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(resEmptyPut.status === 400, "PUT /tasks/1 with empty payload returns HTTP 400");

    // -------------------------------------------------------------------------
    console.log("\n--- 10. Unknown Route (404) & Global Error Handling ---");
    // -------------------------------------------------------------------------
    const resUnknownRoute = await fetch(`${BASE_URL}/api/unknown/endpoint`);
    const dataUnknownRoute = await resUnknownRoute.json();
    assert(resUnknownRoute.status === 404, "Unknown route returns HTTP 404");
    assert(dataUnknownRoute.success === false, "Unknown route response has success: false");
    assert(dataUnknownRoute.message.includes("Route not found"), "Unknown route returns descriptive message");

    // Malformed JSON payload to trigger JSON parsing error handled by global error handler
    const resMalformedJson = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ title: broken-json }",
    });
    const dataMalformedJson = await resMalformedJson.json();
    assert(resMalformedJson.status === 400, "Malformed JSON returns HTTP 400 from errorHandler");
    assert(dataMalformedJson.success === false, "Malformed JSON returns success: false");
    assert(!("stack" in dataMalformedJson), "Global error handler does not expose stack traces to client");
  } catch (err) {
    console.error("Test execution error:", err);
    failedCount++;
  } finally {
    await new Promise((resolve) => server.close(resolve));
    console.log("\n============================================================");
    console.log(` Test Summary: ${passedCount} Passed | ${failedCount} Failed`);
    console.log("============================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
