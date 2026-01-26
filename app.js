require("dotenv").config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
});
console.log('DATABASE_URL', process.env.DATABASE_URL)
const express = require("express");
const path = require("node:path");
const cors = require("cors");

const router = require("./routes/router");
const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const adminRouter = require("./routes/adminRouter");
const { default: next } = require("next");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist")));

// api routes
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/", router);

// SPA fallback
// app.use((req, res, next) => {
//   res.sendFile(path.resolve(__dirname, "dist", "index.html"), err =>{
//     if (err) next(err);
//   });
// });

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  process.env.NODE_ENV === 'development' ? console.log('Dev mode') : console.log('Prod mode')
  console.log(`Coffee server active on port: ${PORT}`);
});
