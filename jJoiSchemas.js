const basejoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) {
                    return helpers.error('string.escapeHTML', { value });
                }
                return clean;
            }
        }
    }
});

const joi = basejoi.extend(extension);

module.exports.ProductJoiSchemas = joi.object({
  product: joi.object({
    name: joi.string().required().escapeHTML(),
    price: joi.number().required().min(0),
    briefDes: joi.string().required().escapeHTML(),
    description: joi.string().required().escapeHTML(),
    location: joi.string().required().escapeHTML(),
    image: joi.string().optional().escapeHTML(), 
    category: joi.string().required(),
    deleteImages: joi.array().items(joi.string()).optional()
  }).required()
});


module.exports.ReviewJoiSchema = joi.object({
    review: joi.object({
        body: joi.string().required().escapeHTML(),
        rating: joi.number().required().min(1).max(5)
    }).required()
});

module.exports.UserJoiSchema = joi.object({
    user: joi.object({
        username: joi.string().min(3).max(20).required().escapeHTML(),
        email: joi.string().email().required().escapeHTML(),
        password: joi.string().min(6).required()
    }).required()
});
