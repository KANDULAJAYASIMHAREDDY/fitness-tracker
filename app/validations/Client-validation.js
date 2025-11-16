const joi = require('joi');


const clientValidationSchema = joi.object({
    trainerId:joi.string().optional(),
    goal:joi.string().min(3).max(200).required(),
    subscriptionStatus:joi.string().valid('active','inactive','pending').required(),
    // progressId:joi.string().required()
});

module.exports = {clientValidationSchema};