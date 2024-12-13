// const Admin = require('../models/admin-model')
const CareTaker = require('../models/careTaker-model')
const PetParent = require('../models/petParent-model')
const Pet = require('../models/pet-model')

const adminCltr = {}

adminCltr.getAllCareTakers = async(req,res)=>{
    try{
        const caretakers = await CareTaker.find({ verifiedByAdmin: false })
        res.status(200).json(caretakers)
    }catch(error){
        res.status(500).json({ errors: 'something went wrong'})
    }
}
adminCltr.getAllPetParents = async(req,res)=>{
    try{
        const petParent = await PetParent.find()
        .populate('userId', 'username email phoneNumber')
        .populate('petparentId', 'address photo proof')
        res.status(200).json(petParent)
    }catch(error){
        console.log(error)
        res.status(500).json({ errors: 'something went wrong'})
    }
}
adminCltr.getAllPets = async(req,res)=>{
    try{
        const pets = await Pet.find().populate('userId', 'username email phoneNumber').populate('petparentId', 'userId address photo proof');
        res.status(200).json(pets)
    }catch(error){
        res.status(500).json({ errors: 'something went wrong'})
    }
}
adminCltr.verifyCareTaker = async(req,res)=>{
    try{

        const caretaker = await CareTaker.findById(req.params.id)
        if(!caretaker){
            return res.status(404).json({ error: "Caretaker not found" })
        }
        caretaker.verifiedByAdmin = true;
        await caretaker.save();
        
        res.status(200).json({ message: "Caretaker verified successfully", caretaker })
    }catch(error){
        console.error("Error verifying caretaker:", error);
        res.status(500).json({ errors: 'something went wrong'})
    }
}
adminCltr.getCounts = async(req,res)=>{
    try {
        const caretakerCount = await CareTaker.countDocuments();
        const petCount = await Pet.countDocuments();
        const petParentCount = await PetParent.countDocuments();

        res.json({
            caretakers: caretakerCount,
            pets: petCount,
            petParents: petParentCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch counts' });
    }
}
module.exports = adminCltr