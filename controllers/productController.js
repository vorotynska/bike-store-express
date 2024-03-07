const asyncHandler = require("express-async-handler");
const Product = require('../models/product');
const Category = require('../models/category');
const {
    body,
    validationResult
} = require("express-validator");
const product = require("../models/product");


exports.product_list = asyncHandler(async (req, res, next) => {
    const products = await Product.find({}, "name price category")
        .sort({
            name: 1
        })
        .populate("category", "name url")
        .exec();
    res.render('product_list', {
        product_list: products
    })
});

exports.product_detail = asyncHandler(async (req, res, next) => {
    // Get details of products, product instances for specific product
    const product = await Product.findById(req.params.id).populate("category", "name url").exec()

    if (product === null) {
        // No results.
        const err = new Error("Product not found");
        err.status = 404;
        return next(err);
    }

    res.render("product_detail", {
        product: product
    });
});

exports.product_create_get = asyncHandler(async (req, res, next) => {
    // Create a blank product object
    const emptyProduct = {
        name: '',
        category: [], // Assuming category is an array
        price: '',
        numberInStock: '',
        description: ''
    };

    // Get all categories
    const allCategories = await Category.find().sort({
        name: 1
    }).exec();

    res.render("product_form", {
        title: "Create Product",
        product: emptyProduct, // Passing empty product object
        categories: allCategories
    });
});

exports.product_create_post = [
    // Convert the category to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category =
                typeof req.body.category === "undefined" ? [] : [req.body.category];
        }
        next();
    },

    // Validate and sanitize fields.
    body("name", "Name must not be empty.")
    .trim()
    .isLength({
        min: 1,
        max: 50
    })
    .escape(),
    body("description", "Description must not be empty.")
    .trim()
    .isLength({
        min: 1,
        max: 300
    })
    .escape(),
    body("price", "Product cannot have a negative cost")
    .trim()
    .isInt().withMessage('Price must be a number')
    .isLength({
        min: 1,
        max: 10
    })
    .escape(),
    body("numberInStock", "Stock cannot have a negative number of products")
    .trim()
    .isInt().withMessage('NumberInStock must be a number')
    .isLength({
        min: 1,
        max: 10
    })
    .escape(),
    body("category.*").escape(),
    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        //Create a Product object with escaped and trimmed data
        const product = new Product({
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            numberInStock: req.body.numberInStock,
            description: req.body.description,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all categories for form.
            const allCategories = await Category.find().sort({
                name: 1
            }).exec();

            // Mark our selected categories as checked.
            for (const category of allCategories) {
                if (product.category.indexOf(category._id) > -1) {
                    category.checked = true;
                }
            }

            res.render("product_form", {
                title: "Create Product",
                categories: allCategories,
                product: product,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid. Save product.
            await product.save();
            res.redirect(product.url);
        }
    }),
];


exports.product_delete_get = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate("category", "name url").exec();
    if (product === null) {
        // No results.
        res.redirect("/catalog/products");
    }

    res.render("product_delete", {
        product: product
    });
});

exports.product_delete_post = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate("category", "name url").exec();
    if (product === null) {
        // No results.
        res.redirect("/catalog/products");
    } else {
        await Product.findByIdAndDelete(req.body.id);
        res.redirect("/catalog/products");
    }
});

exports.product_update_get = asyncHandler(async (req, res, next) => {
    // Get product and categories for form.
    const [product, allCategories] = await Promise.all([
        Product.findById(req.params.id).exec(),
        Category.find().sort({
            name: 1
        }).exec(),
    ]);

    if (product === null) {
        // No results.
        const err = new Error("Product not found");
        err.status = 404;
        return next(err);
    }

    // Mark our selected categories as checked.
    allCategories.forEach((category) => {
        if (product.category.includes(category._id)) category.checked = "true";
    });

    res.render("product_form", {
        title: "Update Product",
        categories: allCategories,
        product: product,
    });
});

// Handle product update on POST.
exports.product_update_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.genre =
                typeof req.body.category === "undefined" ? [] : [req.body.category];
        }
        next();
    },

    // Validate and sanitize fields.
    body("name", "Name must not be empty.")
    .trim()
    .isLength({
        min: 1
    })
    .escape(),
    body("description", "Description must not be empty.")
    .trim()
    .isLength({
        min: 1
    })
    .escape(),
    body("price", "Product cannot have a negative cost")
    .trim()
    .isInt().withMessage('Price must be a number')
    .isLength({
        min: 1,
        max: 10
    })
    .escape(),
    body("numberInStock", "Stock cannot have a negative number of products")
    .trim()
    .isInt().withMessage('NumberInStock must be a number')
    .isLength({
        min: 1,
        max: 10
    })
    .escape(),
    body("category.*").escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Product object with escaped/trimmed data and old id.
        const product = new Product({
            name: req.body.name,
            category: typeof req.body.category === "undefined" ? [] : req.body.category,
            price: req.body.price,
            numberInStock: req.body.numberInStock,
            description: req.body.description,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all category for form
            const allCategories = await Category.find().sort({
                name: 1
            }).exec()

            // Mark our selected genres as checked.
            for (const category of allCategories) {
                if (product.category.includes(category._id)) {
                    category.checked = "true";
                }
            }
            res.render("product_form", {
                title: "Update Product",
                categories: allCategories,
                product: product,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            const updateProduct = await Product.findByIdAndUpdate(req.params.id, product, {});
            // Redirect to product detail page.
            res.redirect(updateProduct.url);
        }
    }),
];