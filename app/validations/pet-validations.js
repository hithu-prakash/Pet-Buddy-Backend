const Pet = require('../models/pet-model')
const PetParent = require('../models/petParent-model')

const petValidation = {
    petName : {
        exists: {
            errorMessage: 'petName is required'
        },
        notEmpty: {
            errorMessage: 'petName cannot be blank'
        },
        trim:true
    },
    age:{
        exists: {
            errorMessage: 'age is required'
        },
        notEmpty: {
            errorMessage: 'age cannot be blank'
        },
        trim:true
    },
    gender:{
        exists: {
            errorMessage: 'age is required'
        },
        notEmpty: {
            errorMessage: 'age cannot be blank'
        }, 
        isIn: {
            options: [['Male', 'Female']],
            errorMessage: 'role either should be Male or Female'
        },
        trim:true

    },
    category: {
        exists: {
            errorMessage: 'categories is required'
        },
        notEmpty: {
            errorMessage: 'categories cannot be blank'
        },
        isIn: {
            options: [['Dog', 'Cat']],
            errorMessage: 'Category either should be Dog or Cat'
        },
        trim:true
    },
    breed: {
        exists: {
            errorMessage: 'breed is required'
        },
        notEmpty: {
            errorMessage: 'breed cannot be blank'
        },
        isString: {
            errorMessage: 'breed must be a string',
        },
        trim:true
    },
    petPhoto:{
        exists: {
            errorMessage: 'petPhoto is required'
        },
        notEmpty: {
            errorMessage: 'petPhoto cannot be blank'
        },
        trim:true
    },
    weight:{
        exists: {
            errorMessage: 'weight is required'
        },
        notEmpty: {
            errorMessage: 'weight cannot be blank'
        },
        isNumeric: {
            errorMessage: 'weight must be a number'
        },
        isFloat: {
            options: { min: 0.1, max: 9999.99 },
            errorMessage: 'weight must be a valid number between 0.1 and 9999.99'
        },
        trim:true
    },
    vaccinated: {
        exists: {
            errorMessage: 'vaccinated is required'
        },
        isBoolean: {
            errorMessage: 'vaccinated must be a boolean'
        },
         trim:true
    },
    
    medication:{
        exists: {
            errorMessage: 'medication must be an filed'
        },
        notEmpty: {
            errorMessage: 'medication cannot be blank'
        },
    //     medicationName: {
    //         exists: {
    //             errorMessage: 'medicationName is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'medicationName cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'medicationName must be a string'
    //         },
    //         trim: true
    //     },
    //     description: {
    //         exists: {
    //             errorMessage: 'description is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'description cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'description must be a string'
    //         },
    //         trim: true
    //     },
    //     dueDate:{
    //         exists: {
    //             errorMessage: 'Date is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'dueDate cannot be blank'
    //         },
    //         isNumeric: {
    //             errorMessage: 'Date must be a number'
    //         },
    //         trim: true
    //     },
    //     dose: {
    //         exists: {
    //             errorMessage: 'dose is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'dose cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'dose must be a string'
    //         },
    //         trim: true
    //     }
    // },
    // reminders:{
    //     exists: {
    //         errorMessage: 'reminders is required'
    //     },
    //     notEmpty: {
    //         errorMessage: 'reminders cannot be blank'
    //     },
    //     date: {
    //         exists: {
    //             errorMessage: 'Date is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'Date cannot be blank'
    //         },
    //         isNumeric: {
    //             errorMessage: 'Date must be a number'
    //         },
    //         trim: true
    //     },
    //     title :{
    //         exists: {
    //             errorMessage: 'title is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'Date cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'title must be a string'
    //         },
    //         trim: true
    //     },
    //     note:{
    //         exists: {
    //             errorMessage: 'title is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'Date cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'title must be a string'
    //         },
    //         trim: true
    //     }
    },
        // userId:{
        //     custom:{
        //         options:async function(ele,{req}){
        //             const petParent = await Parent.findOne({userId:req.user.id})
        //             if(petParent){
        //                 throw new Error('User exist already!')
        //                } else {
        //                 return true
        //                }
        //         }
        //     }
        // }
    
}

