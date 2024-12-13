const mongoose = require('mongoose')
const {Schema,model} = mongoose
const petParentSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    photo:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    proof:{
        type:String,
        required:true
    }
},{timestamps:true})
const PetParent = model('PetParent',petParentSchema)
module.exports = PetParent
