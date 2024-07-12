const User= require('../models/user-model')

const userRegistrationValidation = {
    username :{
        
        exists:{
            errorMessage: "username is required"
        },
        notEmpty:{
            errorMessage: "username cannot be empty"
        },
        
        trim:true 

    },
    // lastName :{
    //     in:['body'],
    //     exists:{
    //         errorMessage: "LastName is required"
    //     },
    //     notEmpty:{
    //         errorMessage: "Lastname cannot be empty"
    //     },trim:true

    // },
    email: {
       
        exists: {
            errorMessage: "Email is required"
        },
        notEmpty: {
            errorMessage: "Email cannot be empty"
        },
        isEmail: {
            errorMessage: "Email Should be In valid format"
        },
        custom: {
            options: async (value) => {
                const user = await User.findOne({ email: value })
                if (user) {
                    throw new Error('Email Already Taken/ try another email')
                } else {
                    return true
                }
            }
        },
        trim: true,
        normalizeEmail: true
    },

    phoneNumber : {
        //in:['body'],
        notEmpty : {
            errorMessage : 'phoneNumber is a required field'
        },
        // custom:{
        //     options:async function(value){
        //         const user=await User.findOne({phoneNumber:value})
        //         if(!user){
        //             return true 
        //         }else{
        //             throw new Error("mobile number already exist")
        //         }
        //     }
        // },
        trim:true
    },
    password: {
        exists: {
            errorMessage: 'password is required'            
        },
        notEmpty: {
            errorMessage: 'password cannot be empty'
        },
        isLength: {
            options: {min: 8, max: 128},
            errorMessage: 'password should be between 8 - 128 characters'
        },
        trim: true 
    },
    role :{
       // in:['body'],
        optional:true,
        exists:{
            errorMessage: "role is required"
        },
        notEmpty: {
            errorMessage: 'role cannot be empty'
        },
        isIn: {
            options: [['admin', 'careTaker','petParent']],
            errorMessage: 'role either should be a admin or caretaker or user'
        },
        custom:{
            options: async function(ele) {
                if(ele === "admin") {
                    const count = await User.countDocuments({role:'admin'})
                
                if (count > 0) {
                    throw new Error('Admin already exists');
                  }
            } else {
                return true //no admin exist
            }
        }
        }
    }

}

const verifyOtpValidations = {
    // in:['body'],
    email: {
        exists: {
            errorMessage: "Email is required"
        },
        notEmpty: {
            errorMessage: "Email cannot be empty"
        },
        isEmail: {
            errorMessage: "Email Should be In valid format"
        },
       
        trim: true,
        normalizeEmail: true
    },

    otp: {
        exists: {
            errorMessage: 'otp field is required'
        },
        notEmpty: {
            errorMessage: 'otp field must have some value'
        },
        trim: true,
        isLength: {
            options: { min: 6, max: 6 },
            errorMessage: 'otp field value must be of 6 digits'
        },
        isNumeric: {
            errorMessage: 'otp value must be numbers only'
        }
    }
}

//for resending otp
// const resendOTPPhoneValidationSchema = {
//    // in:'body' ,
//     PhoneNumber : {
//         exists: {
//             errorMessage: 'PhoneNumber  field is required'
//         },
//         notEmpty: {
//             errorMessage: 'PhoneNumber  field must have some value'
//         },
//         trim: true,
//    }
// }

       
        
    

const userLoginValidation ={
    email: {
        in: ['body'],
        exists: {
            errorMessage: "Email is required"
        },
        notEmpty: {
            errorMessage: "Email cannot be empty"
        },
        isEmail: {
            errorMessage: "Email Should be In valid format"
        },
        trim: true,
        normalizeEmail: true
    },
    password: {
        in: ['body'],
        exists: {
            errorMessage: "Password is required"
        },
        notEmpty: {
            errorMessage: "Password cannot be empty"
        },
        isLength: {
            options: { min: 8, max: 128 },
            errorMessage: 'Password should be between 8-128 character'
        },
        trim: true
    },
}

//for forgot password 
// const forgotPasswordValidation = {
//     phoneNumber:{
//         exists: {
//             errorMessage: 'phoneNumber field is required'
//         },
//         notEmpty: {
//             errorMessage: 'phoneNumber field must have some value'
//         },
//         trim: true,
        
//     },
//     // otp: {
//     //     exists: {
//     //         errorMessage: 'otp field is required'
//     //     },
//     //     notEmpty: {
//     //         errorMessage: 'otp field must have some value'
//     //     },
//     //     trim: true,
//     //     isLength: {
//     //         options: { min: 6, max: 6 },
//     //         errorMessage: 'otp field value must be of 6 digits'
//     //     },
//     //     isNumeric: {
//     //         errorMessage: 'otp value must be numbers only'
//     //     }
//     // },
//     // password: {
//     //     exists: {
//     //         errorMessage: 'password field is required'
//     //     },
//     //     notEmpty: {
//     //         errorMessage: 'password field must have some value'
//     //     }
//     // }
// }


const userUpdateValidation = {
    username: {
        in: ['body'],
        exists: {
            errorMessage: "First name is required"
        },
        notEmpty: {
            errorMessage: "First name cannot be empty"
        },
        trim: true
    },
    // lastName: {
    //     in: ['body'],
    //     exists: {
    //         errorMessage: "Last name is required"
    //     },
    //     notEmpty: {
    //         errorMessage: "Last name cannot be empty"
    //     },
    //     trim: true
    // },
    email: {
        in: ['body'],
        exists: {
            errorMessage: "Email is required"
        },
        notEmpty: {
            errorMessage: "Email cannot be empty"
        },
        isEmail: {
            errorMessage: "Email Should be In valid format"
        },
        custom: {
            options: async (value, { req }) => {
                const userId = req.user.id
                const user = await User.findOne({ email: value })
                if (user && user.id !== userId) {
                    throw new Error('Email already taken / try another one')
                } else {
                    return true;
                }
            }
        },
        trim: true,
        normalizeEmail: true
    },
}

const userResetPassword = {
    otp: {
             exists: {
                 errorMessage: 'otp field is required'
             },
             notEmpty: {
                 errorMessage: 'otp field must have some value'
             },
             trim: true,
             isLength: {
                 options: { min: 6, max: 6 },
                 errorMessage: 'otp field value must be of 6 digits'
             },
             isNumeric: {
                 errorMessage: 'otp value must be numbers only'
             }
         },
    newPassword:{
        exists: {
            errorMessage: 'password field is required'
        },
        notEmpty: {
            errorMessage: 'password field must have some value'
        },
        isLength: {
            options: { min: 8, max: 128 },
            errorMessage: 'password field value must be between 8-128 characters'
        },
        
    }
}


module.exports = {userRegistrationValidation,
                userLoginValidation,
                verifyOtpValidations,
                userUpdateValidation,
                
                userResetPassword}