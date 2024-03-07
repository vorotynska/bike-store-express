const {
    body
} = require("express-validator");

exports.validateCategory = [
    // Validate and sanitize the name field.
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
    .escape()
];

exports.categoryValidationRules = [
    body("price", "Price must be a decimal number with two decimal places")
    .trim()
    .isFloat({
        min: 0
    })
    .isLength({
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
];