const {validationResult} = require("express-validator")
const Pet = require('../models/pet-model')

petCntrl={}

petCntrl.create=async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty){
        res.status(400).json({errors:array()})
    }
    try{
        const body= req.body
        body.userId=req.user.id
        const pet = new Pet(body)
        //pet.userId=req.user.userId
        await pet.save()
        const populateBooking = await Pet.findById(pet._id).populate('userId','username email phoneNumber')
        return res.json(populateBooking)
    } catch(err){
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
    const errors = validationResult(req)
    if(!errors.isEmpty){
        res.status(400).json({errors:array()})
    }
    try{
        const petId = req.params.id
        const pets= await Pet.findOne({userId:req.user.id,_id:petId}).populate("userId", ['username'])
        return res.status(200).json(pets)
    } catch(err){
        console.log(err.message)
        res.status(500).json({errors:'something went wrong'})
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