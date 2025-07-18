const { ProductJoiSchemas, ReviewJoiSchema, UserJoiSchema } = require('./jJoiSchemas');
const ExpressError = require('./helper/expressError');
const Product = require('./types/products');
const Review = require('./types/review');
const Client = require('./types/client'); 
const zxcvbn = require('zxcvbn');

// Middleware to check if user is logged in
module.exports.loggedCheck = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnUrl = req.originalUrl;
    req.flash('error', 'Please login first');
    return res.redirect('/login');
  }
  next();
};

// Validate product using Joi schema
module.exports.validateProduct = (req, res, next) => {
  const { error } = ProductJoiSchemas.validate(req.body);
  if (error) {
    const message = error.details.map(el => el.message).join(', ');
    throw new ExpressError(message, 400);
  }
  next();
};

// Validate review using Joi schema
module.exports.validateReview = (req, res, next) => {
  const { error } = ReviewJoiSchema.validate(req.body);
  if (error) {
    const message = error.details.map(el => el.message).join(', ');
    throw new ExpressError(message, 400);
  }
  next();
};

// Async wrapper to catch errors (assuming you have catchAsync helper)
const catchAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Check if logged-in user is author of the product
module.exports.isAuthor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const found = await Product.findById(id);
  if (!found.author[0].equals(req.user._id)) {
    req.flash('error', 'Sorry, you do not have permission');
    return res.redirect(`/dogGrooming/${id}`);
  }
  next();
});

// Check if logged-in user is author of the review
module.exports.isAuthorReview = catchAsync(async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'Sorry, you do not have permission');
    return res.redirect(`/dogGrooming/${id}`);
  }
  next();
});

// Store returnUrl from session to res.locals and clear session
module.exports.storeReturnUrl = (req, res, next) => {
  if (req.session.returnUrl) {
    res.locals.returnUrl = req.session.returnUrl;
    delete req.session.returnUrl;
  }
  next();
};

module.exports.validateUser = (req, res, next) => {
  const { error } = UserJoiSchema.validate(req.body.user);
  if (error) {
    const message = error.details.map(el => el.message).join(', ');
    throw new ExpressError(message, 400);
  }
  next();
};

module.exports.checkExistingUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  const result = zxcvbn(password);
  if (result.score < 3) {
    errors.push("Your password is too weak. To proceed, it needs to be rated 'Good' or higher. Try adding an uppercase letter, a number, or a symbol.");
  }

  const emailExists = await Client.findOne({ email });
  if (emailExists) errors.push('Email is already registered.');

  const usernameExists = await Client.findOne({ username });
  if (usernameExists) errors.push('Username is already taken.');

  if (errors.length > 0) {
    req.flash('error', errors);
    return res.redirect('/register');
  }

  next();
};

module.exports.storeFormData = (req, res, next) => {
  const { username, email } = req.body;
  req.session.formData = { username, email };
  next();
};

