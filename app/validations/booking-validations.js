const Booking = require('../models/booking-model')

const bookingValidation ={
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref:"User" //parentId
//     },
//     caretakerId:{
//     type: Schema.Types.ObjectId, //careTakerId
//        ref:"User"
//    },
//    petId:{
//     type: Schema.Types.ObjectId,
//     ref:"Pet"
//    },
//    category:String,
   
    date:{
        exists:{
            errorMessage:'date is required'
        },
        notEmpty:{
            errorMessage:'date cannot be empty'
        },
        trim:true,
        isDate:{
            errorMessage:' date is invaild'
        },
        custom:{
            options: function (value){
              if(new Date(value) <= new Date()){
                 throw new Error('Date should be greater then today or today')
              }else{
                return true
              }
            }
        }
    },
    // status:{
    //     type:String,
    //     default:false
    // },
    totalAmount:{
        exists:{
            errorMessage:'totalAmount is required'
        },
        notEmpty:{
            errorMessage:'totalAmount cannot be empty'
        },
        isIn:{
               options:[['pending','completed']],
               errorMessage:'payment status should either pending or completed'
        },
        trim:true,
      },
    
    //   isCheckedIn: {
    //     type: String,
    //     default: false,
    //   },
    //    isCheckedOut: {
    //     type: String,
    //     default: false,
    //   },
      isDeleted: {
        type: String,
        default: "false",
      },
      Accepted:{
         type:Boolean,
          default:false
      }

}

module.exports ={bookingValidation}
