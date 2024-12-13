const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const petSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, // user-details is taken from token
        ref: "User"
    },
    petParentId: {
        type: Schema.Types.ObjectId, // petParent-Details 
        ref: "PetParent"
    },
    petName: String,
    age: String,
    gender: String,
    category: String,
    breed: String,
    petPhoto: String,
    weight: String,
    vaccinated: {
        type: Boolean,
        default: false
    },
    medication: [{
        medicationName: String,
        description: String,
        dueDate: Date,
        dose: String
    }],
    reminders: [{
        date: Date,
        title: String,
        note: String
    }]
}, { timestamps: true });

const Pet = model("Pet", petSchema);
module.exports = Pet;
