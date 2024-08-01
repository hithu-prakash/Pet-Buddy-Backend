const mongoose = require('mongoose')
const {Schema,model}=mongoose

const paymentSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    caretakerId:{
        type: Schema.Types.ObjectId,
       ref:"CareTaker"
   },
   bookingId:{
    type: Schema.Types.ObjectId,
    ref:"Booking"
   },
   parentId:{
    type:Schema.Types.ObjectId,
    ref:"Parent"
},
petId:{
    type: Schema.Types.ObjectId,
    ref:"Pet"
   },
    paymentType: String,
    //amount: Number,
    
    transactionId: {
        type:String,
        default:false
    },
    paymentStatus:{
        type:String,
        enum:['pending','success','failure'],
        default:'pending'
    }


})

const Payment = model("Payment",paymentSchema)

module.exports=Payment