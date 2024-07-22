//const User = require('../models/user-model')
const { validationResult } = require('express-validator')
const _ = require('lodash')
const CareTaker = require('../models/caretaker-model')
const uploadToCloudinary = require('../utility/cloudinary')


const careTakerCntrl = {}

careTakerCntrl.create = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
   
    try {
        const body=req.body
        const careTaker=new CareTaker(body)
       careTaker.userId=req.user.id
        const { businessName,address, bio, serviceCharge } = req.body
        const newCareTaker = new CareTaker({
            user: req.user.id,
            businessName,
            address,
            bio,
            serviceCharge
        });

        // Handle profile photo upload
        if (req.file) {
            console.log('File received:', req.file);
            const body = _.pick(req.body, ['proof'])
            const photoOptions = {
                folder: 'Pet-Buddy-CareTaker/photo',
                quality: 'auto',
            };

            // Upload profile photo to Cloudinary
            const photoResult = await uploadToCloudinary(req.file.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            console.log('Uploaded photo:', photoResult.secure_url);

            // Assign Cloudinary URL to newCareTaker.photo field
            newCareTaker.photo = photoResult.secure_url;
        }

        //Handle Aadhar proof upload
        // if (req.files && req.files.proof) {
        //     console.log('File received:', req.files)
        //     const proofOptions = {
        //         folder: 'Pet-Buddy-CareTaker/proof',
        //         quality: 'auto',
        //     };

        //     // Upload Aadhar proof to Cloudinary
        //     const proofResult = await uploadToCloudinary(req.files.proof[0].buffer, proofOptions);
        //     console.log('Uploaded Aadhar proof:', proofResult.secure_url);

            
        //     newCareTaker.proof = proofResult.secure_url;
        // }

        await newCareTaker.save();
        console.log(newCareTaker)
        const populateCareTaker = await CareTaker.findById(newCareTaker._id).populate('userId','username email phoneNumber')
        return res.status(200).json(populateCareTaker);
    } catch (err) {
        console.error('Error creating caretaker:', err.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
    // try {
    //     const { careTakerName, address, phoneNumber, proof, bio, serviceCharge} = req.body
    //     const newCareTaker = new CareTaker({
    //         user: req.user.id,
    //         careTakerName,
    //         phoneNumber,
    //         address,
    //         proof,
    //         bio,
    //         serviceCharge
    //     })
    //     if (req.file) {
    //         const options = {
    //             folder: 'Pet-Buddy-CareTaker/ProfilePhoto',
    //             quality: 'auto',
    //         }
    //         const result = await uploadToCloudinary(req.file.buffer, options)
    //         console.log(result.secure_url)
    //         newCareTaker.photo = result.secure_url
    //     }
    //     await newCareTaker.save()
    //     return res.status(200).json(newCareTaker)
    // } catch (err) {
    //     console.log(err.message)
    //     res.status(500).json('something went wrong')
    // }
    // try{
    //     const caretaker = new careTaker(body)
    //     caretaker.userId=req.user.id
    //     caretaker.uploads=req.file
    //     const options = {
    //         folder: 'Pet-Buddy-CareTaker/ProfilePhoto',
    //         quality: 'auto',
    //       };
    //       const result = await uploadToCloudinary(req.file.buffer, options);
    //     console.log(userId)
    //     await caretaker.save(result)
    //     return res.status(200).json(caretaker)
    // } catch(err) {
    //     console.log(err.message)
    //     return res.status(500).json({errors:'Internal server errors'})
    // }
    // try {
    //     console.log(body)
    //     const caretakers = await careTaker.find({ user: req.user.id }).populate("user","username email phoneNumber")
    //     console.log(caretakers)
    //     return res.status(200).json(caretakers);
    // } catch (err) {
    //     console.error(err.message);
    //     res.status(500).json({ errors: "Something went wrong" });
    // }


    careTakerCntrl.uploads = async (req, res) => {
        try {
            if (req.file) {
                console.log('File received:', req.file);
                
                // Upload file to Cloudinary
                const options = {
                    folder: 'Pet-Buddy-CareTaker/Proof',
                    quality: 'auto',
                };
                const result = await uploadToCloudinary(req.file.buffer, options);
                console.log('Upload result:', result);
                
                // Assuming you want to associate this proof URL with a CareTaker document
                const careTakerId = req.params.id;
                console.log(careTakerId)
                
                // Update CareTaker document with the proof URL
                const updatedCareTaker = await CareTaker.findByIdAndUpdate(
                    careTakerId,
                    { proof: result.secure_url }, // Update the proof field with Cloudinary URL
                    { new: true } // To return the updated document
                );
                
                if (!updatedCareTaker) {
                    return res.status(404).json({ error: 'CareTaker not found' });
                }
    
                return res.status(200).json(updatedCareTaker);
            } else {
                console.log('No file received');
                return res.status(500).json({ error: 'Unable to find image' });
            }
    } catch (err) {
        console.error('Error uploading file:', err.message);
        res.status(500).json({ error: 'Error uploading file' });
    }
};



careTakerCntrl.showallcareTaker = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    try {
        const caretaker = await CareTaker.find().populate('userId','username email phoneNumber')

        return res.status(200).json(caretaker)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ errors: 'something went wrong' })
    }
}

careTakerCntrl.singlecareTaker = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    try {
        //const careTakerId = req.params.id
        const response = await CareTaker.findById(req.params.id).populate('userId','username email phoneNumber')
        res.status(200).json(response)

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ errors: 'something went wrong' })
    }
}

careTakerCntrl.update = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    try {
        //const id = req.params.userId
        const response = await CareTaker.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidation:true}).populate('userId','username email phoneNumber')
        if (!response) {
            return res.json({ error: 'record not found' })
        }
        return res.status(200).json(response)
    } catch (err) {
        console.log(err)
        res.status(400).json({ errors: errors.array() })
    }
}

careTakerCntrl.delete = async (req, res) => {
    try {
        const response = await careTaker.findByIdAndDelete(req.params.id)
        if (!response) {
            return res.status(404).send()
        }
        return res.status(200).json(response)
    } catch (error) {
        res.status(500).json({ errors: 'something went wrong' })
    }
}

module.exports = careTakerCntrl