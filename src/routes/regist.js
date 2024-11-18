const express = require("express");
const DB = require("../models");

const { Regist } = DB;

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const regist = await Regist.find({});
    return res.json(regist);
  } catch (e) {
    return res.json([]);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const regist = await Regist.findOne({ _id: req.params.id });
    return res.json(regist);
  } catch (e) {
    return res.json({});
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await Regist.create(req.body);
    return res.json(result);
  } catch (e) {
    return res.json({});
  }
});

module.exports = router;
