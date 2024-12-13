const Review = require('../models/review-model');
const { validationResult } = require('express-validator');
const Booking = require('../models/booking-model');
const _ = require('lodash')
const nodemailer = require('nodemailer')
const CareTaker = require('../models/careTaker-model')
const Pet = require('../models/pet-model')
const PetParent = require('../models/petParent-model')
const {uploadToCloudinary}  = require('../utility/cloudinary')

const reviewCltr = {};
reviewCltr.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const bookingId = req.params.bookingId;
        const { ratings, description } = req.body;
        const userId = req.user.id;

        // Check if the user has already reviewed this booking
        const existingReview = await Review.findOne({ bookingId, userId });
        if (existingReview) {
            return res.status(403).json('You have already given a review for this booking');
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const caretakerId = booking.caretakerId;
        const petId = booking.petId; // Ensure this field exists in Booking
        const petparentId = booking.petparentId; // Ensure this field exists in Booking

        // Calculate new average rating for the caretaker
        const noOfReviews = await Review.countDocuments({ caretakerId });
        const caretaker = await CareTaker.findById(caretakerId);
        if (!caretaker) {
            return res.status(404).json({ error: 'Caretaker not found' });
        }
        const prevRating = caretaker.rating || 0;
        const newRating = (prevRating * noOfReviews + ratings) / (noOfReviews + 1);
        caretaker.rating = newRating;

        // Save caretaker and review
        await caretaker.save();

        const review = new Review({
            userId,
            caretakerId,
            petId,
            petparentId,
            bookingId,
            ratings,
            description
        });

        if (req.file) {
            console.log('Photo file received:', req.file);

            const photoOptions = {
                folder: 'Pet-Buddy-PetParent/review',
                quality: 'auto',
            };

            // Upload photo to Cloudinary
            const photoResult = await uploadToCloudinary(req.file.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            console.log('Uploaded photo URL:', photoResult.secure_url);

            // Assign the uploaded photo URL to the review
            review.photos = photoResult.secure_url;
        } else {
            console.log('No photo file received');
        }

        await review.save();

        // Update booking to indicate that a review has been made
        await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { isReview: true } },
            { new: true }
        );

        res.status(201).json(review);
    } catch (err) {
        console.log('Error creating review:', err);
        res.status(500).json({ errors: "Internal server error" });
    }
};


// Retrieve all reviews
reviewCltr.getAll = async (req, res) => {
    
    try {
        const reviews = await Review.find()
        .populate('userId', 'username email phoneNumber')
        .populate('caretakerId', 'careTakerBusinessName isVerified address bio photo proof serviceCharges')
        .populate('petId', 'petName age gender categories breed petPhoto weight vaccinated')
        .populate('petparentId', 'address parentPhoto proof')
        .populate('bookingId','startTime endTime bookingDurationInHours status totalAmount Accepted')
        .sort({'ratings':-1});
        console.log('rev',reviews)

            res.status(201).json(reviews);
      
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

reviewCltr.getReviewById = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const review = await Review.findById(reviewId).populate('userId', 'username email phoneNumber')
            .populate('caretakerId', 'careTakerBusinessName isVerified address bio photo proof serviceCharges')
            .populate('petId', 'petName age gender categories breed petPhoto weight vaccinated')
            .populate('petparentId', 'address parentPhoto proof')
            .populate('bookingId', 'startTime endTime bookingDurationInHours status totalAmount Accepted');

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.status(200).json(review);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching review', error });
    }
  };

