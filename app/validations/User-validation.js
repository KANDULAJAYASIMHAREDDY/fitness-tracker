const joi= require("joi");

const userValidationSchema = joi.object({
    name:joi.string().min(3).max(50).required().trim(),
    email:joi.string().email().required().trim(),
    password:joi.string().min(8).required(),
    role:joi.string().valid('Admin','Trainer','Client'),
    phonenumber:joi.number().allow('',null),
    gender:joi.string().valid('Male','Female','Other'),
    height: joi.number().positive().allow(null).optional(),
    weight: joi.number().positive().allow(null).optional(),
    profileImage: joi.string().uri().allow('', null).optional(),

});

module.exports={userValidationSchema}