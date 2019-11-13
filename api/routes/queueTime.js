const express = require("express")
const router = express.Router();
const controller = require("../controllers/queueTime")

router.get("/")

router.get("/ping", controller.ping)

router.get("/getRides", controller.getRides)

router.get("/getWaitTime/:rideName", controller.getWaitTime)

module.exports = router