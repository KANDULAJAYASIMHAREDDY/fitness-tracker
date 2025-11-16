const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
     name:{ type:String, required:true, trim:true},
    email:{type:String, required:true, unique:true, trim:true},
    password:{type:String, required:true},

    role:{
        type:String,
        enum:["Admin","Trainer","Client"],
        default:"Client",
    },
    phonenumber:{type:Number,trim:true},
    gender:{type:String},
    age:{type:Number},
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
},{
        timestamps:true
  
})


const User = mongoose.model("User",userSchema);
module.exports = User;