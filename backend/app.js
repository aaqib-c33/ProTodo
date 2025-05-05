import express from "express";
import connectDb from "./connection/db.js";
import auth from "./routes/auth.js";
import list from "./routes/list.js";
import "dotenv/config";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});
app.use("/api/v1", auth);
app.use("/api/v2", list);

// Start the server
const PORT = 4000;
app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server running at http:localhost:${PORT}`);
});
