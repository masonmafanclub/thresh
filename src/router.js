import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import "dotenv/config";

import { User, Session } from "./model";

const router = express.Router();

// signup
router.post("/signup", async (req, res) => {
  if (!req.body.name || !req.body.password || !req.body.email)
    return res.json({ status: "ERROR", msg: "missing info" });

  if (await User.findOne({ email: req.body.email }))
    return res.json({ status: "ERROR", msg: "email already taken" });

  // create new user
  const key = crypto.randomBytes(20).toString("hex");
  let user = new User({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    verified: false,
    key,
  });
  await user.save();

  // corki sendmail
  await fetch(`http://${process.env.CORKI_URL}/sendmail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "keith.zhang@stonybrook.edu",
      id: user._id,
      key,
    }),
  });

  res.json({ status: "OK" });
});

// login
router.post("/login", async (req, res, next) => {
  if (!req.body.name || !req.body.password || !req.body.cookie)
    return res.json({ status: "ERROR", msg: "missing info" });

  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (!user)
    return res.status(401).json({
      error: true,
      description: "no user found",
    });

  if (!user.verified)
    return res.status(401).json({
      error: true,
      description: "not verified",
    });

  const session = new Session({ cookie: req.body.cookie });
  await session.save();

  return res.status(200).json({ name: user.name });
});

// check if logged in
router.post("/islogged", async (req, res) => {
  if (!req.body.cookie)
    return res.json({ status: "ERROR", msg: "missing info" });
  if (await Session.findOne({ cookie: req.body.cookie }))
    return res.json({ status: "OK", logged: true });
  else return res.json({ status: "OK", logged: false });
});

// logout
router.post("/logout", async (req, res) => {
  if (!req.body.cookie)
    return res.json({ status: "ERROR", msg: "missing info" });
  await Session.deleteMany({ cookie: req.body.cookie });
  res.json({ status: "OK" });
});

// verify
router.get("/verify", async (req, res) => {
  if (!req.query.id || !req.query.key)
    return res.json({ error: true, msg: "missing info" });

  // find and update user
  let userres = await User.updateOne(
    { _id: req.query.id, key: req.query.key, verified: false },
    { verified: true }
  ).exec();

  if (!userres.modifiedCount) {
    return res.json({ error: true, msg: "invalid key/id" });
  }

  res.json({ status: "OK" });
});

export default router;
