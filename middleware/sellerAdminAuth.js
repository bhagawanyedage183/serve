const productModel = require("../models/products");

const sellerAdminAuth = {
  isAdmin: (req, res, next) => {
    if (req.userDetails && req.userDetails.role === 1) {
      next();
    } else {
      return res.status(403).json({ error: "Admin access required" });
    }
  },

  isSellerOrAdmin: async (req, res, next) => {
    const user = req.userDetails;
    const productId = req.params.id || req.body.pId || req.body.id;

    console.log("SellerAdminAuth Middleware - user:", user);
    console.log("SellerAdminAuth Middleware - productId:", productId);

    if (!user) {
      console.log("SellerAdminAuth Middleware - No user details");
      return res.status(401).json({ error: "Authentication required" });
    }

    if (user.userRole === 1) {
      // Admin has full access
      return next();
    }

    if (user.userRole === 2 || user.userRole === 0) {
      // Seller can only modify their own products
      if (!productId) {
        console.log("SellerAdminAuth Middleware - No product ID");
        return res.status(400).json({ error: "Product ID required" });
      }
      try {
        const product = await productModel.findById(productId);
        console.log("SellerAdminAuth Middleware - product found:", product);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        console.log("SellerAdminAuth Middleware - user._id type:", typeof user._id, "value:", user._id);
        console.log("SellerAdminAuth Middleware - product.seller type:", typeof product.seller, "value:", product.seller);
        if (product.seller.toString() !== user._id.toString()) {
          console.log("SellerAdminAuth Middleware - Access denied: Not your product");
          return res.status(403).json({ error: "Access denied: Not your product" });
        }
        // Prevent sellers from changing approvalStatus
        if (req.body.approvalStatus) {
          return res.status(403).json({ error: "Sellers cannot change approval status" });
        }
        next();
      } catch (err) {
        console.error("SellerAdminAuth Middleware - error:", err);
        return res.status(500).json({ error: "Server error" });
      }
    } else {
      console.log("SellerAdminAuth Middleware - Seller or admin access required");
      return res.status(403).json({ error: "Seller or admin access required" });
    }
  },
};

module.exports = sellerAdminAuth;
