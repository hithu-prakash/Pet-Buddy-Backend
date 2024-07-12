const careTaker= require('../models/caretaker-model')

const careTakerValidation={
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
    careTakerName :{
        exists: {
            errorMessage: 'careTakerName is required'
        },
        notEmpty: {
            errorMessage: 'careTakerName cannot be blank'
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
    photo:{
        exists:{
            errorMessage: 'photo is required'
        },
        notEmpty:{
            errorMessage:'photo cannot be empty'
        },
        trim:true
    },
    Proof:{
        exists:{
            errorMessage: 'proof is required'
        },
        notEmpty:{
            errorMessage:'proof cannot be empty'
        },
        trim:true
    },
    Bio:{
        exists:{
            errorMessage: 'Bio is required'
        },
        notEmpty:{
            errorMessage:'Bio cannot be empty'
        },
        trim:true
    },
    // serviceCharges:{

    // } 

}

const careTakerUpdateValidation = {
    careTakerName :{
        exists: {
            errorMessage: 'careTakerName is required'
        },
        notEmpty: {
            errorMessage: 'careTakerName cannot be blank'
        },
        trim:true
    },
    phoneNumber:{
        exists:{
            errorMessage:'phoneNumber is required'
        },
        notEmpty:{
            errorMessage:'phoneNumber cannot be empty'
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
    photo:{
        exists:{
            errorMessage: 'photo is required'
        },
        notEmpty:{
            errorMessage:'photo cannot be empty'
        },
        trim:true
    },
    Proof:{
        exists:{
            errorMessage: 'proof is required'
        },
        notEmpty:{
            errorMessage:'proof cannot be empty'
        },
        trim:true
    },
    Bio:{
        exists:{
            errorMessage: 'Bio is required'
        },
        notEmpty:{
            errorMessage:'Bio cannot be empty'
        },
        trim:true
    },
    // serviceCharges:{

    // } 

}

module.exports= { careTakerValidation,
                careTakerUpdateValidation
}
