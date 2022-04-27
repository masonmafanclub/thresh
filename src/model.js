import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/users");

export const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: { type: String, index: true },
    password: String,
    email: String,
    verified: Boolean,
    key: String,
  })
);

export const Session = mongoose.model(
  "Session",
  new mongoose.Schema({
    cookie: String,
    auth: Boolean,
  })
);
