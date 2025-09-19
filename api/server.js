import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.static("public"));

const tasksFile = path.join(process.cwd(), "tasks.json");

// Helper: Read tasks.json
function readTasks() {
  if (!fs.existsSync(tasksFile)) {
    fs.writeFileSync(tasksFile, JSON.stringify({ tasks: [], completedTasks: [], deletedTasks: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(tasksFile));
}

// Helper: Write to tasks.json
function writeTasks(data) {
  fs.writeFileSync(tasksFile, JSON.stringify(data, null, 2));
}

// ✅ Get all tasks
app.get("/tasks", (req, res) => {
  const data = readTasks();
  res.json(data);
});

// ✅ Add new task
app.post("/tasks", (req, res) => {
  const data = readTasks();
  const newTask = { id: Date.now(), text: req.body.text };

  data.tasks.push(newTask);
  writeTasks(data);

  res.json(newTask);
});

// ✅ Mark task as completed
app.put("/tasks/:id/complete", (req, res) => {
  const data = readTasks();
  const taskId = parseInt(req.params.id);

  const taskIndex = data.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

  const [completedTask] = data.tasks.splice(taskIndex, 1);
  data.completedTasks.push(completedTask);

  writeTasks(data);
  res.json(completedTask);
});

// ✅ Delete task (from tasks or completedTasks)
app.delete("/tasks/:id", (req, res) => {
  const data = readTasks();
  const taskId = parseInt(req.params.id);

  let task = null;

  // Check in active tasks
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    [task] = data.tasks.splice(taskIndex, 1);
  }

  // Check in completed tasks
  const completedIndex = data.completedTasks.findIndex(t => t.id === taskId);
  if (completedIndex !== -1) {
    [task] = data.completedTasks.splice(completedIndex, 1);
  }

  if (!task) return res.status(404).json({ error: "Task not found" });

  data.deletedTasks.push(task);
  writeTasks(data);

  res.json(task);
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
