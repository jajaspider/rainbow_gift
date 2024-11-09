const mongoose = require("mongoose");

// Define Schemes
const RegistSchema = new mongoose.Schema(
  {
    category_id: {
      type: Number
    },
    category_name: {
      type: String
    },
    brand_id: {
      type: Number
    },
    brand_name: {
      type: String
    },
    item_id: {
      type: Number
    },
    item_name: {
      type: String
    },
    price: {
      type: Number
    },
    image_path: {
      type: Array
    },
    created_at: {
      type: Date
    },
    updated_at: {
      type: Date
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Create Model & Export
module.exports = mongoose.model("RegistHistory", RegistSchema);
