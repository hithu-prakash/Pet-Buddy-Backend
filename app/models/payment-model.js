const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const paymentSchema = new Schema({
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
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String,
        default: false
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failure'],
        default: 'pending'
    }
}, { timestamps: true });

const Payment = model("Payment", paymentSchema);

module.exports = Payment;
