const orderModel = require("../models/orders");
const productModel = require("../models/products");
const mongoose = require("mongoose");

class ProductAddition {
  static async getSoldProductsBySeller(req, res) {
    try {
      const sellerId = req.userDetails ? req.userDetails._id : null;
      if (!sellerId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Aggregate orders to find products sold by this seller
      const soldOrders = await orderModel.aggregate([
        { $unwind: "$allProduct" },
        {
          $lookup: {
            from: "products",
            localField: "allProduct.id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        { $match: { "productDetails.seller": mongoose.Types.ObjectId(sellerId) } },
        {
          $group: {
            _id: "$_id",
            orderId: { $first: "$_id" },
            products: {
              $push: {
                productId: "$productDetails._id",
                name: "$productDetails.pName",
                quantity: "$allProduct.quantitiy",
                price: "$productDetails.pPrice",
                images: "$productDetails.pImages",
              },
            },
            amount: { $first: "$amount" },
            transactionId: { $first: "$transactionId" },
            address: { $first: "$address" },
            phone: { $first: "$phone" },
            status: { $first: "$status" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
      return res.json({ success: true, soldOrders });
    } catch (error) {
      console.error("Error fetching sold products by seller:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}

module.exports = ProductAddition;
