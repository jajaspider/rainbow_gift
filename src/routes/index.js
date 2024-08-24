const express = require("express");
const path = require("path");

const ncncRouter = require("./ncnc.router");

const router = express.Router();

router.use("/ncnc", ncncRouter);
/* GET home page. */
router.get("/", (req, res) => {
  // res.render("index", { title: "Express" });
});

router.get("*", (req, res) => {
  res.sendFile(path.resolve(process.cwd(), "public/index.html"));
});

module.exports = router;
