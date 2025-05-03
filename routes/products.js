const express = require("express");
const router = express.Router();
const productController = require("../controller/products_renamed");
const productAddition = require("../controller/products_renamed_addition");
const logger = require("../middleware/logger");

const multer = require("multer");
const { loginCheck: requireSignin, normalizeUserRole } = require("../middleware/auth");
const sellerAdminAuth = require("../middleware/sellerAdminAuth");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.use(logger);

router.get("/all-product", productController.getAllProduct.bind(productController));
router.post("/product-by-category", productController.getProductByCategory.bind(productController));
router.post("/product-by-price", productController.getProductByPrice.bind(productController));
router.post("/wish-product", productController.getWishProduct.bind(productController));
router.post("/cart-product", productController.getCartProduct.bind(productController));

router.post("/add-product", requireSignin, sellerAdminAuth.isSellerOrAdmin, upload.any(), productController.postAddProduct.bind(productController));
router.post("/edit-product", requireSignin, upload.any(), sellerAdminAuth.isSellerOrAdmin, productController.postEditProduct.bind(productController));
router.post("/delete-product", requireSignin, sellerAdminAuth.isSellerOrAdmin, productController.getDeleteProduct.bind(productController));
router.post("/single-product", productController.getSingleProduct.bind(productController));

router.post("/add-review", requireSignin, productController.postAddReview.bind(productController));
router.post("/delete-review", requireSignin, productController.deleteReview.bind(productController));

// New routes for scrapyard feature
router.get("/pending", requireSignin, normalizeUserRole, sellerAdminAuth.isAdmin, productController.getPendingProducts.bind(productController));
router.put("/:id/status", requireSignin, normalizeUserRole, sellerAdminAuth.isAdmin, productController.updateProductStatus.bind(productController));
router.post("/draft", requireSignin, upload.any(), productController.postDraftProduct.bind(productController));

router.get("/user-products", requireSignin, productController.getProductsByUser.bind(productController));

// New route to get sold products for seller
router.get(
  "/sold-products",
  requireSignin,
  productAddition.getSoldProductsBySeller
);


module.exports = router;
