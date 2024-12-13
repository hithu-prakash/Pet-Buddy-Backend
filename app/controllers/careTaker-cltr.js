const CareTaker = require('../models/careTaker-model')
const { validationResult } = require('express-validator');
const _ = require('lodash');
const {uploadToCloudinary} = require('../utility/cloudinary');
// const fetch = require('node-fetch');

const careTakerCltr = {}

careTakerCltr.create = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const { careTakerBusinessName,address, bio, serviceCharges } = req.body
        console.log('serviceCharges',serviceCharges)
        const parsedServiceCharges = typeof serviceCharges === 'string'
        ? JSON.parse(serviceCharges)
        : serviceCharges;

         // Get the coordinates from the provided address using OpenCage Geocoder API
         const apiKey = process.env.GEOAPIKEY;  // Replace with your OpenCage API key
         const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
 
         const geocodeResponse = await fetch(geocodeUrl);
         const geocodeData = await geocodeResponse.json();
 
         if (geocodeData.results.length === 0) {
             return res.status(400).json({ errors: [{ msg: 'Invalid address' }] });
         }
 
         const { lat, lng } = geocodeData.results[0].geometry;

        const newCareTaker = new CareTaker({
            userId: req.user.id,
            careTakerBusinessName,
            address,
            bio,
            serviceCharges: parsedServiceCharges,
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            }
        });
        console.log('lat : ',lat ,"lng : ",lng)

        // Handle profile photo upload
        if (req.files && req.files.photo && req.files.photo.length > 0) {
            const photoFile = req.files.photo[0];
            console.log('Photo file received:', photoFile);
            
            const photoOptions = {
                folder: 'Pet-Buddy-CareTaker/photo',
                quality: 'auto',
            };

            // Upload profile photo to Cloudinary
            const photoResult = await uploadToCloudinary(photoFile.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            console.log('Uploaded photo:', photoResult.secure_url);

            // Assign Cloudinary URL to newCareTaker.photo field
            newCareTaker.photo = photoResult.secure_url;
        }
         // Handle proof image upload
         if (req.files && req.files.proof && req.files.proof.length > 0) {
            const proofFile = req.files.proof[0];
            console.log('Proof file received:', proofFile);

            // Check  proof present
            const proofOptions = {
                folder: 'Pet-Buddy-CareTaker/proof',
                quality: 'auto',
            };
            const proofResult = await uploadToCloudinary(proofFile.buffer, proofOptions);
            console.log('Uploaded proof:', proofResult.secure_url);
            newCareTaker.proof = proofResult.secure_url;
        } else {
            return res.status(400).json({ errors: [{ msg: 'Proof file is required.' }] });
        }
        // Save new CareTaker 
        await newCareTaker.save()
        const populateCareTaker = await CareTaker.findById(newCareTaker._id).populate('userId','username email phoneNumber')
        res.status(201).json(populateCareTaker)
    }catch(err){
        console.log(err.message)
        res.status(500).json({ errors: 'something went wrong'})
    }
}

careTakerCltr.showall = async(req,res)=>{
    try{
        const search = req.query.search || '';
        const searchRegex = new RegExp(search, 'i'); // 'i' makes it case-insensitive

        const caretaker = await CareTaker.find(
            { verifiedByAdmin: true ,
            $or: [
                { careTakerBusinessName: searchRegex },
                { address: searchRegex },
                {'serviceCharges.name':searchRegex}
            ]
        }).populate('userId','username email phoneNumber')
          .sort({'rating':-1});
        res.status(200).json(caretaker)
    }catch(err){
        res.status(500).json({ errors: 'something went wrong'})
    }
}
careTakerCltr.showservice = async(req,res)=>{
    try{
        const search = req.query.search || '';
        const searchRegex = new RegExp(search, 'i');
        const caretaker = await CareTaker.find({
            verifiedByAdmin:true,
            'serviceCharges.name':searchRegex
        }).populate('userId','username email phoneNumber')
        .sort({'rating':-1});
      res.status(200).json(caretaker)
    }catch(err){
        res.status(500).json({ errors: 'something went wrong'})
    }
}
careTakerCltr.showone = async(req,res)=>{
    try{
        const caretaker = await CareTaker.findById(req.params.id).populate('userId','username email phoneNumber')
        if(!caretaker){
            return res.status(404).json({error:'No records found'})
        }
        res.status(200).json(caretaker)
    }catch(error){
        console.log(error)
        res.status(500).json({ errors: 'something went wrong'})
    }
}
careTakerCltr.singlecareTaker = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    try{ 
        const caretaker=await CareTaker.findOne({userId:req.user.id}).populate('userId','email username phoneNumber')
        if(!caretaker){
            return res.json({error:'No records found'})
        }
     res.status(200).json(caretaker)
   }catch(err){
     res.status(500).json({error:'somthing went wrong'})
   }
}

