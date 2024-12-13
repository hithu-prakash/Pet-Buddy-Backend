const Pet = require('../models/pet-model')
const PetParent = require('../models/petParent-model')
const {validationResult} = require('express-validator')
const {uploadToCloudinary} = require('../utility/cloudinary'); // Adjust the path as needed
const _ = require("lodash")

const petCltr ={}

petCltr.create = async (req, res) => {
    // Check for validation errors
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
    try {
        const userId = req.user.id;
        const body = req.body;
        body.userId = userId;
        // body.medication = JSON.parse(body.medication);
        // body.reminders = JSON.parse(body.reminders);
                
        // Retrieve the petParentId from the database
        const petParent = await PetParent.findOne({ userId });
        if (!petParent) {
            return res.status(400).json({ errors: [{ msg: 'Pet Parent profile not found for this user.' }] });
        }
        body.petParentId = petParent._id;

        // Parse medication and reminders fields if they are strings
        try {
            if (typeof body.medication === 'string') {
                body.medication = JSON.parse(body.medication);
            }
            if (typeof body.reminders === 'string') {
                body.reminders = JSON.parse(body.reminders);
            }
        } catch (parseError) {
            return res.status(400).json({ errors: [{ msg: 'Invalid format for medication or reminders.' }] });
        }

        // Handle file upload
        if (req.file) {
            console.log('File received:', req.file);
            const photoOptions = {
                folder: 'Pet-Buddy-Pet/photo',
                quality: 'auto',
            };
            const photoResult = await uploadToCloudinary(req.file.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            body.petPhoto = photoResult.secure_url;
        }

        // Create new pet with medication and reminders as arrays
        const newPet = new Pet(body);
        await newPet.save();
        console.log("New Pet Created",newPet);

        // Populate userId details
        const populatepet = await Pet.findById(newPet._id).populate('userId', 'username email phoneNumber') .populate('petParentId', 'address photo proof');
        return res.json(populatepet);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Internal error' });
    }

};

petCltr.showall = async (req,res)=>{
    try{
        const pets  = await Pet.find().populate('userId','username email phoneNumber').populate('petParentId','parentPhoto address proof');
        res.status(200).json(pets)
    }catch(err){
        res.status(500).json({errors:"Something went wrong"})
    }
}
petCltr.showone = async (req, res) => {
    try {
        const petParentId = req.params.id; // Assuming petParentId is passed as a parameter in the URL
        const pets = await Pet.findOne({ petParentId })
            .populate('userId', 'username email phoneNumber')
            .populate('petParentId', 'address photo proof');
        
        if (!pets) {
            return res.status(404).json({ errors: "Pet not found" });
        }
        res.status(200).json(pets);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: "Something went wrong" });
    }
};

petCltr.singelPet=async(req,res)=>{
    try {
        // Log the user ID to ensure it is being passed correctly
        console.log('User ID:', req.user.id);

        // Fetch the parent record
        const pet = await Pet.findOne({ userId: req.user.id }).populate('userId', 'email username phoneNumber').populate('petParentId','address photo proof');

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

petCltr.update = async (req, res) => {
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
                folder: 'Pet-Buddy-Pet/photo',
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

        const response = await Pet.findByIdAndUpdate(id, updatedBody, { new: true }).populate('userId', 'username email phoneNumber') .populate('petParentId', 'address photo proof');
        if (!response) {
            return res.json({ error: 'Record not found' });
        }

        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(400).json({ errors:  err.message});
    }
}

// petCltr.updateone = async (req,res) =>{
//     const errors =validationResult(req);
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors:errors.array()})
//     }
//     try{
//         const body = req.body;
//         const pets = await Pet.findByIdAndUpdate(req.params.id,body,{new:true}).populate('userId','username email phoneNumber').populate('petParentId','address photo proof');
//         if(!pets){
//             return res.status(404).json({errors:"Pet not found"})
//         }
//         res.status(200).json(pets)
//     }catch(err){
//         res.status(500).json({errors:"Something went wrong"})
//     }
// }
petCltr.deleteone = async (req,res) =>{
    try{
        const pets = await Pet.findByIdAndDelete(req.params.id).populate('userId','username email phoneNumber').populate('petParentId','address photo proof');
        if(!pets){
            return res.status(404).json({errors:"Pet not found"})
        }
        res.status(200).json(pets)
    }catch(err){
        console.log(err.message)
        res.status(500).json({errors:"Something went wrong"})
    }
    
}
module.exports = petCltr