const mongoose = require("mongoose")
const { Schema } = require("../config/connection")


const orderSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    userAddressId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "userAddress"
    },
    merchantId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "product",
    },
    productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "product",
    },
    baseCost: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
    },
    unit: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        default: 1
    },
    amount: {
        type: Number,
    },
    transectionStatus: {
        type: Boolean,
        default: false
    },
    paymentKey: {
        type: String
    },
    transectionId: {
        type: String,
        default: 0
    },
}, { timestamps: true })

const OrderDetailModel = mongoose.model('orderDetail', orderSchema)
module.exports = {
    OrderDetailModel
}