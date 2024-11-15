const mongoose = require("mongoose");

const giftiStatus = ["progress", "partial_done", "success", "fail"];
// Define Schemes
const RegistHistorySchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: giftiStatus
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

// Create Model & Export
module.exports = mongoose.model("RegistHistory", RegistHistorySchema);
