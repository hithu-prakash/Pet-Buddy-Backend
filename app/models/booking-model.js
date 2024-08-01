const mongoose = require('mongoose')
const {Schema,model} = mongoose

const bookingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    caretakerId: {
        type: Schema.Types.ObjectId,
        ref: 'CareTaker',
        required: true
    },
   petId:{
    type: Schema.Types.ObjectId,
    ref:"Pet"
   },
   parentId:{
    type:Schema.Types.ObjectId,
    ref:"Parent"
   },
   serviceName: {
    type: String,
    required: true
},
  // category:String,
  date: {
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    }
}, bookingDurationInHours: { 
    type: Number,
    required: true
},
    status:{
        type:String,
        default:"pending"
    },
    totalAmount: Number,
       
      Accepted:{
         type:Boolean,
          default:false
      }
})

const Booking = model("Booking",bookingSchema)

module.exports=Booking