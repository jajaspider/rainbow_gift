const express = require("express");
const _ = require("lodash");

const router = express.Router();
const ncncService = require("../services/ncnc");

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

router.get("/item", async (req, res) => {
  try {
    const brandId = req.query.brand;
    const { name } = req.query;
    console.dir(name);
    const categories = await ncncService.getItemSearch(brandId, name);
    return res.json(categories);
  } catch (e) {
    return res.json([]);
  }
});

router.put("/item", (req, res) => {
  try {
    ncncService.updateItem();
    return res.json(true);
  } catch (e) {
    console.dir(e);
    return res.json(false);
  }
});

router.get("/getItemStatus", async (req, res) => {
  try {
    const itemId = _.get(req.query, "id");
    const brandId = _.get(req.query, "brandId");

    const itemStatus = await ncncService.getItemStatus(brandId, itemId);
    return res.json(itemStatus);
  } catch (e) {
    // if (e instanceof RainbowError) {
    //   return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    // }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
