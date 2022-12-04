const express = require("express")
const Router = express.Router()
const customerRoutes = require("./customer/index")
const paymentRoutes = require("./payment/index")

//routes for customer
Router.use("/", customerRoutes)
Router.use("/payment", paymentRoutes)

module.exports = Router