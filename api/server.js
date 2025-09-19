// api/server.js
const express = require("express");
const serverless = require("serverless-http"); // install this
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let tasks = [];
let deletedTasks = [];

// Add a task
app.post("/tasks", (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ message: "Task cannot be empty" });

  const newTask = { id: Date.now(), task, completed: false };
  tasks.push(newTask);
  res.json(newTask);
});

// Get all tasks
app.get("/tasks", (req, res) => res.json(tasks));

// Mark task completed
app.put("/tasks/:id", (req, res) => {
  const idNum = parseInt(req.params.id);
  const task = tasks.find(t => t.id === idNum);
  if (task) {
    task.completed = true;
    res.json(task);
  } else res.status(404).json({ message: "Task not found" });
});

// Delete task (soft delete)
app.delete("/tasks/:id", (req, res) => {
  const idNum = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === idNum);
  if (index !== -1) {
    const [deleted] = tasks.splice(index, 1);
    deletedTasks.push(deleted);
    res.json(deleted);
  } else res.status(404).json({ message: "Task not found" });
});

// Restore last deleted task
app.post("/restore", (req, res) => {
  if (deletedTasks.length > 0) {
    const restored = deletedTasks.pop();
    tasks.push(restored);
    res.json(restored);
  } else res.status(400).json({ message: "No deleted tasks to restore" });
});

// Restore a specific deleted task by ID
app.post("/restore/:id", (req, res) => {
  const idNum = parseInt(req.params.id);
  const index = deletedTasks.findIndex(t => t.id === idNum);
  if (index !== -1) {
    const [restored] = deletedTasks.splice(index, 1);
    tasks.push(restored);
    res.json(restored);
  } else res.status(404).json({ message: "Task not found in deleted list" });
});

// Restore all deleted tasks
app.post("/restore-all", (req, res) => {
  if (deletedTasks.length > 0) {
    const restoredAll = [...deletedTasks];
    tasks.push(...deletedTasks);
    deletedTasks = [];
    res.json(restoredAll);
  } else res.status(400).json({ message: "No deleted tasks to restore" });
});

module.exports = app;
module.exports.handler = serverless(app);
