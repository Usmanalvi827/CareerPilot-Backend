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
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRouter);

app.use("/api/interview-report", interviewRouter);

// FIX: without this, an unexpected error anywhere in a route (e.g. a
// thrown exception Express 5 auto-forwards to the error handler) would
// fall through to Express's DEFAULT error handler, which sends back an
// HTML error page instead of JSON. Your frontend always expects JSON
// (it reads error.response?.data?.message), so an HTML response there
// would silently break error messages. This makes every error JSON.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server.",
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server Is Running!!!");
});
