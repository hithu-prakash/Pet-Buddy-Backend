const PetParent = require('../models/petParent-model')
const { validationResult } = require('express-validator');
const _ = require('lodash')
const {uploadToCloudinary} = require('../utility/cloudinary')

const petParentCltr = {}

petParentCltr.create = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const { address} = req.body

        const newPetParent = new PetParent({
            userId: req.user.id,
            address
        });

        // Handle profile photo upload
        if (req.files && req.files.photo && req.files.photo.length > 0) {
            const photoFile = req.files.photo[0];
            console.log('Photo file received:', photoFile);
            
            const photoOptions = {
                folder: 'Pet-Buddy-PetParent/photo',
                quality: 'auto',
            };

            // Upload profile photo to Cloudinary
            const photoResult = await uploadToCloudinary(photoFile.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            console.log('Uploaded photo:', photoResult.secure_url);

            // Assign Cloudinary URL to neweptparent.photo field
            newPetParent.photo = photoResult.secure_url;
        }
         // Handle proof image upload
         if (req.files && req.files.proof && req.files.proof.length > 0) {
            const proofFile = req.files.proof[0];
            console.log('Proof file received:', proofFile);

            // Check  proof present
            const proofOptions = {
                folder: 'Pet-Buddy-PetParent/proof',
                quality: 'auto',
            };
            const proofResult = await uploadToCloudinary(proofFile.buffer, proofOptions);
            console.log('Uploaded proof:', proofResult.secure_url);
            newPetParent.proof = proofResult.secure_url;
        } else {
            return res.status(400).json({ errors: [{ msg: 'Proof file is required.' }] });
        }
        // Save new CareTaker 
        await newPetParent.save()
        const populatePetParent = await PetParent.findById(newPetParent._id).populate('userId','username email phoneNumber')
        res.status(201).json(populatePetParent)
    }catch(err){
        console.log(err.message)
        res.status(500).json({ errors: 'something went wrong'})
    }
}

petParentCltr.showall = async(req,res)=>{
    try{
        const petParent = await PetParent.find().populate('userId','username email phoneNumber')
        res.status(200).json(petParent)
    }catch(err){
        res.status(500).json({ errors: 'something went wrong'})
    }
}

petParentCltr.showone = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    try{
        const petParent = await PetParent.findById(req.params.id).populate('userId','username email phoneNumber isVerified')
        if(!petParent){
            return res.status(404).json({error:'No records found'})
        }
        res.status(200).json(petParent)
    }catch(err){
        res.status(500).json({ errors: 'something went wrong'})
    }
}
petParentCltr.singlePetParent = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    try{ 
        const petParent=await PetParent.findOne({userId:req.user.id}).populate('userId','email username phoneNumber')
        if(!petParent){
            return res.json({error:'No records found'})
        }
     res.status(200).json(petParent)
   }catch(err){
     res.status(500).json({error:'somthing went wrong'})
   }
}


petParentCltr.updateone = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { address, photo, proof } = req.body;

        // Fetch the existing CareTaker record
        const existingPetParent = await PetParent.findById(id);
        
        

        // Merge the new data with existing data
        const updateData = {
            address: address || existingPetParent.address,
            photo: photo || existingPetParent.photo,
            proof:proof || existingPetParent.proof,
            // Preserve existing photo and proof unless updated
            photo: existingPetParent.photo,
            proof: existingPetParent.proof,
        };

        // Handle profile photo upload if provided
        if (req.files && req.files.photo && req.files.photo.length > 0) {
            const photoFile = req.files.photo[0];
            const photoOptions = {
                folder: 'Pet-Buddy-PetParent/photo',
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
                folder: 'Pet-Buddy-PetParent/proof',
                quality: 'auto',
            };

            const proofResult = await uploadToCloudinary(proofFile.buffer, proofOptions);
            console.log('Uploaded proof:', proofResult.secure_url);
            updateData.proof = proofResult.secure_url; // Update proof URL
        }

        // Update the CareTaker in the database
        const updatedPetParent = await PetParent.findByIdAndUpdate(id, updateData, { new: true }).populate('userId', 'username email phoneNumber');

        res.status(200).json(updatedPetParent);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: 'Something went wrong' });
    }
};
// petParentCltr.updateone = async(req,res)=>{
//     try{
//         const petParent = await PetParent.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).populate('userId','username email phoneNumber')
//         if(!petParent){
//             return res.status(404).send()
//         }
//         res.status(200).json(petParent)
//     }catch(err){
//         res.status(400).json({errors:errors.array()})
//     }
// }

petParentCltr.deleteone = async(req,res)=>{
    try{
        const petParent = await PetParent.findByIdAndDelete(req.params.id).populate('userId','username email phoneNumber')
        if(!petParent){
            return res.status(404).send()
        }
        res.status(200).json(petParent)
    }catch(err){
        res.status(500).json({ errors: 'something went wrong'})
    }
}
module.exports = petParentCltr