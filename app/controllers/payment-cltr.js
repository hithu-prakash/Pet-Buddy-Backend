const Payment = require('../models/payment-model')
const Booking = require('../models/booking-model')
const User = require('../models/user-model')
const nodemailer = require('nodemailer')
const stripe = require('stripe')(process.env.STRIPE_KEY)
const { validationResult } = require('express-validator')
const _= require('lodash')

const paymentCltr={}

paymentCltr.pay = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    try{
        const userId = req.user.id;
        // Extract bookingId from request parameters
        const { bookingId } = req.params;
        console.log('userId:',userId);
        console.log('bookingId:',bookingId)

        // Find the booking record
        const booking = await Booking.findById(bookingId).populate('userId caretakerId petId petparentId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        console.log('booking Details:',booking)

        // Extract necessary data from booking
        const { caretakerId, petId, petparentId, totalAmount, bookingDurationInHours } = booking;

        
        //create a customer
        const customer = await stripe.customers.create({
            name: "Testing",
            address: {
                line1: 'India',
                postal_code: '517501',
                city: 'Tirupati',
                state: 'AP',
                country: 'US',
            },
        }) 
        
        //create a session object
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:[{
                price_data:{
                    currency:'inr',
                    product_data:{
                        name:'Pet Buddy'
                    },
                    unit_amount:booking.totalAmount * 100
                },
                quantity: 1
            }],
            mode:"payment",
            success_url:"http://localhost:3000/success?clientSecret={CHECKOUT_SESSION_ID}",
            cancel_url: 'http://localhost:3000/failure?session_id={CHECKOUT_SESSION_ID}',
            customer : customer.id
        })

        // Create Payment
        const payment = new Payment({
            userId,
            caretakerId,
            bookingId,
            transactionId: session.id,
            paymentType: "card",
            amount: totalAmount,
            paymentStatus: "pending"
        });

        await payment.save();
         // Fetch the newly created payment with populated fields
         const populatedPayment = await Payment.findById(payment._id)
         .populate('userId caretakerId bookingId')
         .exec();

     res.json({
        clientSecret: session.id,
         url: session.url,
         payment: populatedPayment
     });
        

    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'})
    }
}

paymentCltr.showall = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.user.id;
        const payments = await Payment.find({ userId }).populate('userId caretakerId bookingId').exec();
        res.json({ payments });
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
paymentCltr.successUpdate=async(req,res)=>{
    try{
        const id = req.params.id
        const paymentRecord = await Payment.findOne({transactionId:id})
        if(!paymentRecord){
            return res.status(404).json({error:'record not found'})
        }
        //const body = pick(req.body,['paymentStatus'])
        const updatedPayment = await Payment.findOneAndUpdate({transactionId:id}, {$set:{paymentStatus:'Successful'}},{new:true}).populate('bookingId')
        const updatedBooking = await Booking.findOneAndUpdate({_id:updatedPayment.bookingId},{$set:{status:'completed'}},{new:true}).populate('userId caretakerId petparentId');

        // Extracting email and username for CareTaker and PetParent
        const careTakerUser = await User.findById(updatedBooking.caretakerId.userId);
        const petParentUser = await User.findById(updatedBooking.petparentId.userId);

        // Send email to CareTaker
        await paymentCltr.sendMail(
            careTakerUser.email,
            careTakerUser.username,
            'Payment Successful',
            `
                
                <p>Payment for the booking has been successfully processed. Maintain good service for good ratings and good earnings.</p>
                <p>Payment is done by the PetParent : ${petParentUser.username}</p>
                
            `
        );

        // Send email to PetParent
        await paymentCltr.sendMail(
            petParentUser.email,
            petParentUser.username,
            'Payment Successful',
            `
                
                <p>Your payment has been successfully processed. Your pet is in good hands. Thank you for using PetBuddy.</p>
                
            `
        );

        res.json(updatedPayment)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}
paymentCltr.failedUpdate=async(req,res)=>{
    try{
        
        // const body = _.pick(req.body,['paymentStatus'])
        const id = req.params.id;
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: id },
            { $set: { paymentStatus: "Failed" } },
            { new: true }
        ).populate('bookingId')
        const updatedBooking = await Booking.findOneAndUpdate({_id:updatedPayment.bookingId},{$set:{status:'cancelled'}},{new:true}).populate('userId caretakerId petparentId')

        // Extracting email and username for PetParent
        const petParentUser = await User.findById(updatedPayment.userId);

        // Send email to PetParent
        await paymentCltr.sendMail(
            petParentUser.email,
            petParentUser.username,
            'Payment Failed',
            `
               
                <p>We are sorry, but your payment has failed. Please try again later.</p>
                
            `
        );

        res.json(updatedPayment)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}
paymentCltr.sendMail = async (email, username, subject, content) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const html = `
        <h1>${subject}</h1>
        <p>Dear ${username},</p>
        ${content}
        <p>Best Regards,<br />The PetBuddy Team</p>
    `;

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            html: html
        });
        console.log("Email sent", info.response);
    } catch (error) {
        console.log("Error sending email:", error);
    }
};

module.exports = paymentCltr