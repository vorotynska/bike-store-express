const asyncHandler = require("express-async-handler");
const Category = require('../models/category');
const Product = require('../models/product');
const {
    body,
    validationResult
} = require("express-validator");

const {
    all
} = require("../routes");

exports.index = asyncHandler(async (req, res, next) => {
    let categorys = await Category.find()
        .sort({
            name: 1
        })
        .exec();
    res.render('index', {
        categorys: categorys
    })
});

exports.category_list = asyncHandler(async (req, res, next) => {
    const categorys = await Category.find().exec()
    res.render('category_list', {
        categorys: categorys
    })
});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, productsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Product.find({
            category: req.params.id
        }, 'name price numberInStock').exec(),
    ]);
    if (category === null) {
        // No results
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_detail", {
        category: category,
        category_products: productsInCategory
    })
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
    const emptyCategory = {
        name: '',
        description: ''
    };

    res.render("category_form", {
        title: "Create Category",
        category: emptyCategory
    });
});

exports.category_create_post = [
    // Validate and sanitize the name field.
    body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({
        min: 3
    })
    .escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a catgory object with escaped and trimmed data.
        const category = new Category({
            name: req.body.name,
            description: req.body.description
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render("category_form", {
                title: "Create Category",
                category: category,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid.
            // Check if Category with same name already exists.
            const categoryExists = await Category.findOne({
                    name: req.body.name,
                    description: req.body.description
                })
                .collation({
                    locale: "en",
                    strength: 2
                })
                .exec();
            if (categoryExists) {
                // Category exists, redirect to its detail page.
                res.redirect(categoryExists.url);
            } else {
                await category.save();
                // New ctegory saved. Redirect to category detail page.
                res.redirect(category.url);
            }
        }
    })
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of cateory and all associated products (in parallel)
    const [category, productsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Product.find({
            category: req.params.id
        }, "name price numberInStock").exec(),
    ]);
    if (category === null) {
        // No results.
        res.redirect("/catalog/categories");
    }

    res.render("category_delete", {
        category: category,
        category_products: productsInCategory,
    });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of categories and all associated products (in parallel)
    const [category, productsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Product.find({
            category: req.params.id
        }, "name price numberInStock").exec(),
    ]);

    if (productsInCategory.length > 0) {
        // Category has products. Render in same way as for GET route.
        res.render("category_delete", {
            category: category,
            category_products: productsInCategory
        });
        return;
    } else {
        // Category has no products. Delete object and redirect to the list of categories.
        await Category.findByIdAndDelete(req.body.id);
        res.redirect("/catalog/categories");
    }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec();

    if (category === null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_form", {
        title: "Update Category",
        category: category
    });
});

// Handle Category update on POST.
exports.category_update_post = [
    // Validate and sanitize the name field.
    body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({
        min: 3
    })
    .escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request .
        const errors = validationResult(req);

        // Create a ctegory object with escaped and trimmed data (and the old id!)
        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render("category_form", {
                title: "Update Category",
                category: category,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            await Category.findByIdAndUpdate(req.params.id, category);
            res.redirect(category.url);
        }
    }),
];

//65e41cb87463d0e398a058f1