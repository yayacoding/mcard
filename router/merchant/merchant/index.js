const express = require("express")
const route = express.Router()
const merchantController = require("./merchantController")
const { requestValidator } = require("../../../middleware/request_validator")
const verifyToken = require("../../../middleware/auth")
const merchantSchema = require("./merchantSchema")

/************************************ Merchant APIs ******************************************************************** */

route.post("/register", requestValidator(merchantSchema.signUp), merchantController.signUp)
route.post("/logIn", requestValidator(merchantSchema.logIn), merchantController.Login)
route.get("/profile", verifyToken.verifyToken, verifyToken.parseJwtMerchent, merchantController.profile)
route.put("/update", verifyToken.verifyToken, verifyToken.parseJwtMerchent, requestValidator(merchantSchema.update), merchantController.updateProfile)
route.put("/updateAddress", verifyToken.verifyToken, verifyToken.parseJwtMerchent, requestValidator(merchantSchema.updateIds, "query"), requestValidator(merchantSchema.updateAddress), merchantController.updateAddress)
route.delete("/delete", verifyToken.verifyToken, verifyToken.parseJwtMerchent, requestValidator(merchantSchema.del), merchantController.updateProfile)
route.post("/addAddress", verifyToken.verifyToken, verifyToken.parseJwtMerchent, requestValidator(merchantSchema.addAddress), merchantController.addAddress)
route.delete("/deleteAddress", verifyToken.verifyToken, verifyToken.parseJwtMerchent, requestValidator(merchantSchema.del), merchantController.updateProfile)

/****************************************************************************************************************** */
module.exports = route