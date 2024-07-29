const {validationResult} = require("express-validator")
const Pet = require('../models/pet-model')
const _ = require("lodash")
const uploadToCloudinary = require('../utility/cloudinary')

petCntrl={}

petCntrl.create = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        res.status(400).json({ errors: array() })
    }
    try {
        const body = req.body
        body.userId = req.user.id
        const pet = new Pet(body)
        const {
            petName,
            age,
            gender,
            breed,
            petPhoto,
            weight,
            categories,
            medication,
            reminders
        } = req.body

        const newPet = new Pet({
            user: req.user.id,
            petName,
            age,
            gender,
            breed,
            petPhoto,
            weight,
            categories,
            medication: {
                medicationName: medication.medicationName,
                description: medication.description,
                dueDate: medication.dueDate,
                dose: medication.dose
            },
            reminders: {
                date: reminders.date,
                title: reminders.title,
                note: reminders.note
            }
        })

        if (req.file) {
            console.log('File received:', req.file);
            const body = _.pick(req.body, ['petPhoto'])
            const photoOptions = {
                folder: 'Pet-Buddy-CareTaker/Pet',
                quality: 'auto',
            };
            const photoResult = await uploadToCloudinary(req.file.buffer, photoOptions);
            console.log('Upload result:', photoResult);
            console.log('Uploaded photo:', photoResult.secure_url);
            newPet.petPhoto = photoResult.secure_url;
        }
        await newPet.save()
        console.log(newPet)
        const populateBooking = await Pet.findById(newPet._id).populate('userId', 'username email phoneNumber')
        return res.json(populateBooking)
    } catch (err) {
        console.log(err.message)
        res.status(500).json("Internal error")
    }
}

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
    try{ 
        console.log(req.user.id)
        const pet=await Pet.findOne({userId:req.user.id}).populate('userId','email username phoneNumber')
     if(!pet){
         return res.json({error:'No records found'})
     }
     res.status(200).json(pet)
   }catch(err){
     res.status(500).json({error:'somthing went wrong'})
   }
}

petCntrl.update=async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty){
        res.status(400).json({errors:array()})
    }
    const body= req.body
    try{
        const id = req.params.userId
        const response = await Pet.findByIdAndUpdate(req.params.id, body, { new: true })
        if (!response) {
            return res.json({ error: 'record not found' })
        }
        return res.status(200).json(response)
    } catch (err) {
        console.log(err)
        res.status(400).json({ errors: errors.array() })
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