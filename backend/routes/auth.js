import express from "express";
import User from "../models/user.models.js";
import bcrypt from "bcrypt";

const router = express.Router();

//-----------> Api for Register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, password: hashedPassword });

    await user.save().then(() => {
      res.status(200).json({ user: user });
    });
  } catch (error) {
    res.status(400).json({ Message: "User already Exist" });
  }
});

//-----------> Api for SignIn
router.post("/signin", async (req, res) => {
  try {
    // Validate input
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Please Sign Up First" });
    }

    // Check password
    if (!user.password) {
      return res.status(400).json({ message: "User password not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Password Is Not Correct!" });
    }

    // Return user data (without password)
    const { password, ...others } = user._doc;
    res.status(200).json({ others });
  } catch (error) {
    console.log("Signin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
