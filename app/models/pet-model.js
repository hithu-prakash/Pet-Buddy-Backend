const mongoose = require('mongoose')
const {Schema ,model}= mongoose

const petSchema = new Schema({
    petName : String,
    age:Date,
    gender: String,
    categories: String,
    breed: String,
    petPhoto:String,
    weight:String,
    vaccinated:{
        type: Boolean, default: false
    },
    
       medication:[{
        medicationName: String,
        description: String,
        dueDate:Date,
        dose: String
    }],
    reminders:[{
        date: Date,
        title :String,
        note:String
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    petParentId:{
        type:Schema.Types.ObjectId,
        ref:"Parent"
    },
    petId:{
        type:Schema.Types.ObjectId,
        ref:"Pet",
    },

})

const Pet = model("Pet",petSchema)

module.exports=Pet