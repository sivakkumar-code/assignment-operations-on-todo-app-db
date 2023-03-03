const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started listening...");
    });
  } catch (err) {
    console.log(`DB error ${err.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

const checkPriority = (priority) => {
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    return true;
  } else {
    return false;
  }
};
const checkCategory = (category) => {
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    return true;
  } else {
    return false;
  }
};
const checkStatus = (status) => {
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    return true;
  } else {
    return false;
  }
};

// API 1
app.get("/todos/", async (req, res) => {
  let sqlQuery;
  const { status, priority, search_q = "", category } = req.query;
  console.log(req.query);
  switch (true) {
    case category !== undefined && priority !== undefined:
      if (checkCategory(category)) {
        if (checkPriority(priority)) {
          sqlQuery = `
                    SELECT 
                        id, todo, priority, status, category, due_date AS dueDate
                    FROM todo
                    WHERE priority = '${priority}' AND category = '${category}';
                `;
        } else {
          val = "Todo Priority";
          res.status(400);
          res.send(`Invalid ${val}`);
          break;
        }
      } else {
        val = "Todo Category";
        res.status(400);
        res.send(`Invalid ${val}`);
      }
      break;
    case category !== undefined && status !== undefined:
      if (checkCategory(category)) {
        if (checkStatus(status)) {
          sqlQuery = `
                    SELECT 
                        id, todo, priority, status, category, due_date AS dueDate
                    FROM todo
                    WHERE status = '${status}' AND category = '${category}';
                `;
        } else {
          val = "Todo Status";
          res.status(400);
          res.send(`Invalid ${val}`);
          break;
        }
      } else {
        val = "Todo Category";
        res.status(400);
        res.send(`Invalid ${val}`);
      }
      break;
    case status !== undefined && priority !== undefined:
      if (checkStatus(status)) {
        if (checkPriority(priority)) {
          sqlQuery = `
                SELECT 
                    id, todo, priority, status, category, due_date AS dueDate
                FROM todo
                WHERE priority = '${priority}' AND status = '${status}';
            `;
        } else {
          val = "Todo Priority";
          res.status(400);
          res.send(`Invalid ${val}`);
          break;
        }
      } else {
        val = "Todo Status";
        res.status(400);
        res.send(`Invalid ${val}`);
      }
      break;
    case status !== undefined:
      if (checkStatus(status)) {
        sqlQuery = `
            SELECT 
                id, todo, priority, status, category, due_date AS dueDate
            FROM todo
            WHERE status = '${status}';
        `;
      } else {
        val = "Todo Status";
        res.status(400);
        res.send(`Invalid ${val}`);
      }
      break;
    case priority !== undefined:
      if (checkPriority(priority)) {
        sqlQuery = `
            SELECT 
                id, todo, priority, status, category, due_date AS dueDate
            FROM todo
            WHERE priority = '${priority}';
        `;
      } else {
        val = "Todo Priority";
        res.status(400);
        res.send(`Invalid ${val}`);
      }
      break;
    case category !== undefined:
      if (checkCategory(category)) {
        sqlQuery = `
            SELECT 
                id, todo, priority, status, category, due_date AS dueDate
            FROM todo
            WHERE category = '${category}';
        `;
      } else {
        val = "Todo Category";
        res.status(400);
        res.send(`Invalid ${val}`);
      }
      break;

    default:
      sqlQuery = `
                SELECT 
                    id, todo, priority, status, category, due_date AS dueDate
                FROM todo
                WHERE todo LIKE '%${search_q}%';
            `;
      break;
  }
  if (sqlQuery) {
    const dbResponse = await db.all(sqlQuery);
    res.send(dbResponse);
  }
});

// API 2
app.get("/todos/:todoId/", async (req, res) => {
  //   console.log(req.params);
  const { todoId } = req.params;
  const sqlQuery = `
        SELECT
            id, todo, priority, status, category, due_date AS dueDate
        FROM todo
        WHERE id = ${todoId};
    `;
  const dbResponse = await db.get(sqlQuery);
  res.send(dbResponse);
});

// API 3
app.get("/agenda/", async (req, res) => {
  //   console.log(req.params);
  const { date } = req.query;
  //   console.log(result);
  if (isValid(new Date(date))) {
    const result = format(new Date(date), "yyyy-MM-dd");
    const sqlQuery = `
          SELECT
              id, todo, priority, status, category, due_date AS dueDate
          FROM todo
          WHERE due_date = '${result}';
      `;
    //   strftime('%Y-%m-%d', due_date) = '${result}';
    const dbResponse = await db.all(sqlQuery);
    res.send(dbResponse);
  } else {
    val = "Due Date";
    res.status(400);
    res.send(`Invalid ${val}`);
  }
});

// API 4
app.post("/todos/", async (req, res) => {
  //   console.log(req.params);
  const { id, todo, priority, status, category, dueDate } = req.body;
  let val;
  let condition = false;
  switch (false) {
    case checkPriority(priority):
      val = "Todo Priority";
      res.status(400);
      res.send(`Invalid ${val}`);
      break;
    case checkStatus(status):
      val = "Todo Status";
      res.status(400);
      res.send(`Invalid ${val}`);
      break;
    case checkCategory(category):
      val = "Todo Category";
      res.status(400);
      res.send(`Invalid ${val}`);
      break;
    case isValid(new Date(dueDate)):
      val = "Due Date";
      res.status(400);
      res.send(`Invalid ${val}`);
      break;

    default:
      condition = true;
  }
  if (condition) {
    const date = format(new Date(dueDate), "yyyy-MM-dd");
    const sqlQuery = `
                INSERT  INTO
                    todo (id, todo, priority, status, category, due_date)
                VALUES (
                    ${id},
                    '${todo}',
                    '${priority}',
                    '${status}',
                    '${category}',
                    '${date}'
                );
            `;
    await db.run(sqlQuery);
    res.send("Todo Successfully Added");
  }
});

// API 5
app.put("/todos/:todoId/", async (req, res) => {
  //   console.log(req.params);
  const { todoId } = req.params;
  let result;
  switch (true) {
    case req.body["status"] !== undefined:
      result = "Status";
      break;
    case req.body["priority"] !== undefined:
      result = "Priority";
      break;
    case req.body["category"] !== undefined:
      result = "Category";
      break;
    case req.body["dueDate"] !== undefined:
      result = "Due Date";
      break;

    default:
      result = "Todo";
      break;
  }
  const sqlQueryGet = `
        SELECT
            id, todo, priority, status, category, due_date AS dueDate
        FROM todo
        WHERE id = ${todoId};
    `;
  const dbResponseGet = await db.get(sqlQueryGet);

  const {
    id = dbResponseGet.id,
    todo = dbResponseGet.todo,
    priority = dbResponseGet.priority,
    status = dbResponseGet.status,
    category = dbResponseGet.category,
    dueDate = dbResponseGet.dueDate,
  } = req.body;

  let val;
  let condition = false;
  switch (false) {
    case checkPriority(priority):
      val = "Todo Priority";
      res.status(400);
      res.send(`Invalid ${val}`);
      break;
    case checkStatus(status):
      val = "Todo Status";
      res.status(400);
      res.send(`Invalid ${val}`);
      break;
    case checkCategory(category):
      val = "Todo Category";
      res.status(400);
      res.send(`Invalid ${val}`);
      break;
    case isValid(new Date(dueDate)):
      val = "Due Date";
      res.status(400);
      res.send(`Invalid ${val}`);
      break;

    default:
      condition = true;
  }
  if (condition) {
    const date = format(new Date(dueDate), "yyyy-MM-dd");
    const sqlQuery = `
                UPDATE
                    todo 
                SET
                    id = ${id},
                    todo = '${todo}',
                    priority = '${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${date}';
                `;
    await db.run(sqlQuery);
    res.send(`${result} Updated`);
  }
});

// API 6
app.delete("/todos/:todoId/", async (req, res) => {
  //   console.log(req.params);
  const { todoId } = req.params;
  const sqlQuery = `
        DELETE
        FROM todo
        WHERE id = ${todoId};
    `;
  await db.run(sqlQuery);
  res.send("Todo Deleted");
});

module.exports = app;

// // API 4
// app.post("/todos/", async (req, res) => {
//   //   console.log(req.params);
//   const { id, todo, priority, status, category, dueDate } = req.body;
//   const date = format(new Date(dueDate), "yyyy-MM-dd");
//   let condition = true;
//   let val;
//   //   if (
//   //     (priority === HIGH || priority === MEDIUM || priority === LOW) &&
//   //     (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
//   //     (category === "WORK" || category === "HOME" || category === "LEARNING") &&
//   //     isValid(new Date(dueDate))
//   //   )
//   if (priority !== "HIGH" || priority !== "MEDIUM" || priority !== "LOW") {
//     condition = false;
//     val = "Todo Priority";
//   }
//   if (category !== "WORK" || category !== "HOME" || category !== "LEARNING") {
//     condition = false;
//     val = "Todo Category";
//   }
//   if (isValid(new Date(dueDate))) {
//     condition = false;
//     val = "Due Date";
//   }
//   if (status !== "TO DO" || status !== "IN PROGRESS" || status !== "DONE") {
//     condition = false;
//     val = "Todo Status";
//   }
//   if (condition) {
//     const sqlQuery = `
//             INSERT  INTO
//                 todo (id, todo, priority, status, category, due_date)
//             VALUES (
//                 ${id},
//                 '${todo}',
//                 '${priority}',
//                 '${status}',
//                 '${category}',
//                 '${date}'
//             );
//         `;
//     await db.run(sqlQuery);
//     res.send("Todo Successfully Added");
//   } else {
//     res.status(400);
//     res.send(`Invalid ${val}`);
//   }
// });

// middleware
// const checkInvalidity = (req, res, next) => {
//   const { id, todo, priority, status, category, dueDate } = req.body;
//   const date = format(new Date(dueDate), "yyyy-MM-dd");
//   let condition = true;
//   let val;
//   //   if (
//   //     (priority === HIGH || priority === MEDIUM || priority === LOW) &&
//   //     (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
//   //     (category === "WORK" || category === "HOME" || category === "LEARNING") &&
//   //     isValid(new Date(dueDate))
//   //   )
//   if (priority !== "HIGH" || priority !== "MEDIUM" || priority !== "LOW") {
//     condition = false;
//     val = "Todo Priority";
//   }
//   if (category !== "WORK" || category !== "HOME" || category !== "LEARNING") {
//     condition = false;
//     val = "Todo Category";
//   }
//   if (isValid(new Date(dueDate))) {
//     condition = false;
//     val = "Due Date";
//   }
//   if (status !== "TO DO" || status !== "IN PROGRESS" || status !== "DONE") {
//     condition = false;
//     val = "Todo Status";
//   }
//   if (condition) {
//     const sqlQuery = `
//             INSERT  INTO
//                 todo (id, todo, priority, status, category, due_date)
//             VALUES (
//                 ${id},
//                 '${todo}',
//                 '${priority}',
//                 '${status}',
//                 '${category}',
//                 '${date}'
//             );
//         `;
//     await db.run(sqlQuery);
//     res.send("Todo Successfully Added");
//   } else {
//     res.status(400);
//     res.send(`Invalid ${val}`);
//   }
// };
