const PetParent = require('../models/petParent-model')
const petParentValidation = {
    userId:{
        custom:{
            options:async function(ele,{req}){
                const careTaker = await careTaker.findOne({userId:req.user.id})
                if(careTaker){
                    throw new Error('User exist already!')
                   } else {
                    return true
                   }
            }
        }
    },
    parentPhoto:{
        exists:{
            errorMessage: 'parentPhoto is required'
        },
        notEmpty:{
            errorMessage:'parentPhoto cannot be empty'
        },
        trim:true
    },
    address:{
        exists: {
            errorMessage: 'address is required'            
        },
        notEmpty: {
            errorMessage: 'address cannot be empty'
        },
        trim:true
    },
    proof:{
        exists:{
            errorMessage: 'proof is required'
        },
        notEmpty:{
            errorMessage:'proof cannot be empty'
        },
        trim:true
    },
}

const petParentUpdateValidation = {
    address:{
        exists: {
            errorMessage: 'address is required'            
        },
        notEmpty: {
            errorMessage: 'address cannot be empty'
        },
        trim:true
    },

}
module.exports={
    petParentValidation,
    petParentUpdateValidation
}