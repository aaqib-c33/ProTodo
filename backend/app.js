import express from "express";
import connectDb from "./connection/db.js";
import "dotenv/config";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});

// Start the server
const PORT = 4000;
app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server running at http://localhost:${PORT}`);
});
