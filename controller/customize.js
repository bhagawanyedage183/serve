const customizeModel = require("../models/customize");
const fs = require("fs");
const path = require("path");

exports.getImages = async (req, res) => {
  try {
    const sliders = await customizeModel.find().sort({ createdAt: 1 });
    res.json({ sliders });
  } catch (error) {
    console.error("Error fetching slider images:", error);
    res.status(500).json({ message: "Server error fetching slider images" });
  }
};

exports.deleteSlideImage = async (req, res) => {
  try {
    const { id } = req.body;
    const slide = await customizeModel.findById(id);
    if (!slide) {
      return res.status(404).json({ message: "Slide image not found" });
    }
    // Delete image file from disk
    const imagePath = path.join(__dirname, "..", "public", slide.slideImage);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image file:", err);
      }
    });
    await customizeModel.findByIdAndDelete(id);
    res.json({ message: "Slide image deleted successfully" });
  } catch (error) {
    console.error("Error deleting slide image:", error);
    res.status(500).json({ message: "Server error deleting slide image" });
  }
};

exports.uploadSlideImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    const newSlide = new customizeModel({
      slideImage: `/uploads/customize/${req.file.filename}`,
    });
    await newSlide.save();
    res.json({ message: "Slide image uploaded successfully", slide: newSlide });
  } catch (error) {
    console.error("Error uploading slide image:", error);
    res.status(500).json({ message: "Server error uploading slide image" });
  }
};

exports.getAllData = async (req, res) => {
  try {
    const sliders = await customizeModel.find().sort({ createdAt: 1 });
    // Add other dashboard data if needed
    res.json({ sliders });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
};
