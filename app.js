const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open ({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/")
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Converting todoDBObject To responseTodoDBObject
const responseTodoDBObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

//Scenario 1 => Status Property 
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
//Scenario 2 => Priority Property
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
//Scenario 3 => Priority And Status Properties
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
}
//Scenario 4 => Search Property
const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
//Scenario 5 => Category and Status Properties
const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
}
//Scenario 6 => Category Property
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
//Scenario 7 => Category and Priority Properties
const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
}
//API:1 => Path: /todos/
app.get("/todos/", async(request, response) => {
  let getTodosQuery = " ";
  let getTodosQueryResponse = null;
  const { search_q = "", priority, status, category } = request.query;
  //switch statements
  switch (true) {
    //Scenario 1 => Returns a list of all todos whose status is 'TO DO'
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
        SELECT
          *
        FROM
          todo 
        WHERE
          status = '${status}';`;
        getTodosQueryResponse = await db.all(getTodosQuery);
        response.send(getTodosQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    break;
    //Scenario 2 => Returns a list of all todos whose priority is 'HIGH'
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
        SELECT
          *
        FROM
          todo 
        WHERE
          priority = '${priority}';`;
        getTodosQueryResponse = await db.all(getTodosQuery);
        response.send(getTodosQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    break;
    //Scenario 3 => Returns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
          getTodosQuery = `
          SELECT
            *
          FROM
            todo 
          WHERE
            status = '${status}'
            AND priority = '${priority}';`;
          getTodosQueryResponse = await db.all(getTodosQuery);
          response.send(getTodosQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    break;
    //Scenario 4 => Returns a list of all todos whose todo contains 'Buy' text
    case hasSearchProperty(request.query):
      getTodosQuery = `
      SELECT 
        *
      FROM
        todo
      WHERE 
        todo LIKE '%${search_q}%';`;
      getTodosQueryResponse = await db.all(getTodosQuery);
      response.send(getTodosQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
    break;
    //Scenario 5 => Returns a list of all todos whose category is 'WORK' and status is 'DONE'
    case hasCategoryAndStatusProperties(request.query):
      if (category === "HOME" || category === "WORK" || category === "LEARNING") {
        if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
          getTodosQuery = `
          SELECT
            *
          FROM
            todo 
          WHERE
            category = '${category}'
            AND status = '${status}';`;
          getTodosQueryResponse = await db.all(getTodosQuery);
          response.send(getTodosQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    break;
    //Scenario 6 => Returns a list of all todos whose category is 'HOME'
    case hasCategoryProperty(request.query):
      if ( category === "WORK" || category === "HOME" || category === "LEARNING") {
        getTodosQuery = `
        SELECT 
          * 
        FROM 
          todo 
        WHERE 
          category = '${category}';`;
        getTodosQueryResponse = await db.all(getTodosQuery);
        response.send(getTodosQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    break;
    //Scenario 7 => Returns a list of all todos whose category is 'LEARNING' and priority is 'HIGH'
    case hasCategoryAndPriorityProperties(request.query):
      if (category === "HOME" || category === "WORK" || category === "LEARNING") {
        if (priority === "TO DO" || priority === "IN PROGRESS" || priority === "DONE") {
          getTodosQuery = `
          SELECT
            *
          FROM
            todo 
          WHERE
            category = '${category}'
            AND priority = '${priority}';`;
          getTodosQueryResponse = await db.all(getTodosQuery);
          response.send(getTodosQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
      getTodosQueryResponse = await db.all(getTodosQuery);
      response.send(getTodosQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
  }
});


//API:2 => Path: /todos/:todoId/
//Description: Returns a specific todo based on the todo ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getToDoQuery = `
  SELECT 
    * 
  FROM 
    todo 
  WHERE 
    id = ${todoId};`;
  getToDoQueryResponse = await db.get(getToDoQuery);
  response.send(responseTodoDBObject(getToDoQueryResponse));
});

//API:3 => Path: /agenda/
//Description: Returns a list of all todos with a specific due date in the query parameter /agenda/?date=2021-12-12
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const getDueDateQuery = `
    SELECT 
      * 
    FROM 
      todo 
    WHERE 
      due_date = '${newDate}';`;
    const getDueDateQueryResponse = await db.all(getDueDateQuery);
    //console.log(responseResult);
    response.send(getDueDateQueryResponse.map((eachItem) => responseTodoDBObject(eachItem)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API:4 => Path: /todos/
//Description: Create a todo in the todo table,
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if ( category === "WORK" || category === "HOME" || category === "LEARNING") {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const postTodoQuery = `
          INSERT INTO
            todo (id, todo, category,priority, status, due_date)
          VALUES
            (
              ${id}, '${todo}', '${category}','${priority}', '${status}', '${postNewDueDate}'
            );`;
          await db.run(postTodoQuery);
          //console.log(responseResult);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API:5 => Path: /todos/:todoId/
//Description: Updates the details of a specific todo based on the todo ID
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  console.log(requestBody);
  const previousTodoQuery = `
  SELECT 
    * 
  FROM 
    todo 
  WHERE 
    id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo,
    priority,
    status,
    category,
    dueDate
  } = request.body;

  let updateTodoQuery;
  //switch case statements
  switch (true) {
    //Scenario 1: Request: { "status": "DONE" }, Response: Status Updated
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
        UPDATE 
          todo 
        SET 
          status = '${status}' 
        WHERE 
          id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send(`Status Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //Scenario 2: Request: { "priority": "HIGH" }, Response: Priority Updated
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        updateTodoQuery = `
        UPDATE 
          todo 
        SET 
          priority = '${priority}' 
        WHERE 
          id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send(`Priority Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //Scenario 3: Request: { "todo": "Clean the garden" }, Response: Todo Updated
    case requestBody.todo !== undefined:
      updateTodoQuery = `
      UPDATE 
        todo 
      SET 
        todo = '${todo}' 
      WHERE 
        id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send(`Todo Updated`);
      break;

    //Scenario 4: Request { "category": "LEARNING" }, Response: Category Update
    case requestBody.category !== undefined:
      if ( category === "WORK" || category === "HOME" || category === "LEARNING") {
        updateTodoQuery = `
        UPDATE 
          todo 
        SET 
          category = '${category}'
        WHERE 
          id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send(`Category Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
      
    //Scenario 5: Request { "dueDate": "2021-01-12" }, Response: Due Date Update
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `
        UPDATE 
          todo 
        SET 
          due_date = '${newDueDate}' 
        WHERE 
          id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send(`Due Date Updated`);
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

//API:6 => Path: /todos/:todoId/
//Description: Deletes a todo from the todo table based on the todo ID
//Response: Todo Deleted
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