const petUpdateValidation={
    petName : {
        exists: {
            errorMessage: 'petName is required'
        },
        notEmpty: {
            errorMessage: 'petName cannot be blank'
        },
        trim:true
    },
    age:{
        exists: {
            errorMessage: 'age is required'
        },
        notEmpty: {
            errorMessage: 'age cannot be blank'
        },
        trim:true
    },
    gender:{
        exists: {
            errorMessage: 'age is required'
        },
        notEmpty: {
            errorMessage: 'age cannot be blank'
        }, 
        isIn: {
            options: [['Male', 'Female']],
            errorMessage: 'role either should be Male or Female'
        },
        trim:true

    },
    category: {
        exists: {
            errorMessage: 'categories is required'
        },
        notEmpty: {
            errorMessage: 'categories cannot be blank'
        },
        trim:true
    },
    breed: {
        exists: {
            errorMessage: 'breed is required'
        },
        notEmpty: {
            errorMessage: 'breed cannot be blank'
        },
        isString: {
            errorMessage: 'breed must be a string',
        },
        trim:true
    },
    petPhoto:{
        exists: {
            errorMessage: 'petPhoto is required'
        },
        notEmpty: {
            errorMessage: 'petPhoto cannot be blank'
        },
        trim:true
    },
    weight:{
        exists: {
            errorMessage: 'weight is required'
        },
        notEmpty: {
            errorMessage: 'weight cannot be blank'
        },
        isNumeric: {
            errorMessage: 'weight must be a number'
        },
        isFloat: {
            options: { min: 0.1, max: 9999.99 },
            errorMessage: 'weight must be a valid number between 0.1 and 9999.99'
        },
        trim:true
    },
    vaccinated: {
        exists: {
            errorMessage: 'vaccinated is required'
        },
        isBoolean: {
            errorMessage: 'vaccinated must be a boolean'
        }, trim:true
    },
    
    //  medication:{
    //     exists: {
    //         errorMessage: 'medication must be an filed'
    //     },
    //     notEmpty: {
    //         errorMessage: 'medication cannot be blank'
    //     },
    //     medicationName: {
    //         exists: {
    //             errorMessage: 'medicationName is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'medicationName cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'medicationName must be a string'
    //         },
    //         trim: true
    //     },
    //     description: {
    //         exists: {
    //             errorMessage: 'description is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'description cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'description must be a string'
    //         },
    //         trim: true
    //     },
    //     dueDate:{
    //         exists: {
    //             errorMessage: 'Date is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'dueDate cannot be blank'
    //         },
    //         isNumeric: {
    //             errorMessage: 'Date must be a number'
    //         },
    //         trim: true
    //     },
    //     dose: {
    //         exists: {
    //             errorMessage: 'dose is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'dose cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'dose must be a string'
    //         },
    //         trim: true
    //     }
    // },
    // reminders:{
    //     exists: {
    //         errorMessage: 'reminders is required'
    //     },
    //     notEmpty: {
    //         errorMessage: 'reminders cannot be blank'
    //     },
    //     date: {
    //         exists: {
    //             errorMessage: 'Date is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'Date cannot be blank'
    //         },
    //         isNumeric: {
    //             errorMessage: 'Date must be a number'
    //         },
    //         trim: true
    //     },
    //     title :{
    //         exists: {
    //             errorMessage: 'title is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'Date cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'title must be a string'
    //         },
    //         trim: true
    //     },
    //     note:{
    //         exists: {
    //             errorMessage: 'title is required'
    //         },
    //         notEmpty: {
    //             errorMessage: 'Date cannot be blank'
    //         },
    //         isString: {
    //             errorMessage: 'title must be a string'
    //         },
    //         trim: true
    //     }
    // },
}

module.exports={petUpdateValidation,petValidation}