const User = require('../models/User-model');
const {userValidationSchema} = require('../validations/User-validation');
const bcrypt =require('bcryptjs');
const jwt =require ('jsonwebtoken');

const usersCtrl = {};

//Register
usersCtrl.register = async (req,res)=>{
    const body = req.body;
    const {error,value} = userValidationSchema.validate(body,{abortEarly:false});

    if(error){
        return res.status(400).json({errors:error.details});
    }

    try{
        const existinguser= await User.findOne({email:value.email});
        if(existinguser){
            return res.status(400).json({errors:'Email already registered'});
        }

        //Hash password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(value.password,salt);


        //Create new user with hashed password
        const user = new User({
            ...value,
            password:hashedPassword
        });

        await user.save();

        const userResponse = user.toObject();
            delete userResponse.password;
            res.status(201).json(userResponse);
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({errors:"something went wrong"})
    }

  
}

//Login
usersCtrl.login =async (req,res)=>{
    const {email,password} = req.body;

    try{
        const user =await User.findOne({email});
        if(!user){
            return res.status(400).json({errors:'Invalid email or password'});

        }

        //compare password
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({errors:'Invalid email or password'});

        }

        //Generate token 
        const token =jwt.sign(
            {userId:user._id,role:user.role},
            process.env.JWT_SECRET,
            // {expiresIn:'7d'}

        );
        res.json({token})
    }
    catch(err){
        console.log(err);
        res.status(500).json({errors:'Server error login'})

    }
};


//Account
usersCtrl.account =async(req,res)=>{
    try{
       const user = await User.findById(req.userId).select('password');
        res.json(user);
    }
    catch(err){
        res.status(500).json({errors:'Error account'});
    }
};



usersCtrl.list = async (req, res) => {
    try {
        // Fetch all users, excluding the password field
       const users = await User.find().select('password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ errors: 'Server error  user list.' });
    }
};


module.exports =usersCtrl;