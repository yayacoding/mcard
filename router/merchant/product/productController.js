const httpStatus = require("http-status")
const { ObjectID } = require("bson")
const { ProductModel } = require("../../../models/product")
const { MerchantModel } = require("../../../models/merchant")
const { MerchantAddressModel } = require("../../../models/merchantAddress")
const { CategoryModel } = require("../../../models/category")
const { BrandModel } = require("../../../models/brand")

const constents = require("../../../constents/constent")
const errors = require("../../../error/error")
const helperService = require("../../../services/helper")
const { successResponse } = require("../../../response/success")
const { SizeModel } = require("../../../models/size")
const { SIZE_LIST } = require("../../../constents/constent")

//get category List
const category = async(req, res) => {
    getdata = await helperService.findQuery(CategoryModel, req.query)
    console.log(getdata)
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
        result = await successResponse({ data: getdata, count: getdata.count },
            constents.CATEGORY_LIST
        )
        res.status(httpStatus.OK).json(result)
    }
}

//get brands list
const brands = async(req, res) => {
    field = [
        { path: "categoryId", model: "category", select: ["_id", "name"] },
    ]
    getdata = await helperService.populateQuery(BrandModel, req.query, field)
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
            true, { data: getdata, count: getdata.count },
            httpStatus.OK,
            "",
            constents.CATEGORY_LIST
        )
        res.status(httpStatus.OK).json(result)
    }
}

//get size list
const size = async(req, res) => {
    field = [
        { path: "categoryId", model: "category", select: ["_id", "name"] },
    ]
    getdata = await helperService.populateQuery(SizeModel, req.query, field)
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
            true, { data: [], count: 0 },
            httpStatus.OK, "",
            constents.SIZE_LIST
        )
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(result)
    } else {
        result = await successResponse(
            true, { data: getdata, count: getdata.count },
            httpStatus.OK,
            "",
            constents.SIZE_LIST
        )
        res.status(httpStatus.OK).json(result)
    }
}


//add product 
const addProduct = async(req, res, next) => {
    data = req.item
    let getmerchant = await helperService.findQuery(MerchantModel, { _id: req.tokenData.id })
    if (getmerchant.length > 0) {
        if (data.discount) {
            disCost = data.baseCost - (data.baseCost * (data.discount / 100))
        } else {
            disCost = 0
        }
        let getdata = await helperService.insertQuery(ProductModel, {
            merchantId: req.tokenData.id,
            categoryId: data.categoryId,
            brandId: data.brandId,
            name: data.name,
            sortDescription: data.sortDescription,
            longDescription: data.longDescription,
            unit: data.unit,
            image: data.image,
            baseCost: data.baseCost,
            discountCost: disCost,
            discount: data.discount,
            size: data.size,
            gender: data.gender,
            ageGroup: data.ageGroup,
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
                true,
                getdata,
                httpStatus.OK,
                "",
                constents.ADD_PEODUCT
            )
            res.status(httpStatus.OK).json(result)
        }
    } else {
        result = await successResponse(
            true,
            null,
            httpStatus.OK, {
                errCode: errors.DATA_NOT_FOUND.status,
                errMsg: constents.MERCHENT_NOT_EXIST
            },
            ""
        )
        res.status(httpStatus.NOT_FOUND).json(result)
    }
}

//get all product / by id /by name/ also sort by field name/limit/skip/ serch by name /by text, 
const getProduct = async(req, res) => {
    req.query.merchantId = req.tokenData.id
    let field = [
        { path: "merchantId", model: "merchant", select: ["_id", "firstName", "lastName", "email"] },
        { path: "categoryId", model: "category", select: ["_id", "name", "lastName"] },
        { path: "brandId", model: "brand", select: ["_id", "name", "lastName"] },
        { path: "size", model: "size", select: ["_id", "size", "categoryId"] }
    ]
    if (!req.query) {
        req.query = req.query
    }
    if (req.query.productId) {
        req.query._id = req.query.productId
    }

    if (req.query.globalSearchString) {
        req.query.$text = { $search: req.query.globalSearchString }
    }
    if (req.query.searchString) {
        req.query.name = { $regex: '.*' + req.query.searchString + '.*', "$options": 'i' }

    }
    getdata = await helperService.populateQuery(ProductModel, req.query, field)
    console.log(getdata)
    if (getdata == 0) {
        result = await successResponse(
            true, { data: [], count: 0 },
            httpStatus.OK,
            "",
            constents.PRODUCT_LIST
        )
        res.status(httpStatus.OK).json(result)
    }
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
    if (getdata.length > 0) {
        result = await successResponse(
            true, { data: getdata, count: getdata.count },
            httpStatus.OK,
            "",
            constents.PRODUCT_LIST
        )
        res.status(httpStatus.OK).json(result)
    }
}

//update product 
const updateProduct = async(req, res, next) => {
    data = req.body
    data.updatedAt = new Date()
    qury = { _id: req.query.productId, merchantId: req.tokenData.id }
    getdata = await helperService.updateQuery(ProductModel, qury, data)
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
                errMsg: constents.DATA_NOT_FOUND
            },
            ""
        )
        res.status(httpStatus.NOT_FOUND).json(result)
    } else {
        if (data.isDelete) {
            msg = constents.DELETE_PRODUCT,
                response = getdata
        } else {
            msg = constents.UPDATE_PRODUCT,
                response = getdata
        }
        result = await successResponse(
            true,
            response,
            httpStatus.OK,
            "",
            msg
        )
        res.status(httpStatus.OK).json(result)

    }
}

module.exports = {
    addProduct,
    getProduct,
    updateProduct,
    category,
    brands,
    size
}