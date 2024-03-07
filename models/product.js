const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: "Category"
    }],
    price: {
        type: Number,
        default: 0,
        min: [0, "Product cannot have a negative cost"]

    },
    numberInStock: {
        type: Number,
        default: 0,
        min: [0, "Stock cannot have a negative number of products"]
    }
});

// Virtual for categories URL
ProductSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/product/${this._id}`;
});

// Export function to create "Category" model class
module.exports = mongoose.model("Product", ProductSchema);