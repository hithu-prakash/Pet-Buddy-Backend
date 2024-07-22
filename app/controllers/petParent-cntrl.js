const Parent = require('../models/petparent-model')
const { validationResult } = require('express-validator')

const uploadToCloudinary = require('../utility/cloudinary')


const petParentCntrl={}

petParentCntrl.create = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { address,proof,parentPhoto } = req.body
        const newpetParent = new Parent({
            user: req.user.id,
            address,
            proof,
            parentPhoto
        })
              if (req.file) {
            const options = {
                folder: 'Pet-Buddy-CareTaker/PetParentProfilePhoto',
                quality: 'auto',
            }
            const result = await uploadToCloudinary(req.file.buffer, options)
            console.log(result.secure_url)
            newpetParent.parentPhoto = result.secure_url
        }
        await newpetParent.save()
        return res.status(200).json(newpetParent)
    } catch (err) {
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

petParentCntrl.uploads = async (req, res) => {
    try {
        if (req.file) {
            console.log('File received:', req.file);
            
            // Upload file to Cloudinary
            const options = {
                folder: 'Pet-Buddy-CareTaker/PetParentProfileProof',
                quality: 'auto',
            };
            const result = await uploadToCloudinary(req.file.buffer, options);
            console.log('Upload result:', result);
            
            // Assuming you want to associate this proof URL with a CareTaker document
            const petParentId = req.params.id;
            console.log(petParentId)
            
            // Update CareTaker document with the proof URL
            const updatedParent = await Parent.findByIdAndUpdate(
                petParentId,
                { proof: result.secure_url }, // Update the proof field with Cloudinary URL
                { new: true } // To return the updated document
            );
            
            if (!updatedParent) {
                return res.status(404).json({ error: 'petParent not found' });
            }

            return res.status(200).json(updatedParent);
        } else {
            console.log('No file received');
            return res.status(500).json({ error: 'Unable to find image' });
        }
} catch (err) {
    console.error('Error uploading file:', err.message);
    res.status(500).json({ error: 'Error uploading file' });
}
};

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