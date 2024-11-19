const express = require("express");
const path = require("path");

const ncncRouter = require("./ncnc.router");
const registRouter = require("./regist");
const registHistoryRouter = require("./registHistory");

const router = express.Router();

router.use("/ncnc", ncncRouter);
router.use("/regist", registRouter);
router.use("/regist-history", registHistoryRouter);
/* GET home page. */

router.get("/", (req, res) => {
  // res.render("index", { title: "Express" });
});

router.get("*", (req, res) => {
  res.sendFile(path.resolve(process.cwd(), "public/index.html"));
});

module.exports = router;
