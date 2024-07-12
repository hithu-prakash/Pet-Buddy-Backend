const mongoose = require('mongoose')
const {Schema,model}= mongoose

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    phoneNumber: String,
    password: String,
    otp: Number ,
    role: String,
    isVerified: { type: Boolean, default: false }
  }, { timestamps: true });
  
  // Remove unique index from phoneNumber field
//   userSchema.index({ phoneNumber: 1 }, { unique: false })

const User = model('User',userSchema)

module.exports=User                                                                                                          
