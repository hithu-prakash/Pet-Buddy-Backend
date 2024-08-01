const {validationResult} = require('express-validator')
const Booking=require('../models/booking-model')
const User = require('../models/user-model')
const Parent= require('../models/petparent-model')
const CareTaker=require('../models/caretaker-model')
const Pet = require('../models/pet-model')

const bookingCntrl={}

bookingCntrl.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.user.id;
        const { caretakerId } = req.params;
        const { specialityName , date } = req.body;

        console.log('serviceName :',specialityName);
        console.log('received CareTakerId : ',caretakerId);

        // Fetch CareTaker details
        const caretaker = await CareTaker.findById(caretakerId);
        if (!caretaker) {
            return res.status(404).json({ errors: [{ msg: 'Caretaker not found' }] });
        }

        // Fetch Pet and PetParent details
        const pet = await Pet.findOne({ userId });
        console.log('pet',pet)
        if (!pet) {
            return res.status(404).json({ errors: [{ msg: 'Pet not found' }] });
        }
        const petParent = await Parent.findOne({userId});
        console.log(petParent)
        if (!petParent) {
            return res.status(404).json({ errors: [{ msg: 'PetParent not found' }] });
        }

        // Find the service charge based on the serviceName
        const serviceCharge = caretaker.serviceCharges.find(charge => charge.specialityName === specialityName);
        if (!serviceCharge) {
            return res.status(400).json({ errors: 'Invalid service name.' });
        }

        // Calculate the hourly rate
        const hourlyRate = serviceCharge.amount / serviceCharge.time;
        console.log('hourlyRate : ',hourlyRate)
        // Calculate the total booking time in hours
        const startTime = new Date(date.startTime);
        const endTime = new Date(date.endTime);
        const bookingDurationInHours = (endTime - startTime) / (1000 * 60 * 60);
        console.log('bookingDuration : ',bookingDurationInHours)
        // Calculate the total amount based on the booking duration
        const totalAmount = hourlyRate * bookingDurationInHours;
        const category = pet.category;

        const newBooking = new Booking({
            userId,
            caretakerId,
            petId: pet._id,
            parentId: petParent._id,
            date,
            totalAmount: totalAmount,
            specialityName: specialityName,
            status:"pending",
            bookingDurationInHours: bookingDurationInHours,
            category
        });

        await newBooking.save();
        const populatedBooking = await Booking.findById(newBooking._id).populate('userId', 'username email phoneNumber').populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges').populate('petId', 'petName age gender category breed petPhoto weigth').populate('parentId', 'address photo proof');

        res.status(201).json(populatedBooking);
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
        const caretakerId  = req.caretakerId; // Caretaker ID selected by parent
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