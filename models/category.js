const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,

    }
});

// Virtual for categories URL
CategorySchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/category/${this._id}`;
});

// Export function to create "Category" model class
module.exports = mongoose.model("Category", CategorySchema);