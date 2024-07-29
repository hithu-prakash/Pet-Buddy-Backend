const mongoose = require('mongoose')
const {Schema,model}= mongoose 

const serviceChargesSchema = new mongoose.Schema({

    serviceCharges : [ {
        specialityName: {
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
        } } ]
   }, { timestamps: true })

const ServiceCharges = model('ServiceCharges',serviceChargesSchema)

module.exports=ServiceCharges
