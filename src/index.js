require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRouter = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");
const interviewRouter = require("./routes/interview.routes");

const app = express();
// DATABASE Connection -->>
connectDB();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use("/api/auth", authRouter);

app.use("/api/interview-report", interviewRouter);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server.",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});