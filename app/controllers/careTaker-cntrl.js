//const User = require('../models/user-model')
const { validationResult } = require('express-validator')
const _ = require('lodash')
const CareTaker = require('../models/caretaker-model')
const uploadToCloudinary = require('../utility/cloudinary')


const careTakerCntrl = {}

careTakerCntrl.create = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    //const body=req.body
    /// console.log(body)

    try {
        const { careTakerName, address, phoneNumber, proof, bio, serviceCharge} = req.body
        const newCareTaker = new CareTaker({
            user: req.user.id,
            careTakerName,
            phoneNumber,
            address,
            proof,
            bio,
            serviceCharge
        })
        if (req.file) {
            const options = {
                folder: 'Pet-Buddy-CareTaker/ProfilePhoto',
                quality: 'auto',
            }
            const result = await uploadToCloudinary(req.file.buffer, options)
            console.log(result.secure_url)
            newCareTaker.photo = result.secure_url
        }
        await newCareTaker.save()
        return res.status(200).json(newCareTaker)
    } catch (err) {
        console.log(err.message)
        res.status(500).json('something went wrong')
    }
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
}

careTakerCntrl.uploads = async (req, res) => {
    try {
        if (req.file) {
            console.log('File received:', req.file);
            const body = _.pick(req.body, ['proof']);
            const options = {
                folder: 'Pet-Buddy-CareTaker/Proof',
                quality: 'auto',
            };
            const result = await uploadToCloudinary(req.file.buffer, options);
            console.log('Upload result:', result);
            body.proof = result.secure_url
          
            res.status(200).json(result);
        } else {
            console.log('No file received');
            return res.status(500).json({ errors: "Unable to find image" });
        }
    } catch (err) {
        console.error('Error uploading file:', err.message);
        res.status(500).json({ error: 'Error uploading file' });
    }
};



careTakerCntrl.showallcareTaker = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    try {
        const caretakers = await CareTaker.find().populate("userId",'email')

        return res.status(200).json(caretakers)
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
        const careTakerId = req.params.id
        const response = await CareTaker.findById(careTakerId).populate('userId','email','phoneNumber')
        res.status(200).json(response)

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ errors: 'something went wrong' })
    }
}

careTakerCntrl.update = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    try {
        const id = req.params.userId
        const response = await careTaker.findByIdAndUpdate(req.params.id, body, { new: true })
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