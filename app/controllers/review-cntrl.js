const Review = require('../models/review-model');
const { validationResult } = require('express-validator');

const reviewCntrl = {};

// Create a new review
reviewCntrl.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const body = req.body;
        body.userId = req.user.id; // Assuming user ID is available in req.user

        const review = new Review(body);
        await review.save();
        
        const populatedReview = await Review.findById(review._id)
            .populate('userId', 'username email')
            .populate({
                path: 'caretakerId',
                populate: {
                    path: 'userId',
                    select: 'username email'
                }
            })
            .populate('bookingId', 'category');
        
        res.status(201).json(populatedReview);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
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
        
        res.status(200).json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Retrieve reviews by caretaker ID
reviewCntrl.getByCaretaker = async (req, res) => {
    const { caretakerId } = req.params;
    try {
        const reviews = await Review.find({ caretakerId })
            .populate('userId', 'username email')
            .populate('caretakerId', 'name')
            .populate('bookingId', 'startTime endTime');
        
        res.status(200).json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

// Update a review
reviewCntrl.update = async (req, res) => {
    const { reviewId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const body = req.body;
        const review = await Review.findByIdAndUpdate(reviewId, body, { new: true })
            .populate('userId', 'username email')
            .populate('caretakerId', 'name')
            .populate('bookingId', 'startTime endTime');
        
        if (!review) {
            return res.status(404).json({ errors: 'Review not found' });
        }
        
        res.status(200).json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};

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