const mongoose = require('mongoose')
const {Schema,model}=mongoose

const paymentSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    caretakerId:{
        type: Schema.Types.ObjectId,
       ref:"caretaker"
   },
    paymentType: String,
    amount: Number,
     date: Date,
    transactionId: {
        type:String,
        default:false
    },
    paymentStatus:{
        type: tring,
        enum:['pending','sucess','failuer'] //default:"pending"
    }


})

const Payment = model("Payment",paymentSchema)

module.exports=Payment