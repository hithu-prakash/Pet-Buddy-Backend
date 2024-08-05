const {validationResult} = require('express-validator')
const Booking=require('../models/booking-model')
const User = require('../models/user-model')
const Parent= require('../models/petparent-model')
const CareTaker=require('../models/caretaker-model')
const Pet = require('../models/pet-model')
const nodemailer = require('nodemailer')

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

        // Extract email of the caretaker from userId
        const caretakerUserId = caretaker.userId._id;
        const caretakerUser = await User.findById(caretakerUserId);
        const caretakerEmail = caretakerUser.email;

        console.log('Caretaker Email:', caretakerEmail);

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
        const populatedBooking = await Booking.findById(newBooking._id).populate('userId', 'username email phoneNumber').populate('caretakerId', 'businessName isVerified address bio photo proof serviceCharges').populate('petId', 'petName age gender category breed petPhoto weigth').populate('parentId', 'address photo proof');
        // Send email to the CareTaker
        await bookingCntrl.sendMail(caretakerEmail, caretakerUser.username, `New booking request`, `
            
             <p>You have received a new booking request. Please review the details below and accept or deny the booking.</p>
            <p>Booking Details:</p>
            <ul>
                <li>Service Name: ${specialityName}</li>
                <li>Start Time: ${startTime}</li>
                <li>End Time: ${endTime}</li>
                <li>Total Amount: ${totalAmount}</li>
                <li>Pet Parent: ${populatedBooking.userId.username}</li>
                <li>Pet Name: ${pet.petName}</li>
                <li>Category: ${pet.category}</li>
            </ul>
            
        `);

        res.status(201).json(populatedBooking);
    } catch (err) {
        console.log(err);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

bookingCntrl.allBookings=async(req,res)=>{
    const booking = await Booking.find().populate('userId', 'username email phoneNumber').populate('caretakerId', 'businessName isVerified address bio photo proof serviceCharges').populate('petId', 'petName age gender category breed petPhoto weigth').populate('parentId', 'userId address photo proof');
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

// bookingCntrl.update=async (req,res)=>{
//     const errors=validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors:errors.array()})
//     }
//     try{
//       const id=req.params.bookingId
//       const body=req.body
//       console.log(body)
//       const response=await Booking.findByIdAndUpdate(req.params.id, body, { new: true })
//       console.log(response)
//       res.status(200).json(response)
//     }catch(err){
//          res.status(500).json({error:'Somthing went wrong'})
//     }
// }

// bookingCntrl.acceptedByCaretaker = async(req,res)=>{
//     const errors=validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors:errors.array()})
//     }
//     try{
//         const body= req.body
//         const caretakerId  = req.caretakerId; // Caretaker ID selected by parent
//         console.log(caretakerId)
//         const bookingId = req.params.bookingId; // Booking ID
//         const response=await Booking.findOneAndUpdate({_id:bookingId,petParent:caretakerId},body,{new:true})
//         res.status(200).json(response);
//     } catch(err) {
//         console.error(err.message);
//         res.status(500).json({ errors: "Something went wrong" });
//     }
// }

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

bookingCntrl.sendMail = async (email, username, subject, content) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD
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
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: subject,
            html: html
        });
        console.log("Email sent", info.response);
    } catch (error) {
        console.log("Error sending email:", error);
    }
};

bookingCntrl.acceptBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id; // Assuming the caretaker's ID is available in req.user.id
        console.log('userId:',userId)

        const careTaker = await CareTaker.findOne({userId})
        if (!careTaker) {
            return res.status(404).json({ errors: 'Caretaker not found' });
        }
        console.log('caretaker',careTaker)
        console.log('careTakerId',careTaker._id)

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ errors: 'Booking not found' });
        }

        if (booking.caretakerId.toString() !== careTaker._id.toString()) {
            return res.status(403).json({ errors: 'You are not authorized to accept this booking' });
        }

        booking.Accepted = true;
        await booking.save();

        const populateBooking = await Booking.findById(booking._id).populate('userId', 'username email phoneNumber').populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges').populate('petId', 'petName age gender category breed petPhoto weigth').populate('petparentId', 'userId address photo proof');
        
        // Find the userId of the pet parent who booked and extract the email
        const petParentUserId = populateBooking.petparentId.userId;
        const petParentUser = await User.findById(petParentUserId);
        const petParentEmail = petParentUser.email;

        console.log('PetParent Email:', petParentEmail);

         // Send email to the PetParent
         await bookingCltr.sendMail(petParentEmail, petParentUser.username, `Booking Accepted`, `
         
         
         <p>Your booking request has been accepted. Please proceed with the payment process.</p>
         <p>Booking accepted by: ${careTaker.careTakerBusinessName}</p>
         
     `);

        res.status(200).json(populateBooking);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'something went wrong' });
    }
};

bookingCntrl.parentbooklist = async (req, res) => {
    try {
        const userIds = req.user.id; // Assuming the pet parent's ID is available in req.user.id
        console.log('user:',userIds)
        const bookings = await Booking.find({ userId: userIds })
            .populate('userId', 'username email phoneNumber')
            .populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges')
            .populate('petId', 'petName age gender category breed petPhoto weight')
            .populate('petparentId', 'address photo proof');


        res.status(200).json(bookings);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

bookingCntrl.denyBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id; // Assuming the caretaker's ID is available in req.user.id

        const careTaker = await CareTaker.findOne({ userId });
        if (!careTaker) {
            return res.status(404).json({ errors: 'Caretaker not found' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ errors: 'Booking not found' });
        }

        if (booking.caretakerId.toString() !== careTaker._id.toString()) {
            return res.status(403).json({ errors: 'You are not authorized to deny this booking' });
        }

        booking.Accepted = false;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'username email phoneNumber')
            .populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges')
            .populate('petId', 'petName age gender category breed petPhoto weight')
            .populate('petparentId', 'userId address photo proof');

        // Find the userId of the pet parent who booked and extract the email
        const petParentUserId = populatedBooking.parentId.userId;
        const petParentUser = await User.findById(petParentUserId);
        const petParentEmail = petParentUser.email;

        // Send denial email to the PetParent
        await bookingCntrl.sendMail(petParentEmail, petParentUser.username, `Booking Denied`, `
            
           
            <p>Unfortunately, your booking request has been denied. Please change the time slot or try with a different caretaker.</p>
           
        `);

        res.status(200).json(populatedBooking);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'something went wrong' });
    }
};

bookingCntrl.allCareTakerBooking = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming the caretaker's ID is available in req.user.id
        const caretaker = await CareTaker.findOne({ userId });
        console.log('user:',userId)

        if (!caretaker) {
            return res.status(404).json({ errors: 'Caretaker not found' });
        }

        const acceptedBookings = await Booking.find({ caretakerId: caretaker._id})
            .populate('userId', 'username email phoneNumber')
            .populate('caretakerId', 'careTakerBusinessName address')
            .populate('petId', 'petName age gender category breed petPhoto weight')
            .populate('petparentId', 'address photo proof');

        res.status(200).json(acceptedBookings);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

bookingCntrl.parentbooklist = async (req, res) => {
    try {
        const userIds = req.user.id; // Assuming the pet parent's ID is available in req.user.id
        console.log('user:',userIds)
        const bookings = await Booking.find({ userId: userIds })
            .populate('userId', 'username email phoneNumber')
            .populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges')
            .populate('petId', 'petName age gender category breed petPhoto weight')
            .populate('petparentId', 'address photo proof');
            

        res.status(200).json(bookings);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

module.exports=bookingCntrl