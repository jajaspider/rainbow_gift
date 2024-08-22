const mongoose = require("mongoose");

// Define Schemes
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true
    },
    id: {
      type: Number
    },
    brand_name: {
      type: String
    },
    brand_id: {
      type: Number
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

// Create Model & Export
module.exports = mongoose.model("Item", itemSchema);
