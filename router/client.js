const express = require('express')
const router = express.Router()
const clients= require('../controllers/clients')
const catchAsync = require('../helper/catchAsync')
const passport = require('passport')
const { loggedCheck } = require('../middleware')
const { storeReturnUrl } = require('../middleware')
const { validateUser } = require('../middleware');
const { checkExistingUser } = require('../middleware');
const { storeFormData } = require('../middleware');


router.route('/register')
    .get(clients.registerForm)
    .post(storeFormData, validateUser, checkExistingUser,catchAsync(clients.registerFormPost))

router.route('/login')
    .get(clients.loginForm)
    .post(storeReturnUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true, keepSessionInfo: true }), clients.loginFormPost)

router.get('/logout', loggedCheck, clients.logout)

module.exports = router