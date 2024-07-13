const {validationResult} = require('express-validator')
const Booking=require('../models/booking-model')
const User = require('../models/user-model')

const bookingCntrl={}

bookingCntrl.create=async(req,res)=>{
    const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.json({errors:errors.array()})
        }
       
        try{
            const body=req.body
            const parentId=req.params.careTakerId
            console.log(parentId)
            const booking = new Booking(body)
            booking.petParentId=req.user.parentId
            await booking.save()
            res.status(200).json(booking)
        } catch(err) {
            console.log(err.message)
            res.status(500).json({errors:"something went wrong"})
        }
    
}

bookingCntrl.allBookings=async(req,res)=>{
    const booking = await Booking.find().populate('userId', 'username email') 
      if(booking){
        return res.status(200).json(booking)
      }
    res.json({error:'No record found'})
}
module.exports=bookingCntrl