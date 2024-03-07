const express = require("express");
const router = express.Router();

const category_controller = require("../controllers/categoryController");
const product_controller = require("../controllers/productController");

/// Product Routes ///
// Get category home page //
router.get("/", category_controller.index);

// Get for creating product
router.get("/product/create", product_controller.product_create_get);

//Post request for creating product
router.post("/product/create", product_controller.product_create_post);

//Get request to delete product
router.get("/product/:id/delete", product_controller.product_delete_get);

//Post request to delete product
router.post("/product/:id/delete", product_controller.product_delete_post);

//Get request to update Product
router.get("/product/:id/update", product_controller.product_update_get);

// Post request to update Product
router.post("/product/:id/update", product_controller.product_update_post);

// Cet request for one product
router.get("/product/:id/", product_controller.product_detail);

//Get list products
router.get("/products", product_controller.product_list);

///Category router///
// Get for creating Category
router.get('/category/create', category_controller.category_create_get);

//Post request for creating Category
router.post("/category/create", category_controller.category_create_post);

// Cet request for one Category
router.get("/category/:id/", category_controller.category_detail);

//Get request to delete Category
router.get("/category/:id/delete", category_controller.category_delete_get);

//Post request to delete Category
router.post("/category/:id/delete", category_controller.category_delete_post);

//Get request to update Category
router.get("/category/:id/update", category_controller.category_update_get);

// Post request to update Category
router.post("/category/:id/update", category_controller.category_update_post);

//Get list Category
router.get("/categories", category_controller.category_list);

module.exports = router;