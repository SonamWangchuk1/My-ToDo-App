const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getTodos, addTodo, updateTodo, deleteTodo } = require("./src/api/api.node.js"); // make sure path is correct

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root route to check server
app.get("/", (req, res) => {
  res.send("Todo REST API is running!");
});

// GET all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await getTodos();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST a new todo
app.post("/api/todos", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task is required" });
    const todo = await addTodo(task);
    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add todo" });
  }
});

// PUT update a todo
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await updateTodo(id, updates);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// DELETE a todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteTodo(id);
    res.json({ success });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
