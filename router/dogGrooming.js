const express= require('express')
const router= express.Router()
const catchAsync = require('../helper/catchAsync')
const {loggedCheck, validateProduct, isAuthor}= require('../middleware')
const productsController= require('../controllers/products')
const multer  = require('multer')
const {storage}= require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(productsController.index))
    .post(loggedCheck, upload.array('image'), validateProduct, catchAsync(productsController.newFormPost))

router.get('/new', loggedCheck, productsController.newForm)

router.route('/:id')
    .get(catchAsync(productsController.showById))
    .put(isAuthor, upload.array('image'), validateProduct, catchAsync(productsController.editFormPost))
    .delete(loggedCheck, isAuthor, catchAsync(productsController.productDelete))

router.get('/:id/edit', loggedCheck, isAuthor, catchAsync(productsController.editForm))


module.exports= router