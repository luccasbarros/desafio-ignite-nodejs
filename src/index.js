const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => {
    return username === user.username;
  });

  if (!userExists) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = userExists;

  return next();
}

app.post("/users", (request, response) => {
  const userExists = users.find((user) => {
    return user.username === request.body.username;
  });

  if (userExists) {
    return response.status(400).send({ error: "User already exists" });
  }

  const userInput = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: [],
  };

  users.push(userInput);

  response.status(201).json(userInput);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todoInput = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoInput);

  return response.status(201).send(todoInput);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todoToEdit = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todoToEdit) {
    return response.status(404).json({ error: "User does not exists" });
  }

  todoToEdit.title = title;
  todoToEdit.deadline = new Date(deadline);

  return response.status(200).send(todoToEdit);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoEditDone = user.todos.find((todo) => {
    return todo.id === id && todo.done === false;
  });

  if (!todoEditDone) {
    return response.status(404).send({ error: "Todo does not exist." });
  }

  todoEditDone.done = true;

  return response.status(200).send(todoEditDone);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.findIndex((todo) => {
    return todo.id === id;
  });

  if (todo === -1) {
    return response.status(404).json({ error: "Todo doest not exists." });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
