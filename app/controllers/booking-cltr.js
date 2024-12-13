const Booking = require('../models/booking-model');
const User = require('../models/user-model')
const CareTaker = require('../models/careTaker-model')
const Pet = require('../models/pet-model')
const PetParent = require('../models/petParent-model')
const nodemailer = require('nodemailer')
const { validationResult } = require('express-validator');
const cron = require('node-cron')

const bookingCltr = {};

bookingCltr.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const userId = req.user.id;
        const { caretakerId } = req.params;
        const { serviceName , date } = req.body;

        console.log('serviceName :',serviceName);
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
        if (!pet) {
            return res.status(404).json({ errors: [{ msg: 'Pet not found' }] });
        }
        const petParent = await PetParent.findById(pet.petParentId);
        if (!petParent) {
            return res.status(404).json({ errors: [{ msg: 'PetParent not found' }] });
        }

        // Find the service charge based on the serviceName
        const serviceCharge = caretaker.serviceCharges.find(charge => charge.name === serviceName);
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
            petparentId: petParent._id,
            date,
            totalAmount: totalAmount,
            serviceName: serviceName,
            status:"pending",
            bookingDurationInHours: bookingDurationInHours,
            category,
            createdAt: new Date()
        });

        await newBooking.save();
        const populatedBooking = await Booking.findById(newBooking._id).populate('userId', 'username email phoneNumber').populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges').populate('petId', 'petName age gender category breed petPhoto weigth').populate('petparentId', 'address photo proof');
        
        // Send email to the CareTaker
        await bookingCltr.sendMail(caretakerEmail, caretakerUser.username, `New booking request`, `
            
            <p>You have received a new booking request. Please review the details below and accept or deny the booking.</p>
            <p>Booking Details:</p>
            <ul>
                <li>Service Name: ${serviceName}</li>
                <li>Start Time: ${startTime}</li>
                <li>End Time: ${endTime}</li>
                <li>Total Amount: ${totalAmount}</li>
                <li>Pet Parent: ${populatedBooking.userId.username}</li>
                <li>Pet Name: ${pet.petName}</li>
                <li>Category: ${pet.category}</li>
            </ul>
            
        `);

        // Set up a cron job to check the status of the booking every hour
        cron.schedule('0 * * * *', async () => {
            const booking = await Booking.findById(newBooking._id);

            if (booking.status === 'pending' && (new Date() - booking.createdAt) >= 10 * 60 * 60 * 1000) {
                // Reject the booking after 10 hours
                booking.status = 'cancelled';
                booking.Accepted = false;
                await booking.save();

                // Notify the PetParent
                const petParentUser = await User.findById(booking.petparentId.userId);
                await bookingCltr.sendMail(petParentUser.email, petParentUser.username, `Booking Rejected`, `
                    <p>Sorry for the inconvenience, your booking has been rejected. Please select another CareTaker. Thanks for using PetBuddy.</p>
                `);
            } else if (booking.status === 'pending') {
                // Send reminder email every hour
                await bookingCltr.sendMail(caretakerEmail, caretakerUser.username, `Reminder: Pending Booking`, `
                    <p>This is a reminder to review the pending booking request.</p>
                    <p>Booking Details:</p>
                    <ul>
                        <li>Service Name: ${serviceName}</li>
                        <li>Start Time: ${startTime}</li>
                        <li>End Time: ${endTime}</li>
                        <li>Total Amount: ${totalAmount}</li>
                    </ul>
                `);
            }
        });



        res.status(201).json(populatedBooking);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

bookingCltr.showall = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('userId', 'username email phoneNumber').populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges').populate('petId', 'petName age gender category breed petPhoto weigth').populate('petparentId', 'address photo proof');
        res.status(200).json(bookings);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'something went wrong' });
    }
};

bookingCltr.showone = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('userId', 'username email phoneNumber').populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges').populate('petId', 'petName age gender category breed petPhoto weigth').populate('petparentId', 'address photo proof');
            
        if (!booking) {
            return res.status(404).json({ errors: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'something went wrong' });
    }
};
bookingCltr.single = async (req,res) =>{
    // const body = req.body
    try{
        console.log('User ID:', req.user.id);
        const booking = await Booking.findOne({ userId: req.user.id }).populate('userId', 'username email phoneNumber').populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges').populate('petId', 'petName age gender category breed petPhoto weigth').populate('petparentId', 'address photo proof');
            
        if (!booking) {
            return res.status(404).json({ errors: 'Booking not found' });
        }
        res.status(200).json(booking);

    }catch(err){
        console.log(err.message);
        res.status(500).json({ errors: 'something went wrong' });
    }
}

//delete is not done in front end
bookingCltr.deleteone = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ errors: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'something went wrong' });
    }
};
bookingCltr.acceptBooking = async (req, res) => {
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
        booking.status = "confirmed"

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

bookingCltr.denyBooking = async (req, res) => {
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
        booking.status = "cancelled"

        booking.Accepted = false;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'username email phoneNumber')
            .populate('caretakerId', 'careTakerBusinessName verifiedByAdmin address bio photo proof serviceCharges')
            .populate('petId', 'petName age gender category breed petPhoto weight')
            .populate('petparentId', 'userId address photo proof');

        // Find the userId of the pet parent who booked and extract the email
        const petParentUserId = populatedBooking.petparentId.userId;
        const petParentUser = await User.findById(petParentUserId);
        const petParentEmail = petParentUser.email;

        // Send denial email to the PetParent
        await bookingCltr.sendMail(petParentEmail, petParentUser.username, `Booking Denied`, `
            
           
            <p>Unfortunately, your booking request has been denied. Please change the time slot or try with a different caretaker.</p>
           
        `);

        res.status(200).json(populatedBooking);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'something went wrong' });
    }
};

bookingCltr.allCareTakerBooking = async (req, res) => {
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
bookingCltr.sendMail = async (email, username, subject, content) => {
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
bookingCltr.parentbooklist = async (req, res) => {
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
bookingCltr.completedBookingsCount = async (req, res) => {
    try {
        const caretakers = await CareTaker.find();
        
        const counts = await Promise.all(caretakers.map(async (caretaker) => {
            const count = await Booking.countDocuments({
                caretakerId: caretaker._id,
                status: 'completed'
            });
            return {
                caretakerId: caretaker._id,
                careTakerBusinessName: caretaker.careTakerBusinessName,
                completedBookings: count
            };
        }));

        res.status(200).json(counts);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};


module.exports = bookingCltr;



