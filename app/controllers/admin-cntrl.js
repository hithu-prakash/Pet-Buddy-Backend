const CareTaker = require('../models/caretaker-model')
const Parent = require('../models/petparent-model')

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
        const petParent = await Parent.find()
        res.status(200).json(petParent)
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
module.exports = adminCltr
