const joi = require("joi")
const pattern = require("../../../utils/regex")
const addProduct = joi.object().keys({
    categoryId: joi.string().required().min(24).max(24),
    brandId: joi.string().required().min(24).max(24),
    name: joi.string().min(2).required().regex(pattern.strPattern),
    sortDescription: joi.string().required().min(50).max(150),
    longDescription: joi.string().min(150).max(500),
    unit: joi.number().integer().required().min(1).max(9999999999),
    image: joi.string(),
    baseCost: joi.number().required().min(0).max(9999999999),
    discount: joi.number().min(0).max(80),
    size: joi.string().min(24).max(24).required(),
    gender: joi.string().min(4).max(5).regex(pattern.gender),
    ageGroup: joi.number().min(0),
})

const updateProduct = joi.object().keys({
    name: joi.string().min(3).regex(pattern.strPattern),
    sortDescription: joi.string().min(50).max(150),
    longDescription: joi.string().min(150).max(500),
    unit: joi.number().integer().min(1).max(9999999999),
    baseCost: joi.number().min(0).max(9999999999),
    image: joi.string(),
    discount: joi.number().min(0).max(80),
    size: joi.string().min(24).max(24),
    gender: joi.string().min(4).max(5).regex(pattern.gender),
    ageGroup: joi.number().min(0),
})

const merchantId = joi.object().keys({
    merchantId: joi.string().min(24).max(24).required()
})


const productId = joi.object().keys({
    productId: joi.string().min(24).max(24).required(),
})

const del = joi.object().keys({
    isDelete: joi.boolean().required(),
})

const categoryId = joi.object().keys({
    categoryId: joi.string().min(24).max(24)
})

module.exports = {
    addProduct,
    merchantId,
    productId,
    updateProduct,
    del,
    categoryId
}