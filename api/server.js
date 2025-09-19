// api/server.js
const express = require("express");
const serverless = require("serverless-http");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TASKS_FILE = path.join(__dirname, "tasks.json");

// Helper functions
function readTasks() {
  if (!fs.existsSync(TASKS_FILE)) return { tasks: [], deletedTasks: [] };
  return JSON.parse(fs.readFileSync(TASKS_FILE));
}

function saveTasks(data) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

// Add a task
app.post("/tasks", (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ message: "Task cannot be empty" });

  const data = readTasks();
  const newTask = { id: Date.now(), task, completed: false };
  data.tasks.push(newTask);
  saveTasks(data);
  res.json(newTask);
});

// Get all tasks
app.get("/tasks", (req, res) => {
  const data = readTasks();
  res.json(data.tasks);
});

// Complete task
app.put("/tasks/:id", (req, res) => {
  const idNum = parseInt(req.params.id);
  const data = readTasks();
  const task = data.tasks.find(t => t.id === idNum);
  if (task) {
    task.completed = true;
    saveTasks(data);
    res.json(task);
  } else res.status(404).json({ message: "Task not found" });
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  const idNum = parseInt(req.params.id);
  const data = readTasks();
  const index = data.tasks.findIndex(t => t.id === idNum);
  if (index !== -1) {
    const [deleted] = data.tasks.splice(index, 1);
    data.deletedTasks.push(deleted);
    saveTasks(data);
    res.json(deleted);
  } else res.status(404).json({ message: "Task not found" });
});

// Get deleted tasks
app.get("/deleted", (req, res) => {
  const data = readTasks();
  res.json(data.deletedTasks);
});

// Restore last deleted
app.post("/restore", (req, res) => {
  const data = readTasks();
  if (data.deletedTasks.length === 0)
    return res.status(400).json({ message: "No deleted tasks" });
  const restored = data.deletedTasks.pop();
  data.tasks.push(restored);
  saveTasks(data);
  res.json(restored);
});

// Restore all deleted
app.post("/restore-all", (req, res) => {
  const data = readTasks();
  if (data.deletedTasks.length === 0)
    return res.status(400).json({ message: "No deleted tasks" });
  data.tasks.push(...data.deletedTasks);
  data.deletedTasks = [];
  saveTasks(data);
  res.json({ message: "All tasks restored" });
});

module.exports = app;
module.exports.handler = serverless(app);