// Retrieve reviews by caretaker ID
reviewCltr.getByCaretaker = async (req, res) => {
    const { caretakerId } = req.params;
    try {
        const reviews = await Review.find({ caretakerId })
            .populate('userId', 'username email phoneNumber')
            .populate('caretakerId', 'careTakerBusinessName isVerified address bio photo proof serviceCharges')
            .populate('petId', 'petName age gender categories breed petPhoto weight vaccinated')
            .populate('petparentId', 'address parentPhoto proof')
            .populate('bookingId', 'startTime endTime bookingDurationInHours status totalAmount Accepted');

        const reviewCount = reviews.length;

        res.status(200).json({ reviewCount, reviews });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};




// Update a review

reviewCltr.update = async (req, res) => {
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { reviewId } = req.params; // Corrected to reviewId
        const { ratings, description } = req.body;
        const userId = req.user.id;
    
        try {
            // Check if the review exists and belongs to the user
            const existingReview = await Review.findOne({ _id: reviewId, userId });
            if (!existingReview) {
                return res.status(403).json('Review not found or you are not authorized to update this review');
            }
    
            // Check if booking exists and fetch necessary details
            const booking = await Booking.findById(existingReview.bookingId);
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
    
            const { caretakerId, petId, parentId } = booking;
    
            // Calculate new average rating for the caretaker
            const noOfReviews = await Review.countDocuments({ caretakerId });
            const caretaker = await CareTaker.findById(caretakerId);
            if (!caretaker) {
                return res.status(404).json({ error: 'Caretaker not found' });
            }
    
            const prevRating = caretaker.rating || 0;
            const newRating = (prevRating * noOfReviews + ratings) / (noOfReviews + 1);
            caretaker.rating = newRating;
            await caretaker.save();
    
            // Update review details
            existingReview.ratings = ratings;
            existingReview.description = description;
    
            if (req.file) {
                const photoOptions = {
                    folder: 'Pet-Buddy-PetParent/review',
                    quality: 'auto',
                };
    
                // Upload photo to Cloudinary
                const photoResult = await uploadToCloudinary(req.file.buffer, photoOptions);
                existingReview.photos = photoResult.secure_url;
            }
    
            const updatedReview = await existingReview.save();
            const populatedReview = await Review.findById(updatedReview._id)
            .populate('userId', 'username email phoneNumber')
            .populate('caretakerId', 'businessName isVerified address bio photo proof serviceCharges')
            .populate('petId', 'petName age gender categories breed petPhoto weight vaccinated')
            .populate('petparentId', 'address parentPhoto proof')
            .populate('bookingId', 'startTime endTime bookingDurationInHours status totalAmount Accepted');

            // Update booking to indicate that a review has been updated
            await Booking.findByIdAndUpdate(
                booking._id,
                { $set: { isReview: true } },
                { new: true }
            );
    
            res.status(200).json(populatedReview);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ errors: 'Something went wrong' });
        }
    };


