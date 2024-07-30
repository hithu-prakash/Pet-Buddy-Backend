const {validationResult} = require("express-validator")
const Pet = require('../models/pet-model')
const _ = require("lodash")
const uploadToCloudinary = require('../utility/cloudinary')

petCntrl={}

petCntrl.create = async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }

    try {
        const body = req.body;
        body.userId = req.user.id;
        body.medication = JSON.parse(body.medication);
        body.reminders = JSON.parse(body.reminders);

        // Handle file upload
        if (req.file) {
            console.log('File received:', req.file);
            const photoOptions = {
                folder: 'Pet-Buddy-CareTaker/Pet',
                quality: 'auto',
            };
            const photoResult = await uploadToCloudinary(req.file.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            body.petPhoto = photoResult.secure_url;
        }

        // Create new pet with medication and reminders as arrays
        const newPet = new Pet(body);
        await newPet.save();
        console.log(newPet);

        // Populate userId details
        const populateBooking = await Pet.findById(newPet._id).populate('userId', 'username email phoneNumber');
        return res.json(populateBooking);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Internal error' });
    }
};


petCntrl.showAll=async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty){
        res.status(400).json({errors:array()})
    }
   // const body = req.body
    try{ 
        const pets = await Pet.find().populate('userId', 'username email phoneNumber role');
       return res.status(200).json(pets)
     }catch(err){
       res.status(500).json({error:'something went wrong'})
   
     }
}

petCntrl.singelPet=async(req,res)=>{
    try {
        // Log the user ID to ensure it is being passed correctly
        console.log('User ID:', req.user.id);

        // Fetch the parent record
        const pet = await Pet.findOne({ userId: req.user.id }).populate('userId', 'email username phoneNumber');

        // Log the fetched pet parent record for debugging
        console.log('Fetched Pet Parent:', pet);

        if (!pet) {
            return res.status(404).json({ error: 'No records found' });
        }

        res.status(200).json(pet);
    } catch(err){
     res.status(500).json({error:'somthing went wrong'})
   }
}

petCntrl.update = async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }

    const body = req.body;
    const id = req.params.id;

    try {
        // Handle file upload if any
        if (req.file) {
            console.log('File received:', req.file);
            const photoOptions = {
                folder: 'Pet-Buddy-CareTaker/Pet',
                quality: 'auto',
            };
            const photoResult = await uploadToCloudinary(req.file.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            console.log('Uploaded photo:', photoResult.secure_url);
            body.petPhoto = photoResult.secure_url;
        }

        // Ensure medication is properly structured
        if (body.medication && typeof body.medication === 'string') {
            try {
                body.medication = JSON.parse(body.medication);
            } catch (error) {
                return res.status(400).json({ errors: [{ msg: 'Invalid medication format' }] });
            }
        }

        // Ensure reminders is properly structured
        if (body.reminders && typeof body.reminders === 'string') {
            try {
                body.reminders = JSON.parse(body.reminders);
            } catch (error) {
                return res.status(400).json({ errors: [{ msg: 'Invalid reminders format' }] });
            }
        }

        // Only update valid fields
        const validFields = ['petName', 'age', 'gender', 'categories', 'breed', 'petPhoto', 'weight', 'vaccinated', 'medication', 'reminders', 'userId'];
        const updatedBody = _.pick(body, validFields)

        const response = await Pet.findByIdAndUpdate(id, updatedBody, { new: true });
        if (!response) {
            return res.json({ error: 'Record not found' });
        }

        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(400).json({ errors: [{ msg: err.message }] });
    }
}


petCntrl.delete=async(req,res)=>{
    try {
        const response = await Pet.findByIdAndDelete(req.params.id)
        if (!response) {
            return res.status(404).send()
        }
        return res.status(200).json(response)
    } catch (error) {
        res.status(500).json({ errors: 'something went wrong' })
    }
}



module.exports=petCntrl