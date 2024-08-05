const Payment=require('../models/payment-model')
const Booking =require('../models/booking-model')
const CareTaker=require('../models/caretaker-model')
const Parent = require('../models/petparent-model')
const nodemailer = require('nodemailer')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { validationResult } = require('express-validator')
//const nodeMailer=require('../utility/nodeMailer')
const _= require('lodash')

const paymentCntrl={}

paymentCntrl.pay = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    try{
        const userId = req.user.id;
        //console.log(userId)
        // Extract bookingId from request parameters
        const {id}= req.params;
        console.log('userId:',userId);
        console.log('bookingId:',id)

        // Find the booking record
        const booking = await Booking.findById(id).populate('userId caretakerId petId parentId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        console.log('booking Details:',booking)

        // Extract necessary data from booking
        const { caretakerId, petId, parentId, totalAmount, bookingDurationInHours } = booking;

        
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
            success_url:"http://localhost:3000/success",
            cancel_url: 'http://localhost:3000/failure',
            customer : customer.id
        })

        // Create Payment
        const payment = new Payment({
            userId,
            caretakerId,
            bookingId:id,
            transactionId: session.id,
            paymentType: "card",
            amount: totalAmount,
            paymentStatus: "pending"
        });

        await payment.save();
         // Fetch the newly created payment with populated fields
         const populatedPayment = await Payment.findById(payment._id)
         .populate('userId caretakerId bookingId parentId')
         .exec();

     res.json({
         id: session.id,
         url: session.url,
         payment: populatedPayment
     });
        

    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'})
    }
}


paymentCntrl.successUpdate=async(req,res)=>{
    try{
        const id = req.params.id
        const paymentRecord = await Payment.findOne({transactionId:id})
        if(!paymentRecord){
            return res.status(404).json({error:'record not found'})
        }
        //const body = pick(req.body,['paymentStatus'])
        const updatedPayment = await Payment.findOneAndUpdate({transactionId:id}, {$set:{paymentStatus:'Successful'}},{new:true})
        const updatedOrder = await Booking.findOneAndUpdate({_id:updatedPayment.bookingId},{$set:{status:'completed'}},{new:true})

        // Extracting email and username for CareTaker and PetParent
        const careTakerUser = await User.findById(updatedBooking.caretakerId.userId);
        const petParentUser = await User.findById(updatedBooking.petparentId.userId);

        // Send email to CareTaker
        await paymentCntrl.sendMail(
            careTakerUser.email,
            careTakerUser.username,
            'Payment Successful',
            `
                
                <p>Payment for the booking has been successfully processed. Maintain good service for good ratings and good earnings.</p>
                
            `
        );

        // Send email to PetParent
        await paymentCntrl.sendMail(
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

paymentCntrl.failedUpdate=async(req,res)=>{
    try{
        const id = req.params.id
        const body = _.pick(req.body,['paymentStatus'])
        const updatedPayment = await Payment.findOneAndUpdate({transactionId:id},{$set:{paymentStatus:"Failed"}},{new:true}) 
         // Extracting email and username for PetParent
         const petParentUser = await User.findById(updatedPayment.userId);

         // Send email to PetParent
         await paymentCntrl.sendMail(
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




module.exports=paymentCntrl


// const Payment=require('../models/payment-model')
// const Booking =require('../models/booking-model')
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
// const { validationResult } = require('express-validator')
// const nodeMailer=require('../utility/nodeMailer')
// const _= require('lodash')

// const paymentCntrl={}

// paymentCntrl.pay = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const body = _.pick(req.body,['bookingId','totalAmount'])

//     try {
//         // Create a customer
//         const customer = await stripe.customers.create({
//             name: "Testing",
//             address: {
//                 line1: 'India',
//                 postal_code: '517501',
//                 city: 'Tirupati',
//                 state: 'AP',
//                 country: 'US',
//             },
//         });

//         // Create a session object
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: [{
//                 price_data: {
//                     currency: 'inr',
//                     product_data: {
//                         name: 'Pet Buddy'
//                     },
//                     unit_amount: body.totalAmount  * 100 
//                 },
//                 quantity: 1
//             }],
//             mode: "payment",
//             success_url: "http://localhost:3000/success",
//             cancel_url: "http://localhost:3000/failure",
//             customer: customer.id
//         });

//         // Create Payment
//         const payment = new Payment();
//         payment.bookingId = body.bookingId;
//         payment.transactionId = session.id;
//         payment.amount = Number(body.totalAmount); // Use totalAmount here
//         payment.paymentType = "card";
//         await payment.save();

//         res.json({ id: session.id, url: session.url });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }


// paymentCntrl.successUpdate=async(req,res)=>{
//     try{
//         const id = req.params.id
//         const paymentRecord = await Payment.findOne({transactionId:id})
//         if(!paymentRecord){
//             return res.status(404).json({error:'record not found'})
//         }
//         //const body = pick(req.body,['paymentStatus'])
//         const updatedPayment = await Payment.findOneAndUpdate({transactionId:id}, {$set:{paymentStatus:'Successful'}},{new:true})
//         const updatedOrder = await Booking.findOneAndUpdate({_id:updatedPayment.bookingId},{$set:{status:'completed'}},{new:true})
//         res.json(updatedPayment)
//     }catch(err){
//         console.log(err)
//         res.status(500).json({error:'Internal Server Error'})
//     }
// }

// paymentCntrl.failedUpdate=async(req,res)=>{
//     try{
//         const id = req.params.id
//         const body = _.pick(req.body,['paymentStatus'])
//         const updatedPayment = await Payment.findOneAndUpdate({transactionId:id},{$set:{paymentStatus:"Failed"}},{new:true}) 
//         res.json(updatedPayment)
//     }catch(err){
//         console.log(err)
//         res.status(500).json({error:'Internal Server Error'})
//     }
// }




// module.exports=paymentCntrl