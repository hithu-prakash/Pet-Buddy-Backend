const mongoose = require('mongoose')
const {Schema,model}= mongoose

const parentSchema = new mongoose.Schema({
    userId: {
        type: schema.types.objectId,
        ref:"user"
    },
     parentPhoto: { type: String, required: true },
     address: { type: String, required: true },
     Proof:{ type: String, required: true }
 }, { timestamps: true } )

 const Parent = model('parent',parentSchema)

module.exports=Parent 