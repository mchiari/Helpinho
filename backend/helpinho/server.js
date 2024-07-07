const express = require("express");
const serverless = require("serverless-http");
const { usersRouter } = require("./users");
const { helpsRouter } = require("./helps");
const { requestsRouter } = require("./requests");

const app = express();
app.use(express.json());

app.use("/users", usersRouter);
app.use("/requests", requestsRouter);
app.use("/helps", helpsRouter);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);