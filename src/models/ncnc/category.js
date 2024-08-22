const mongoose = require("mongoose");

// Define Schemes
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    id: {
      type: Number
    },
    categoryId: {
      type: Number
    },
    brandId: {
      type: Number
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

// Create Model & Export
module.exports = mongoose.model("Category", categorySchema);
