const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let tasks = [];
let deletedTasks = [];

// Add a task
app.post("/tasks", (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ message: "Task cannot be empty" });

  const newTask = { id: Date.now(), task, completed: false };
  tasks.push(newTask);
  console.log("Task added:", newTask);
  res.json(newTask);
});

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Mark task completed
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id == id);
  if (task) {
    task.completed = true;
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// Delete task (soft delete)
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id == id);
  if (index !== -1) {
    const [deleted] = tasks.splice(index, 1);
    deletedTasks.push(deleted);
    console.log("Deleted task:", deleted);
    res.json(deleted);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// Get deleted tasks
app.get("/deleted", (req, res) => {
  console.log("Deleted tasks requested:", deletedTasks);
  res.json(deletedTasks);
});

// Restore last deleted task
app.post("/restore", (req, res) => {
  if (deletedTasks.length > 0) {
    const restored = deletedTasks.pop();
    tasks.push(restored);
    console.log("Restored last deleted:", restored);
    res.json(restored);
  } else {
    res.status(400).json({ message: "No deleted tasks to restore" });
  }
});

// Restore all deleted tasks
app.post("/restore-all", (req, res) => {
  if (deletedTasks.length > 0) {
    const restoredAll = [...deletedTasks];
    tasks.push(...deletedTasks);
    deletedTasks = [];
    console.log("Restored all deleted tasks:", restoredAll);
    res.json(restoredAll);
  } else {
    res.status(400).json({ message: "No deleted tasks to restore" });
  }
});


// Restore a specific deleted task by ID
app.post("/restore/:id", (req, res) => {
  const { id } = req.params;
  const index = deletedTasks.findIndex(t => t.id == id);
  if (index !== -1) {
    const [restored] = deletedTasks.splice(index, 1);
    tasks.push(restored);
    console.log("Restored task by ID:", restored);
    res.json(restored);
  } else {
    res.status(404).json({ message: "Task not found in deleted list" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
