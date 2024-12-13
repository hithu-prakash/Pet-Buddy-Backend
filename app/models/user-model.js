const mongoose = require('mongoose')
const {Schema,model} = mongoose
const userSchema = new Schema({
    username:{ type:String, required:true},
    email:{
        type:String,
        required:true,
        unique:true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    phoneNumber:{
        type:String,
        required:true,
        minlength: 10,
        maxlength: 10
    },
    password:{ type:String, required:true},
    otp: { type: Number },
    otpExpiry: { type: Date },
    role: { type: String, required: true },
    isVerified: { type: Boolean, default: false }
},{timestamps:true})

const User = model('User',userSchema)
module.exports=User