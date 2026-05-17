const mongoose=require ('mongoose')
async function configureDB(){
    try{
        await mongoose.connect(process.env.DB_URL)
        console.log('connect to db');
    }
    catch(err){
        console.log('error connecting to db',err.message)
    }
}
module.exports=configureDB;