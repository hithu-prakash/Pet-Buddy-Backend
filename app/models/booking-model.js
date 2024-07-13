const mongoose = require('mongoose')
const {Schema,model} = mongoose

const bookingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref:"User" //parentId
    },
    caretakerId:{
    type: Schema.Types.ObjectId, //careTakerId
       ref:"User"
   },
   petId:{
    type: Schema.Types.ObjectId,
    ref:"Pet"
   },
   category:String,
   date:{
    startTime: Date,
    endTime: Date
    },
    status:{
        type:String,
        default:false
    },
    totalAmount: Number,
      isCheckedIn: {
        type: String,
        default: false,
      },
       isCheckedOut: {
        type: String,
        default: false,
      },
      isDeleted: {
        type: String,
        default: "false",
      },
      Accepted:{
         type:Boolean,
          default:false
      }
})

const Booking = model("Booking",bookingSchema)

module.exports=Booking