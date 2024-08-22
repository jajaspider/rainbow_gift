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
    category_id: {
      type: Number
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

// Create Model & Export
module.exports = mongoose.model("Brand", categorySchema);
