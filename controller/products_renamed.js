const productModel = require("../models/products");
const fs = require("fs");
const path = require("path");

class Product {
  // Delete Image from uploads -> products folder
  static deleteImages(images, mode) {
    var basePath =
      path.resolve(__dirname, "../../") + "/public/uploads/products/";
    console.log(basePath);
    for (var i = 0; i < images.length; i++) {
      let filePath = "";
      if (mode == "file") {
        filePath = basePath + `${images[i].filename}`;
      } else {
        filePath = basePath + `${images[i]}`;
      }
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        console.log("Exists image");
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
    }
  }

  async getProductsByUser(req, res) {
    try {
      const userId = req.userDetails ? req.userDetails._id : null;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Include rejectionReason field for user to see rejection reason
      const products = await productModel.find({ seller: userId }).populate("pCategory", "cName");
      return res.json({ success: true, products });
    } catch (error) {
      console.error("Error fetching products by user:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getAllProduct(req, res) {
    try {
      let Products = await productModel
        .find({ approvalStatus: "approved" })
        .populate("pCategory", "_id cName")
        .sort({ _id: -1 });
      if (Products) {
        return res.json({ Products });
      }
      return res.json({ Products: [] });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async postAddProduct(req, res) {
    console.log(`postAddProduct called: ${req.method} ${req.originalUrl} by user ${req.user ? req.user._id : 'unknown'}`);
    let { pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus } =
      req.body;
    let images = req.files;
    let user = req.user; // Assuming user info is added to req by auth middleware

    // Validation
    if (
      !pName ||
      !pDescription ||
      !pPrice ||
      !pQuantity ||
      !pCategory ||
      !pOffer
    ) {
      Product.deleteImages(images, "file");
      return res.json({ error: "All fields are required" });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      Product.deleteImages(images, "file");
      return res.json({
        error: "Name max 255 & Description max 3000 characters",
      });
    }
    // Validate Images
    else if (images.length !== 2) {
      Product.deleteImages(images, "file");
      return res.json({ error: "Must provide 2 images" });
    } else {
      try {
        let allImages = [];
        for (const img of images) {
          allImages.push(img.filename);
        }
        let approvalStatus = "pending";
        let seller = user._id;

        // Always set approvalStatus to pending for new products
        approvalStatus = "pending";
        seller = req.body.seller || user._id;

        let newProduct = new productModel({
          pImages: allImages,
          pName,
          pDescription,
          pPrice,
          pQuantity,
          pCategory,
          pOffer,
          pStatus: "inactive",
          approvalStatus,
          seller,
        });
        let save = await newProduct.save();
        if (save) {
          console.log(`Product created successfully by user ${seller}`);
          return res.json({ success: "Product created successfully" });
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
      }
    }
  }

  async postEditProduct(req, res) {
    let {
      pId,
      pName,
      pDescription,
      pPrice,
      pQuantity,
      pCategory,
      pOffer,
      pStatus,
      pImages,
    } = req.body;
    let editImages = req.files || [];

    // Validate other fields
    if (
      !pId ||
      !pName ||
      !pDescription ||
      !pPrice ||
      !pQuantity ||
      !pCategory ||
      !pOffer ||
      !pStatus
    ) {
      return res.json({ error: "All fields are required" });
    }
    // Validate Name and description
    if (pName.length > 255 || pDescription.length > 3000) {
      return res.json({
        error: "Name max 255 & Description max 3000 characters",
      });
    }
    // Validate Update Images
    if (editImages.length === 1) {
      Product.deleteImages(editImages, "file");
      return res.json({ error: "Must provide 2 images" });
    }

    let editData = {
      pName,
      pDescription,
      pPrice,
      pQuantity,
      pCategory,
      pOffer,
      pStatus,
    };

    if (editImages.length === 2) {
      let allEditImages = [];
      for (const img of editImages) {
        allEditImages.push(img.filename);
      }
      editData = { ...editData, pImages: allEditImages };
      if (pImages && typeof pImages === "string") {
        Product.deleteImages(pImages.split(","), "string");
      }
    }

    try {
      let editProduct = productModel.findByIdAndUpdate(pId, editData);
      editProduct.exec((err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Failed to edit product" });
        }
        return res.json({ success: "Product edited successfully" });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getDeleteProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteProductObj = await productModel.findById(pId);
        let deleteProduct = await productModel.findByIdAndDelete(pId);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
          Product.deleteImages(deleteProductObj.pImages, "string");
          return res.json({ success: "Product deleted successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getSingleProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let singleProduct = await productModel
          .findById(pId)
          .populate("pCategory", "cName")
          .populate("pRatingsReviews.user", "name email userImage");
        if (singleProduct) {
          return res.json({ Product: singleProduct });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getProductByCategory(req, res) {
    let { catId } = req.body;
    if (!catId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pCategory: catId })
          .populate("pCategory", "cName");
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Search product wrong" });
      }
    }
  }

  async getProductByPrice(req, res) {
    let { price } = req.body;
    if (!price) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pPrice: { $lt: price } })
          .populate("pCategory", "cName")
          .sort({ pPrice: -1 });
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getWishProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let wishProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (wishProducts) {
          return res.json({ Products: wishProducts });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getCartProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let cartProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (cartProducts) {
          return res.json({ Products: cartProducts });
        }
      } catch (err) {
        return res.json({ error: "Cart product wrong" });
      }
    }
  }

  async postAddReview(req, res) {
    let { pId, uId, rating, review } = req.body;
    if (!pId || !rating || !review || !uId) {
      return res.json({ error: "All fields are required" });
    } else {
      let checkReviewRatingExists = await productModel.findOne({ _id: pId });
      if (checkReviewRatingExists.pRatingsReviews.length > 0) {
        for (const item of checkReviewRatingExists.pRatingsReviews) {
          if (item.user.toString() === uId.toString()) {
            return res.json({ error: "You have already reviewed the product" });
          }
        }
      }
      try {
        let newRatingReview = productModel.findByIdAndUpdate(pId, {
          $push: {
            pRatingsReviews: {
              review: review,
              user: uId,
              rating: rating,
            },
          },
        });
        newRatingReview.exec((err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Server error" });
          }
          return res.json({ success: "Thanks for your review" });
        });
      } catch (err) {
        return res.status(500).json({ error: "Server error" });
      }
    }
  }

  async deleteReview(req, res) {
    let { rId, pId } = req.body;
    if (!rId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let reviewDelete = productModel.findByIdAndUpdate(pId, {
          $pull: { pRatingsReviews: { _id: rId } },
        });
        reviewDelete.exec((err, result) => {
          if (err) {
            console.log(err);
          }
          return res.json({ success: "Your review is deleted" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
  async getPendingProducts(req, res) {
    try {
      let pendingProducts = await productModel
        .find({ approvalStatus: "pending" })
        .populate("pCategory", "_id cName")
        .populate("seller", "name email")
        .sort({ createdAt: -1 });
      return res.json({ pendingProducts });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async updateProductStatus(req, res) {
    let { id } = req.params;
    let { approvalStatus, rejectionReason } = req.body;
    console.log("updateProductStatus called with id:", id, "body:", req.body);
    if (!id || !approvalStatus) {
      return res.status(400).json({ error: "Product ID and status required" });
    }
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({ error: "Invalid approval status" });
    }
    if (approvalStatus === "rejected" && (!rejectionReason || rejectionReason.trim() === "")) {
      return res.status(400).json({ error: "Rejection reason is required when rejecting a product" });
    }
    try {
      let updateData = { approvalStatus };
      if (approvalStatus === "approved") {
        updateData.pStatus = "active";
      } else if (approvalStatus === "rejected") {
        updateData.pStatus = "inactive";
        updateData.rejectionReason = rejectionReason || "";
      }
      let updatedProduct;
      try {
        updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });
      } catch (updateErr) {
        console.error("Error updating product:", updateErr);
        return res.status(500).json({ error: "Failed to update product", details: updateErr.message });
      }
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      // Send email notification to seller about status change
      const notificationModel = require("../models/notification");
      const nodemailer = require("nodemailer");

      // Create notification in DB
      const notificationMessage =
        approvalStatus === "approved"
          ? `Your product "${updatedProduct.pName}" has been approved.`
          : `Your product "${updatedProduct.pName}" has been rejected. Reason: ${rejectionReason || "No reason provided"}`;

      try {
        await notificationModel.create({
          user: updatedProduct.seller,
          message: notificationMessage,
          type: "product-approval",
          readStatus: false,
        });
      } catch (notifErr) {
        console.error("Error creating notification:", notifErr);
      }

      // Send email notification
      const userModel = require("../models/users");
      const seller = await userModel.findById(updatedProduct.seller);

      if (seller && seller.email) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          console.log("Email credentials are not set. Skipping email sending.");
        } else {
          try {
            let transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            let mailOptions = {
              from: process.env.EMAIL_USER,
              to: seller.email,
              subject: "Product Approval Status Update",
              text: notificationMessage,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error("Email error:", error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });
          } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
          }
        }
      }

      return res.json({ success: "Product status updated", product: updatedProduct });
    } catch (err) {
      console.error("Update product status error:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }
  }

  async postDraftProduct(req, res) {
    let { pName, pDescription, pPrice, pQuantity, pCategory, pOffer } = req.body;
    let images = req.files;
    let user = req.userDetails; // revert to req.userDetails

    if (
      !pName ||
      !pDescription ||
      !pPrice ||
      !pQuantity ||
      !pCategory ||
      !pOffer
    ) {
      Product.deleteImages(images, "file");
      return res.status(400).json({ error: "All fields must be required" });
    }
    if (pName.length > 255 || pDescription.length > 3000) {
      Product.deleteImages(images, "file");
      return res.status(400).json({
        error: "Name max 255 & Description max 3000 characters",
      });
    }
    if (images.length !== 2) {
      Product.deleteImages(images, "file");
      return res.status(400).json({ error: "Must provide 2 images" });
    }
    try {
      let allImages = [];
      for (const img of images) {
        allImages.push(img.filename);
      }
      let newProduct = new productModel({
        pImages: allImages,
        pName,
        pDescription,
        pPrice,
        pQuantity,
        pCategory,
        pOffer,
        pStatus: "inactive",
        approvalStatus: "pending",
        seller: user ? user._id : null,
      });
      let save = await newProduct.save();
      if (save) {
        return res.json({ success: "Product draft submitted successfully" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
}

const productController = new Product();
module.exports = productController;
