const {validationResult} = require('express-validator')
const Booking=require('../models/booking-model')
const User = require('../models/user-model')
const CareTaker=require('../models/caretaker-model')

const bookingCntrl={}

bookingCntrl.create=async(req,res)=>{
    const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.json({errors:errors.array()})
        }
       
        // try{
        //     const body=req.body
        //     const Id=req.params.caretakerId
        //     console.log(Id)
        //     const booking = new Booking(body)
        //     booking.parentId = req.user.id;
        //     booking.caretakerId = Id;
        //     await booking.save()
        //     const populateBooking = await Booking.findById(booking._id).populate('userId',['username email phoneNumber'])
        //     res.status(200).json(populateBooking)
        // } catch(err) {
        //     console.log(err.message)
        //     res.status(500).json({errors:"something went wrong"})
        // }
        // try {
        //     const body = req.body;
        //     const caretakerId = req.params.caretakerId; // Caretaker ID selected by parent
        //     const parentId = req.user.id; // Parent ID making the booking
        
        //     const { petId } = body
        //     const booking = new Booking(body);
            
        //     // Set the parent ID and caretaker ID for the booking
        //     booking.parentId = parentId;
        //     booking.caretakerId = caretakerId;
        //     booking.petId = petId
        
        //     // Save the booking to the database
        //     await booking.save();
            
        //     // Populate booking with parent, caretaker, and pet details
        //     const populatedBooking = await Booking.findById(booking._id).populate('petId', 'name'); 
        
        //         // .populate('userId', 'username', 'email', 'phoneNumber')//.populate('caretakerId', ['username', 'email', 'phoneNumber']) 
        //         //.populate('petId', ['name', 'species']); 
        
        //     // Respond with the populated booking information
        //     res.status(200).json(populatedBooking);
        // } 
        
        try {
            const body = req.body;
            body.userId = req.user.id;
            const caretakerId = req.params.id; 
            // const parentId = req.user.id; 
            // console.log("parentid:",parentId)
            console.log("careTaker:",caretakerId)
    
            const caretaker = await CareTaker.findById(caretakerId);
            console.log("careTaker:",caretaker)
            if (!caretaker) {
                return res.status(404).json({ errors: 'Caretaker not found' });
            }
            const petParentId = body.parentId;
            const petId = body.petId;
            console.log("petId",petId)
            const booking = new Booking(body);
            // booking.parentId = parentId;
            booking.caretakerId = caretaker;
            booking.parentId = petParentId;
            // console.log("PETPARENT:",petParentId)
            booking.petId = petId;
            // console.log("PetId",petId)
            await booking.save();
            const populateBooking = await Booking.findById(booking._id)
                .populate('userId', 'username email phoneNumber role')
                .populate('caretakerId', 'userId BusinessName bio address serviceCharges')
                .populate('petId', 'petName breed ')
               .populate('parentId', 'address phoneNumber');
            res.status(201).json(populateBooking);
        } catch(err) {
            console.error(err.message);
            res.status(500).json({ errors: "Something went wrong" });
        }
    
}

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