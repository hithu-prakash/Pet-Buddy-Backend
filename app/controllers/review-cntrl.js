const Review = require('../models/review-model');
const { validationResult } = require('express-validator');
const Booking=require('../models/booking-model')
const _ = require('lodash')
const CareTaker=require('../models/caretaker-model')
const uploadToCloudinary  = require('../utility/cloudinary')

const reviewCntrl = {};

// Create a new review
reviewCntrl.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const bookingId = req.params.id; 
        const body = _.pick(req.body, ["ratings", "description"]);
        const userId = req.user.id; 

        // Check if the user has already reviewed this booking
        const existingReview = await Review.findOne({ bookingId, userId });
        if (existingReview) {
            return res.status(403).json('You have already given a review for this booking');
        }

        
        const review = new Review(body);
        review.bookingId = bookingId;
        review.userId = userId;

        if (req.file) {
            console.log('Photo file received:', req.file);

            const photoOptions = {
                folder: 'Pet-Buddy-PetParent/review',
                quality: 'auto',
            };

           
            const photoResult = await uploadToCloudinary(req.file.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            console.log('Uploaded photo URL:', photoResult.secure_url);

           
            review.photos = photoResult.secure_url;
        } else {
            console.log('No photo file received');
        }

        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const caretakerId = booking.caretakerId;

        // Calculate new average rating for the caretaker
        const noOfReviews = await Review.countDocuments({ caretakerId });
        const caretaker = await CareTaker.findById(caretakerId);
        if (!caretaker) {
            return res.status(404).json({ error: 'Caretaker not found' });
        }
        const prevRating = caretaker.rating || 0;
        const newRating = (prevRating * noOfReviews + body.ratings) / (noOfReviews + 1);
        caretaker.rating = newRating;

        // Save caretaker and review
        await caretaker.save();
        review.caretakerId = caretakerId; // Assign caretakerId to the review
        await review.save();

        // Update booking to indicate that a review has been made
        await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { isReview: true } }, // Update the isReview field
            { new: true } // Return the updated booking
        );

        res.status(201).json(review);
    } catch (err) {
        console.error('Error creating review:', err);
        res.status(500).json({ errors: "Internal server error" });
    }
};




// Retrieve all reviews
reviewCntrl.getAll = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'username email')
            .populate('caretakerId', 'name')
            .populate('bookingId', 'startTime endTime')
            .sort({ rating: -1 });

            res.status(201).json(reviews);
      
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Retrieve reviews by caretaker ID
reviewCntrl.getByCaretaker = async (req, res) => {
    const { caretakerId } = req.params;
    try {
        const reviews = await Review.findbyId({ caretakerId })
            .populate('userId', 'username email')
            .populate('caretakerId', 'businessName')
            .populate('bookingId', 'startTime endTime');

        res.status(200).json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Update a review
// reviewCntrl.update = async (req, res) => {
//     const { reviewId } = req.params;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//         const body = req.body;
//         const review = await Review.findByIdAndUpdate(reviewId, body, { new: true })
//             .populate('userId', 'username email')
//             .populate('caretakerId', 'name')
//             .populate('bookingId', 'startTime endTime');
        
//         if (!review) {
//             return res.status(404).json({ errors: 'Review not found' });
//         }
        
//         res.status(200).json(review);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ errors: 'Something went wrong' });
//     }
// };

// Delete a review
reviewCntrl.delete = async (req, res) => {
    const { reviewId } = req.params;
    try {
        const review = await Review.findByIdAndDelete(reviewId)
            .populate('userId', 'username email')
            .populate('caretakerId', 'name')
            .populate('bookingId', 'startTime endTime');
        
        if (!review) {
            return res.status(404).json({ errors: 'Review not found' });
        }
        
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

module.exports = reviewCntrl;