const Payment=require('../models/payment-model')
const Booking =require('../models/booking-model')
const CareTaker=require('../models/caretaker-model')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { validationResult } = require('express-validator')
//const nodeMailer=require('../utility/nodeMailer')
const _= require('lodash')

const paymentCntrl={}

paymentCntrl.pay = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

       const body = _.pick(req.body, ['bookingId','caretakerId','userId', 'serviceName']);
//console.log(body)
    try {
        // Fetch the booking to get careTakerId
        const booking = await Booking.findById(body.bookingId).populate('caretakerId');
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        console.log('Booking:', booking);
        // console.log(careTakerId)

        const careTakerId = booking.caretakerId._id;
        console.log('CareTaker ID:', careTakerId);
        const careTaker = await CareTaker.findById(booking.caretakerId);
        if (!careTaker) {
            return res.status(404).json({ error: 'CareTaker not found' });
        }
        console.log(careTaker)
        console.log('CareTaker ID:', booking.caretakerId);

        // Find the service charge for the given serviceName
        const serviceCharge = careTaker.serviceCharges.find(service => service.specialityName === body.serviceName);
        if (!serviceCharge) {
            return res.status(404).json({ error: 'Service charge not found' });
        }

        const amount = serviceCharge.amount;
       
        

        // Create a customer
        const customer = await stripe.customers.create({
            name: "Testing",
            address: {
                line1: 'India',
                postal_code: '517501',
                city: 'Tirupati',
                state: 'AP',
                country: 'US',
            },
        });

        // Create a session object
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'Pet Buddy'
                    },
                    unit_amount: amount * 100 
                },
                quantity: 1
            }],
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/failure",
            customer: customer.id
        });

        // Create Payment
        const payment = new Payment({
            bookingId: body.bookingId,
            transactionId: session.id,
            amount: amount, // Use the amount from serviceCharge
            paymentType: "card"
        });
        await payment.save();

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
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