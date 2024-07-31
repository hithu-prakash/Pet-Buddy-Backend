const {validationResult} = require('express-validator')
const Booking=require('../models/booking-model')
const User = require('../models/user-model')
const CareTaker=require('../models/caretaker-model')
const Pet = require('../models/pet-model')

const bookingCntrl={}

bookingCntrl.create = async (req, res) => {
    try {
        const { caretakerId, petId } = req.params; // Extract parameters from URL
        const parentId = req.user.id; // Extract parent ID from authenticated user
        console.log(parentId)

        // Create a new booking with the body data
        const booking = new Booking({
            ...req.body,
            parentId,        // Set parentId directly
            caretakerId,     // Set caretakerId from URL params
            petId            // Set petId from URL params
        });
        

        // Save the booking to the database
        await booking.save();

        // Populate booking with related details
        const populatedBooking = await Booking.findById(booking._id)
        .populate('userId','username email phoneNumber')
        .populate('petId', 'petName age gender categories breed petPhoto weight vaccinated')
        .populate('parentId', 'parentPhoto address proof')
        .populate({
            path: 'caretakerId',
            select: 'businessName address isVerified bio',
            populate: {
                path: 'serviceCharges',
                select: 'specialityName amount time'
            }
        });
        console.log(populatedBooking)
        res.status(200).json(populatedBooking);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

bookingCntrl.allBookings=async(req,res)=>{
    const booking = await Booking.find().populate('userId',['username', 'email', 'phoneNumber'])
      if(booking){
        return res.status(200).json(booking)
      }
    res.json({error:'No record found'})
}

bookingCntrl.singleBooking=async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty){
        res.status(400).json({errors:array()})
    }
    try{
        const Id = req.params.id
        const booking= await Booking.findById(Id)//.populate('caretakerId', ['address'])
        return res.status(200).json(booking)
    } catch(err){
        console.log(err.message)
        res.status(500).json({errors:'something went wrong'})
    }
}

bookingCntrl.update=async (req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
      const id=req.params.bookingId
      const body=req.body
      console.log(body)
      const response=await Booking.findByIdAndUpdate(req.params.id, body, { new: true })
      console.log(response)
      res.status(200).json(response)
    }catch(err){
         res.status(500).json({error:'Somthing went wrong'})
    }
}

bookingCntrl.acceptedByCaretaker = async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const body= req.body
        const caretakerId  = req.params.caretakerId; // Caretaker ID selected by parent
        console.log(caretakerId)
        const bookingId = req.params.bookingId; // Booking ID
        const response=await Booking.findOneAndUpdate({_id:bookingId,petParent:caretakerId},body,{new:true})
        res.status(200).json(response);
    } catch(err) {
        console.error(err.message);
        res.status(500).json({ errors: "Something went wrong" });
    }
}

bookingCntrl.delete=async(req,res)=>{
    try {
        const response = await CareTaker.findByIdAndDelete(req.params.id).populate('userId','username email phoneNumber')
        if (!response) {
            return res.status(404).send()
        }
        return res.status(200).json(response)
    } catch (errors) {
        console.log(errors.message)
        res.status(500).json({ errors: 'something went wrong' })
    }
}

module.exports=bookingCntrl