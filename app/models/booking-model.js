const mongoose = require('mongoose')
const {Schema,model} = mongoose

const bookingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref:"User" //parentId
    },
    caretakerId:{
    type: Schema.Types.ObjectId, //careTakerId
       ref:"CareTaker"
   },
   petId:{
    type: Schema.Types.ObjectId,
    ref:"Pet"
   },
   parentId:{
    type:Schema.Types.ObjectId,
    ref:"Parent"
   },
   category:String,
   date:{
    // startTime: Date,
    // endTime: Date
    },
    status:{
        type:String,
        default:"pending"
    },
    totalAmount: Number,
      // isCheckedIn: {
      //   type: String,
      //   default: false,
      // },
      //  isCheckedOut: {
      //   type: String,
      //   default: false,
      // },
      // isDeleted: {
      //   type: String,
      //   default: "pending",
      // },
      Accepted:{
         type:Boolean,
          default:false
      }
})

const Booking = model("Booking",bookingSchema)

module.exports=Booking