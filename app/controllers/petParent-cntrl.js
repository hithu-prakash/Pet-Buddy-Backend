const Parent = require('../models/petparent-model')
const { validationResult } = require('express-validator')

const uploadToCloudinary = require('../utility/cloudinary')


const petParentCntrl={}

petParentCntrl.create = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    try{
        const { address,parentPhoto,proof} = req.body

        const newPetParent = new Parent({
            userId: req.user.id,
            address,
            parentPhoto,
            proof
        });

        // Handle profile photo upload
        if (req.files && req.files.parentPhoto && req.files.parentPhoto.length > 0) {
            const photoFile = req.files.parentPhoto[0];
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
            newPetParent.parentPhoto = photoResult.secure_url;
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
        const populatePetParent = await Parent.findById(newPetParent._id).populate('userId','username email phoneNumber')
        res.status(201).json(populatePetParent)
    }catch (err) {
        console.log(err.message)
        res.status(500).json('something went wrong')
    }
    // try{
    //     const body=req.body
    //     const petParent=new Parent(body)
    //     petParent.userId=req.user.id
    //     await petParent.save()
    //     res.status(200).json(petParent)
    //   }catch(err){
    //     res.status(500).json({error:'somthing went wrong'})
    //   }
}


petParentCntrl.showall = async(req,res)=>{
    try{        
        const petParent = await Parent.find().populate('userId', 'username phoneNumber email')
         return res.status(200).json(petParent)
    }catch(err){
        console.log(err.message)
        res.status(500).json({ errors: 'something went wrong'})
    }
}

petParentCntrl.showone = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
   // const body = req.body
    try {
        const Id = req.params.id
        const response = await Parent.findById(Id).populate('userId',['email','phoneNumber'])
        console.log(response)
        res.status(200).json(response)

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ errors: 'something went wrong' })
    }
}

petParentCntrl.update = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    try{
        const id = req.params.userId
        const response = await Parent.findByIdAndUpdate(req.params.id, body, { new: true })
        console.log(response)
        
        res.status(200).json(response)
    }catch(err){
        console.log(err.message)
        res.status(400).json({errors:errors.array()})
    }
}

petParentCntrl.delete = async(req,res)=>{
    try {
        const response = await Parent.findByIdAndDelete(req.params.id)
        if (!response) {
            return res.status(404).send()
        }
        return res.status(200).json(response)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ errors: 'something went wrong' })
    }
}
module.exports=petParentCntrl