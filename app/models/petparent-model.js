const mongoose = require('mongoose')
const {Schema,model}= mongoose

const parentSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    bookingId:{
        type:Schema.Types.ObjectId,
        ref:"Booking"
    },
    // username: String,
    // phoneNumber:String,
     parentPhoto:String,
     address:String, 
     proof:String, 
 }, { timestamps: true } )

 const Parent = model('Parent',parentSchema)

module.exports=Parent 