const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    category: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlogPost", blogPostSchema);
