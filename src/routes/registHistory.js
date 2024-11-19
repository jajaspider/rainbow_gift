const express = require("express");
const DB = require("../models");

const { RegistHistory } = DB;

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const regist = await RegistHistory.find({});
    return res.json(regist);
  } catch (e) {
    return res.json([]);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const regist = await RegistHistory.findOne({ _id: req.params.id });
    return res.json(regist);
  } catch (e) {
    return res.json({});
  }
});

router.post("/:id", async (req, res) => {
  try {
    const result = await RegistHistory.create(req.body);
    return res.json(result);
  } catch (e) {
    return res.json({});
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await RegistHistory.updateOne(
      { _id: req.params.id },
      { $set: { active: false } }
    );

    return res.json({});
  } catch (e) {
    return res.json({});
  }
});

module.exports = router;
