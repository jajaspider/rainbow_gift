const express = require("express");

const ncncRouter = require("./ncnc.router");

const router = express.Router();

router.use("/ncnc", ncncRouter);
/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", { title: "Express" });
});

module.exports = router;
