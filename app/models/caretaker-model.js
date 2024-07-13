const mongoose = require('mongoose')
const {Schema,model}= mongoose

const careTakerSchema = new mongoose.Schema({
   userId:{
    type: Schema.Types.ObjectId,
    ref:'User'
   },
   // username: {
   //    type: String,
   //    ref:'User'
   // },
   isVerified:{
    type:Boolean,
    default:false
 }, 
 businessName: String,
//  phoneNumber:Number,
 address: String, 
 photo:String, 
 proof:String, 
 bio: String,
 serviceCharges : [ {
     specialityName: String, 
     amount: Number,
      time: Date } ]
}, { timestamps: true })

const CareTaker = model('CareTaker',careTakerSchema)

module.exports=CareTaker


