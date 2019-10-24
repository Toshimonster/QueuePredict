const express = require("express")
const router = express.Router();
const controller = require("../controllers/queueTime")

router.get("/")

router.get("/ping", controller.ping)

module.exports = router