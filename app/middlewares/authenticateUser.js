const jwt =require('jsonwebtoken');
const authenticateuser=(req,res,next)=>{
    const token =req.headers['authorization'];
    if(!token){
        return res.status(401).json({error:'token not provided'});
    }
    try{
        let tokenData = jwt.verify(token,process.env.JWT_SECRET);
        console.log('tokendata',tokenData);
        req.userId =tokenData.userId;
        req.role=tokenData.role;
        next()
    }
    catch(err){
        console.log(err);
        return res.status(401).json({error:'error message'});
    }
 
    }
    module.exports=authenticateuser;
