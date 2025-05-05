import express from "express";
import User from "../models/user.models.js";
import List from "../models/list.models.js";

const router = express.Router();

//-----------> Api for AddTask
router.post("/addTask", async (req, res) => {
  try {
    // Validate input
    const { title, body, email } = req.body;
    if (!title || !body || !email) {
      return res
        .status(400)
        .json({ message: "Title, body, and email are required" });
    }

    // Find user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "User not found, please sign up first" });
    }

    // Create and save task
    const list = new List({ title, body, user: existingUser });
    await list.save();

    // Add task to user's list and save
    existingUser.list.push(list);
    await existingUser.save();

    // Send response
    res.status(200).json({ list });
  } catch (error) {
    console.error("AddTask error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//-----------> Api for UpdateTask
router.put("/updateTask/:id", async (req, res) => {
  try {
    const { title, body, email } = req.body;
    if (!title || !body || !email) {
      return res
        .status(400)
        .json({ message: "Title, body, and email are required" });
    }
    if (!req.params.id) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "User not found, please sign up first" });
    }
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, user: existingUser._id },
      { title, body },
      { new: true }
    );
    if (!list) {
      return res
        .status(404)
        .json({ message: "Task not found or you don't have permission" });
    }
    res.status(200).json({ list });
  } catch (error) {
    console.error("UpdateTask error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//-----------> Api for DeleteTask
router.delete("/deleteTask/:id", async (req, res) => {
  try {
    const { email } = req.body;
    const taskId = req.params.id;

    // Validate task ID and email
    if (!taskId || !email) {
      return res
        .status(400)
        .json({ message: "Task ID and email are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete task if it exists and belongs to the user
    const deletedTask = await List.findOneAndDelete({
      _id: taskId,
      user: user._id,
    });
    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or not owned by user" });
    }

    // Remove task ID from user's List array
    await User.findOneAndUpdate(
      { email },
      { $pull: { List: taskId } },
      { new: true }
    );

    // Send success response
    res.status(200).json({
      message: "Task deleted successfully",
      deletedTaskId: taskId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error, please try again later",
      error: error.message,
    });
  }
});

//-----------> Api for GetTask
router.get("/getTask/:id", async (req, res) => {
  try {
    const { email } = req.query;
    const userID = req.params.id; // Ignored, but kept for route compatibility

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all tasks where the user'userID is in the user array
    const tasks = await List.find({ user: userID });
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }

    // Send success response with all tasks
    res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks: tasks.map((task) => ({
        id: task._id,
        title: task.title,
        body: task.body,
        user: task.user, // Include user array if needed
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error, please try again later",
      error: error.message,
    });
  }
});
export default router;
