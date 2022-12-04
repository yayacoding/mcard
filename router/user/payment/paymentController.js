const { ObjectID } = require("bson")
const bcrypt = require("bcrypt")
const httpStatus = require("http-status")

const { ProductModel } = require("../../../models/product")
const { UserModel } = require("../../../models/user")
const { UserAddressModel } = require("../../../models/userAddress")
const { OtpModel } = require("../../../models/otp")
const { CartModel } = require("../../../models/cart")
const { PaymentModel } = require("../../../models/payment")
const { OrderDetailModel } = require("../../../models/orderDetail")
const { AllOrderDetailModel } = require("../../../models/allOrderDetail")

const constents = require("../../../constents/constent")
const errors = require("../../../error/error")
const { jwtToken, parseJwt } = require("../../../utils/jwtToket")
const KEY = require("../../../utils/randamKey")
const helperService = require("../../../services/helper")
const otp = require("../../../utils/otp")
const { successResponse } = require("../../../response/success")
const req = require("express/lib/request")



//add card detaill for payment
const paymentDetail = async(req, res, next) => {
    data = req.item
        //check to the user exist or not
    getUserData = await helperService.findQuery(UserModel, { _id: ObjectID(req.tokenData.id) })
    if (getUserData.length > 0) {
        //check to card is exist or not 
        getCardData = await helperService.findQuery(PaymentModel, { cardNo: data.cardNo })
        if (getCardData.length > 0) {
            result = await successResponse(
                true,
                null,
                httpStatus.OK, {
                    errCode: errors.CONFLICT.status,
                    errMsg: constents.CARD_EXIST
                },
                ""
            )
            res.status(httpStatus.CONFLICT).json(result)
        } else {

            //create random payment key
            paymentKey = await KEY.random_key()
                //inserting data into payment collection
            let getdata = await helperService.insertQuery(PaymentModel, {
                userId: data.id,
                cardNo: data.cardNo,
                cardName: data.cardName,
                cardHolderName: data.cardHolderName,
                cvvNo: data.cvvNo,
                expDate: data.expDate,
                paymentKey: paymentKey,
            })
            if (getdata.error) {
                result = await successResponse(
                    true,
                    null,
                    httpStatus.OK, {
                        errCode: errors.INTERNAL_SERVER_ERROR.status,
                        errMsg: constents.INTERNAL_SERVER_ERROR
                    },
                    ""
                )
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(result)
            } else {
                result = await successResponse(
                    true, {
                        getdata,

                    },
                    httpStatus.OK,
                    "",
                    constents.CARD_ADDED)
                res.status(httpStatus.OK).json(result)
            }
        }
    } else {
        result = await successResponse(
            true, "",
            httpStatus.OK, {
                errCode: errors.BAD_REQUEST.status,
                errMsg: constents.USER_NOT_EXIST
            },
            ""
        )
        res.status(httpStatus.OK).json(result)
    }
}

//get all card list of perticular user or a single card detail
const paymentList = async(req, res, next) => {
    data = req.query
    if (req.query.id) {
        data._id = req.query.id
    }
    data.userId = req.tokenData.id
    console.log(data)

    getdata = await helperService.findQuery(PaymentModel, data)
    if (getdata.error) {
        result = await successResponse(
            true,
            null,
            httpStatus.OK, {
                errCode: errors.INTERNAL_SERVER_ERROR.status,
                errMsg: constents.INTERNAL_SERVER_ERROR
            },
            ""
        )
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(result)
    } else {
        result = await successResponse(
            true, { getdata, count },

            httpStatus.OK,
            "",
            constents.CARD_LIST)
        res.status(httpStatus.OK).json(result)
    }
}

