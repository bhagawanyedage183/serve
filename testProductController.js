const productController = require("./controller/products_renamed");

console.log("productController keys and types:");
Object.keys(productController).forEach(key => {
  console.log(key, typeof productController[key]);
});

console.log('postAddProduct:', productController.postAddProduct);
console.log('postEditProduct:', productController.postEditProduct);
console.log('getDeleteProduct:', productController.getDeleteProduct);
console.log('getSingleProduct:', productController.getSingleProduct);
console.log('postAddReview:', productController.postAddReview);
console.log('deleteReview:', productController.deleteReview);
console.log('getPendingProducts:', productController.getPendingProducts);
console.log('postDraftProduct:', productController.postDraftProduct);
console.log('getProductByCategory:', productController.getProductByCategory);
console.log('getProductByPrice:', productController.getProductByPrice);
console.log('getWishProduct:', productController.getWishProduct);
console.log('getCartProduct:', productController.getCartProduct);
