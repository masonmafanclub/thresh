import express from "express";

import router from "./router";

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log(req.method, fullUrl, "body:", req.body);
  next();
});

app.use("/", router);

export default app;