careTakerCltr.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { careTakerBusinessName, address, bio, serviceCharges } = req.body;
        const parsedServiceCharges = typeof serviceCharges === 'string'
            ? JSON.parse(serviceCharges)
            : serviceCharges;

        // Fetch the existing CareTaker record
        const existingCareTaker = await CareTaker.findById(id);
        
        if (!existingCareTaker) {
            return res.status(404).json({ errors: [{ msg: 'CareTaker not found' }] });
        }

         // Get the coordinates from the provided address if address is updated
         let location = existingCareTaker.location;
         if (address && address !== existingCareTaker.address) {
             const apiKey =  process.env.GEOAPIKEY;  // Replace with your OpenCage API key
             const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
 
             const geocodeResponse = await fetch(geocodeUrl);
             const geocodeData = await geocodeResponse.json();
 
             if (geocodeData.results.length === 0) {
                 return res.status(400).json({ errors: [{ msg: 'Invalid address' }] });
             }
 
             const { lat, lng } = geocodeData.results[0].geometry;
             location = {
                 type: 'Point',
                 coordinates: [lng, lat]
             };
             console.log('lat : ',lat ,"lng : ",lng)
         }

        // Merge the new data with existing data
        const updateData = {
            careTakerBusinessName: careTakerBusinessName || existingCareTaker.careTakerBusinessName,
            address: address || existingCareTaker.address,
            bio: bio || existingCareTaker.bio,
            serviceCharges: parsedServiceCharges || existingCareTaker.serviceCharges,
            location: location,
            // Preserve existing photo and proof unless updated
            photo: existingCareTaker.photo,
            proof: existingCareTaker.proof,
        };
        

        // Handle profile photo upload if provided
        if (req.files && req.files.photo && req.files.photo.length > 0) {
            const photoFile = req.files.photo[0];
            const photoOptions = {
                folder: 'Pet-Buddy-CareTaker/photo',
                quality: 'auto',
                
            };

            const photoResult = await uploadToCloudinary(photoFile.buffer, photoOptions);
            console.log('Uploaded photo:', photoResult.secure_url);
            updateData.photo = photoResult.secure_url; // Update photo URL
        }

        // Handle proof image upload if provided
        if (req.files && req.files.proof && req.files.proof.length > 0) {
            const proofFile = req.files.proof[0]; // Access the first file from the array
            const proofOptions = {
                folder: 'Pet-Buddy-CareTaker/proof',
                quality: 'auto',
            };

            const proofResult = await uploadToCloudinary(proofFile.buffer, proofOptions);
            console.log('Uploaded proof:', proofResult.secure_url);
            updateData.proof = proofResult.secure_url; // Update proof URL
        }

        // Update the CareTaker in the database
        const updatedCareTaker = await CareTaker.findByIdAndUpdate(id, updateData, { new: true }).populate('userId', 'username email phoneNumber');

        res.status(200).json(updatedCareTaker);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};



careTakerCltr.delete = async(req,res)=>{
    try{
        const caretaker = await CareTaker.findByIdAndDelete(req.params.id).populate('userId','username email phoneNumber')
        if(!caretaker){
            return res.status(404).send()
        }
        res.status(200).json(caretaker)
    }catch(error){
        res.status(500).json({ errors: 'something went wrong'})
    }
}

module.exports = careTakerCltr