// Delete a review
reviewCltr.delete = async (req, res) => {
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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
/*
// Controller function to get caretaker ratings
reviewCltr.getCaretakerRatings = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Fetch booking to get the caretakerId
        const booking = await Booking.findById(bookingId).populate('caretakerId').populate('petparentId').populate('userId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
          
        const caretakerId = booking.caretakerId._id;

        // Fetch reviews for the specified caretaker
        const reviews = await Review.find({ caretakerId })
            .populate({
                path: 'userId', // Assuming the review schema has a userId reference
                select: 'username' // Select only the fields needed from the user document
            })
            .populate({
                path: 'petId', // Assuming the review schema has a petId reference
                select: 'petName' // Select only the fields needed from the pet document
            });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this caretaker' });
        }

        // Calculate total and average rating
        const totalRatingSum = reviews.reduce((acc, review) => acc + review.ratings, 0);
        const averageRating = totalRatingSum / reviews.length;

        // Format the average rating to one decimal place
        const formattedAverageRating = averageRating.toFixed(1);

        // Fetch the caretaker details
        const caretaker = await CareTaker.findById(caretakerId).populate('userId');
        if (!caretaker) {
            return res.status(404).json({ message: 'Caretaker not found' });
        }

        // Prepare the response data
        const responseData = {
            careTakerBusinessName: caretaker.careTakerBusinessName,
            totalRating: formattedAverageRating,
            numberOfRatings: reviews.length,
            reviews: reviews.map(review => ({
                petParentUsername: review.userId.username,
                petName: review.petId.petName,
                description: review.description,
                rating:review.ratings,
                photo: review.photos // Assuming `photos` is a field in the review schema
            }))
        };

        // Check if the average rating is below the threshold and include warning information
        if (averageRating < 1.5) {
            responseData.showWarning = true;
        }

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
*/

reviewCltr.getCaretakerRatings = async (req, res) => {
    try {
        const { caretakerId } = req.params;

        // Fetch reviews for the specified caretaker
        const reviews = await Review.find({ caretakerId })
            .populate({
                path: 'userId', // Assuming the review schema has a userId reference
                select: 'username' // Select only the fields needed from the user document
            })
            .populate({
                path: 'petId', // Assuming the review schema has a petId reference
                select: 'petName' // Select only the fields needed from the pet document
            });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this caretaker' });
        }

        // Calculate total and average rating
        const totalRatingSum = reviews.reduce((acc, review) => acc + review.ratings, 0);
        const averageRating = totalRatingSum / reviews.length;

        // Format the average rating to one decimal place
        const formattedAverageRating = averageRating.toFixed(1);

        // Fetch the caretaker details
        const caretaker = await CareTaker.findById(caretakerId).populate('userId');
        if (!caretaker) {
            return res.status(404).json({ message: 'Caretaker not found' });
        }

        // Fetch bookings related to this caretaker to get userId and petparentId
        const bookings = await Booking.find({ caretakerId })
            .populate('petparentId')
            .populate('userId');

        // Prepare the response data
        const responseData = {
            careTakerBusinessName: caretaker.careTakerBusinessName,
            totalRating: formattedAverageRating,
            numberOfRatings: reviews.length,
            reviews: reviews.map(review => {
                // Find the corresponding booking to get the petParentUsername and petName
                const booking = bookings.find(booking => booking._id.equals(review.bookingId));
                return {
                    petParentUsername: booking ? booking.userId.username : 'Unknown',
                    petName: review.petId.petName,
                    description: review.description,
                    rating: review.ratings,
                    photo: review.photos // Assuming `photos` is a field in the review schema
                };
            })
        };

        // Check if the average rating is below the threshold and include warning information
        if (averageRating < 1.5) {
            responseData.showWarning = true;
        }

        res.json(responseData);
    } catch (error) {
        console.error('Error in getCaretakerRatings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
/*
reviewCltr.totalCareRate = async (req, res) => {
    try {
      const caretakers = await CareTaker.find();
      console.log("Caretakers:", caretakers);
  
      const ratings = await Promise.all(
        caretakers.map(async (caretaker) => {
          const reviews = await Review.find({ caretaker: caretaker._id });
          console.log(`Reviews for caretaker ${caretaker._id}:`, reviews);
          
          const totalRatingSum = reviews.reduce((acc, review) => acc + Number(review.ratings), 0); // Ensure ratings are numbers
          const averageRating = reviews.length > 0 ? (totalRatingSum / reviews.length) : 0;
          const formattedAverageRating = averageRating.toFixed(1);
  
          return {
            caretakerId: caretaker._id,
            totalRating: formattedAverageRating,
            numberOfRatings: reviews.length,
          };
        })
      );
  
      console.log("Ratings Data:", ratings);
  
      const ratingsData = ratings.reduce((acc, rating) => {
        acc[rating.caretakerId] = {
          totalRating: rating.totalRating,
          numberOfRatings: rating.numberOfRatings,
        };
        return acc;
      }, {});
  
      res.status(200).json(ratingsData);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: 'Something went wrong' });
    }
  };
  
  
*/

reviewCltr.sendWarningEmail = async (req, res) => {
    try {
        const { caretakerId } = req.params;

        // Fetch the caretaker details
        const caretaker = await CareTaker.findById(caretakerId).populate('userId');

        if (!caretaker) {
            return res.status(404).json({ message: 'CareTaker not found' });
        }

        // Prepare the warning email content
        const warningContent = `
            <h1>Warning: Low Rating</h1>
            <p>Dear ${caretaker.businessName},</p>
            <p>Your average rating is below the acceptable threshold of 1.5. Please address the issues to improve your rating.</p>
            <p>Best regards,<br />Pet-Buddy Admin</p>
        `;

        // Send the warning email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: caretaker.userId.email,
            subject: 'Warning: Low Rating',
            html: warningContent
        });

        res.json({ message: 'Warning email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = reviewCltr;
