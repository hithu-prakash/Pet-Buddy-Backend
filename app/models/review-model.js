const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    caretakerId: {
        type: Schema.Types.ObjectId,
        ref: "CareTaker",
        required: true
    },
    petId:{
        type:Schema.Types.ObjectId,
        ref:"Pet",
        required:true
    },
    parentId:{
        type:Schema.Types.ObjectId,
        ref:"Parent",
        required:true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    ratings: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    photos: {
        type: String
    }
}, { timestamps: true });

const Review = model('Review', reviewSchema);
module.exports = Review;