// update card detail
const updatepayment = async(req, res, next) => {
    data = req.body
    qury = req.query.id
    getdata = await helperService.updateByIdQuery(PaymentModel, ObjectID(qury), data)
    if (getdata.error) {
        result = await successResponse(
            true,
            null,
            httpStatus.OK, {
                errCode: errors.INTERNAL_SERVER_ERROR.status,
                errMsg: constents.INTERNAL_SERVER_ERROR
            },
            ""
        )
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(result)
    }
    if (getdata == 0) {
        result = await successResponse(
            true,
            null,
            httpStatus.OK, {
                errCode: errors.DATA_NOT_FOUND.status,
                errMsg: constents.INVALID_ID
            },
            ""
        )
        res.status(httpStatus.NOT_FOUND).json(result)

    } else {
        result = await successResponse(
            true, {
                getdata,

            },
            httpStatus.OK,
            "",
            constents.CARD_DETAIL_UPDATED)
        res.status(httpStatus.OK).json(result)
    }
}

//delete card detail
const deletepayment = async(req, res, next) => {
    data = req.query.cardId
    console.log(data)
    getdata = await PaymentModel.deleteOne({ _id: data })
    if (getdata.error) {
        result = await successResponse(
            true,
            null,
            httpStatus.OK, {
                errCode: errors.INTERNAL_SERVER_ERROR.status,
                errMsg: constents.INTERNAL_SERVER_ERROR
            },
            ""
        )
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(result)
    }
    if (getdata == 0) {
        result = await successResponse(
            true,
            null,
            httpStatus.OK, {
                errCode: errors.DATA_NOT_FOUND.status,
                errMsg: constents.INVALID_ID
            },
            ""
        )
        res.status(httpStatus.NOT_FOUND).json(result)
    } else {
        result = await successResponse(
            true, "",
            httpStatus.OK,
            "",
            constents.CARD_DELETED)
        res.status(httpStatus.OK).json(result)
    }
}

// make payment  controller
const makePayment = async(req, res) => {

    data = req.item
    field = [
        { path: "productId", model: "product" },
        { path: "userId", model: "user", select: ["_id", "firstName", "lastName"] },
        { path: "userAddressId", model: "userAddress", select: ["_id", "houseNo", "state", "pinCode"] },
    ]

    //generate a tansection id
    transectionId = await KEY.random_key()

    data.orderId.forEach(async element => {
        await helperService.populateQuery(OrderDetailModel, { userId: req.tokenData.id, _id: element }, field)
            .then(async(result) => {
                if (result != 0) {
                    totalAmount = (result[0].baseCost * result[0].unit) + ((result[0].baseCost * result[0].unit) * result[0].discount) / 100
                    paymentData = {
                        paymentKey: data.paymentKey,
                        transectionStatus: true,
                        transectionId: transectionId,
                        totalAmount: totalAmount
                    }
                    await helperService.updateQuery(OrderDetailModel, { _id: element }, paymentData).then(async(resultdata) => {
                        if (result.error) {
                            result = await successResponse(
                                true,
                                null,
                                httpStatus.OK, {
                                    errCode: errors.INTERNAL_SERVER_ERROR.status,
                                    errMsg: constents.INTERNAL_SERVER_ERROR
                                },
                                ""
                            )
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(result)
                        } else {
                            result = await successResponse(
                                true, {
                                    resultdata,
                                },
                                httpStatus.OK,
                                "",
                                constents.PAYMENT_SUCCESSFULL)
                            res.status(httpStatus.OK).json(result)
                        }
                    })
                } else {
                    result = await successResponse(
                        true,
                        null,
                        httpStatus.OK, {
                            errCode: errors.DATA_NOT_FOUND.status,
                            errMsg: constents.DATA_NOT_FOUND
                        },
                        ""
                    )
                    res.status(httpStatus.NOT_FOUND).json(result)
                }
            }).catch(async err => {
                console.log(err)
                result = await successResponse(
                    true,
                    null,
                    httpStatus.OK, {
                        errCode: errors.INTERNAL_SERVER_ERROR.status,
                        errMsg: constents.INTERNAL_SERVER_ERROR
                    },
                    ""
                )
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(result)
            })
    });
}

module.exports = {
    paymentDetail,
    paymentList,
    deletepayment,
    updatepayment,
    makePayment
}