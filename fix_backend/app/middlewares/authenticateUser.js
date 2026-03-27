// const jwt =require('jsonwebtoken');
// const authenticateuser=(req,res,next)=>{
//     const token =req.headers['authorization'];
//     if(!token){
//         return res.status(401).json({error:'token not provided'});
//     }
//     try{
//         let tokenData = jwt.verify(token,process.env.JWT_SECRET);
//         console.log('tokendata',tokenData);
//         req.userId =tokenData.userId;
//         req.role=tokenData.role;
//         next()
//     }
//     catch(err){
//         console.log(err);
//         return res.status(401).json({error:'error message'});
//     }
 
//     }
//     module.exports=authenticateuser;



//middleware/auth.js (updated)
const jwt = require('jsonwebtoken');
const User = require('../models/User-model');

const authenticateuser = async (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) {
    // No token — continue as unauthenticated (do NOT block)
    req.user = null;
    req.userId = null;
    req.userRole = null;
    return next();
  }

  const token = header.split(' ')[1] || header;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally trust payload.role, but fetch user to ensure still valid
    const user = await User.findById(payload.userId).select('-password').lean();
    if (!user) {
      req.user = null;
      req.userId = null;
      req.userRole = null;
      return next();
    }

    req.userId = user._id;
    req.user = user;         // full user object (no password)
    req.userRole = user.role; // use consistent name `userRole`
    return next();
  } catch (err) {
    console.error('authenticateUser error:', err);
    // Treat invalid token as unauthenticated instead of hard 401
    req.user = null;
    req.userId = null;
    req.userRole = null;
    return next();
  }
};

module.exports = authenticateuser;





// // middleware/auth.js (updated)
// const jwt = require('jsonwebtoken');
// const User = require('../models/User-model');

// const authenticateuser = async (req, res, next) => {
//   const header = req.headers['authorization'];
//   if (!header) {
//     req.user = null;
//     req.userId = null;
//     req.userRole = null;
//     return next();
//   }

//   const token = header.split(' ')[1] || header;
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(payload.id).select('-password').lean(); // ✅ use payload.id
//     if (!user) {
//       req.user = null;
//       req.userId = null;
//       req.userRole = null;
//       return next();
//     }

//     req.userId = user._id;
//     req.user = user;
//     req.userRole = user.role;
//     return next();
//   } catch (err) {
//     console.error('authenticateUser error:', err);
//     req.user = null;
//     req.userId = null;
//     req.userRole = null;
//     return next();
//   }
// };

// module.exports = authenticateuser;