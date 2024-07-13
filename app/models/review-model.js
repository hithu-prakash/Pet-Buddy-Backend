const mongoose = require("mongoose")
const {Schema,model}=mongoose

const reviewSchema=new Schema({
    userId: { 
        type: Schema.Types.ObjectId, //petParent
        ref:"User"
    },
    userId:{
        type:Schema.Types.ObjectId,
       ref:"careTaker"
   },
   reviewPhoto: String,
    rating: Number,
    descriptions: String 

})

const Review = model("Review",reviewSchema)

module.exports=Review