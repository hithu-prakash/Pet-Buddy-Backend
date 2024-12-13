const mongoose = require('mongoose')
const {Schema,model} = mongoose
const careTakerSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    careTakerBusinessName:{
        type:String,
        required:true
    },
    verifiedByAdmin:{
        type:Boolean,
        default:false
    },
    address:{
        type:String,
        required:true
    },
    bio:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    },
    proof:{
        type:String,
        required:true
    },
    serviceCharges: [{
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    }],
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },
      }
      
},{timestamps:true})
// careTakerSchema.index({ email: 1 }); // Adding an index on email
const CareTaker = model('CareTaker',careTakerSchema)
module.exports = CareTaker