const mongoose = require('mongoose')
const {Schema,model} = mongoose
const adminSchema = new Schema({
    allCareTakers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'CareTaker'
    }],
    allPetParents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'PetParent'
    }],
    verifiedCareTakers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'CareTaker'
    }]
},{timestamps:true})
const Admin = model('Admin',adminSchema)
module.exports = Admin