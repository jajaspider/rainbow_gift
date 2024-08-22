const express = require("express");

const router = express.Router();
const ncncService = require("../services/ncnc");

router.get("/brand", async (req, res) => {
  try {
    const brands = await ncncService.getBrand();
    return res.json(brands);
  } catch (e) {
    return res.json([]);
  }
});

router.put("/brand", (req, res) => {
  try {
    ncncService.updateBrand();
    return res.json(true);
  } catch (e) {
    console.dir(e);
    return res.json(false);
  }
});

router.get("/category", async (req, res) => {
  try {
    const categories = await ncncService.getCategory();
    return res.json(categories);
  } catch (e) {
    return res.json([]);
  }
});

router.put("/category", (req, res) => {
  try {
    ncncService.updateCategory();
    return res.json(true);
  } catch (e) {
    console.dir(e);
    return res.json(false);
  }
});

// router.get("/item", async (req, res) => {
//   try {
//     const categories = await ncncService.getCategory();
//     return res.json(categories);
//   } catch (e) {
//     return res.json([]);
//   }
// });

router.put("/item", (req, res) => {
  try {
    ncncService.updateItem();
    return res.json(true);
  } catch (e) {
    console.dir(e);
    return res.json(false);
  }
});

module.exports = router;
