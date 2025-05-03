const express = require("express");
const router = express.Router();
const blogController = require("../controller/blog");

router.get("/posts", blogController.getPosts);
router.post("/posts", blogController.createPost);
router.put("/posts/:id", blogController.updatePost);
router.delete("/posts/:id", blogController.deletePost);

module.exports = router;