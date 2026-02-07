const express = require("express");
const Discussion = require("../models/Discussion");

const router = express.Router();

router.get("/", async (_, res) => {
  const posts = await Discussion.find().sort({ createdAt: -1 });
  res.json(posts);
});

router.post("/", async (req, res) => {
  const post = await Discussion.create(req.body);
  res.json(post);
});

router.post("/:id/comment", async (req, res) => {
  const post = await Discussion.findById(req.params.id);
  post.comments.unshift(req.body);
  await post.save();
  res.json(post);
});

router.post("/:id/like", async (req, res) => {
  const post = await Discussion.findById(req.params.id);
  post.likes += 1;
  await post.save();
  res.json(post);
});

module.exports = router;
