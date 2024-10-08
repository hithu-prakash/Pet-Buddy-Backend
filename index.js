require('dotenv').config()

const express= require('express')
const cors= require('cors')

const app = express()
const port = process.env.PORT
const { checkSchema } = require('express-validator')
const configDB = require('./config/db')

const { 
    userRegistrationValidation,userLoginValidation,verifyOtpValidations,userUpdateValidation, 
    userResetPassword} = require('./app/validations/user-validation')
const {careTakerValidation,careTakerUpdateValidation} = require('./app/validations/careTaker-validation')
const {petParentValidation,petParentUpdateValidation}=require('./app/validations/petParent-validation')
const {petValidation, petUpdateValidation}=require('./app/validations/pet-validation')


const userCntrl = require('./app/controllers/user-cntrl')
const careTakerCntrl=require('./app/controllers/careTaker-cntrl')
const petParentCntrl=require('./app/controllers/petParent-cntrl')
const petCntrl=require('./app/controllers/pet-cntrl')
const bookingCntrl =require('./app/controllers/booking-cntrl')
const reviewCntrl=require('./app/controllers/review-cntrl')
const adminCltr=require('./app/controllers/admin-cntrl')

const authenticateUser = require('./app/middleware/authenticateUser')
const authorizeUser = require('./app/middleware/authorizeUser')
 
const upload  = require('./app/middleware/multer')
const uploadToCloudinary=require('./app/utility/cloudinary')

const  fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const helmet=require('helmet')

const paymentCntrl = require('./app/controllers/payment-cntrl')


app.use(morgan(':method :url :status :res[content-length] - :response-time ms' /* 'common '*/, {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
  }))

app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(express.urlencoded({extended:false}))
configDB()



//user CRUD
app.post('/user/register',checkSchema(userRegistrationValidation), userCntrl.Register)
app.post('/user/login', checkSchema(userLoginValidation), userCntrl.Login)
app.get('/user/account',authenticateUser,userCntrl.Account)
app.put('/user/update',authenticateUser,checkSchema(userUpdateValidation),userCntrl.Update)
app.post('/user/verify',checkSchema(verifyOtpValidations),userCntrl.verify)
app.post('/user/forgotPassword',userCntrl.forgetPassword)
app.post('/user/resetPassword',checkSchema(userResetPassword),userCntrl.resetPassword)
//app.delete('/userId/remove/:id',authenticateUser,userCntrl.Remove)

//careTaker CRUD
            //upload.single('proof')                                                              //checkSchema(careTakerValidation)
app.post('/caretaker/create',upload.fields([{name:'photo',maxCount:1},{name:'proof',maxCount:1}]),authenticateUser,authorizeUser(['careTaker']),careTakerCntrl.create)
app.get('/caretaker/showallverifiedcareTaker', careTakerCntrl.showallVcareTaker);
app.put('/api/admin/verify-caretaker/:caretakerId', careTakerCntrl.verifyCaretaker);
app.get('/careTaker/singlecareTaker/:id',careTakerCntrl.singlecareTaker)
app.get('/careTaker/single-care-taker',careTakerCntrl.careTakerOne)
app.put('/careTaker/update/:id', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'proof', maxCount: 1 }]),authenticateUser,authorizeUser(['careTaker']),careTakerCntrl.update)
app.delete('/careTaker/:id',authenticateUser,authorizeUser(['careTaker','admin']),careTakerCntrl.delete)
app.get('/CTdetails/:caretakerId', careTakerCntrl.bookingDetails);


//petParent CRUD

app.post('/petParent/create',upload.fields([{name:'parentPhoto',maxCount:1},{name:'proof',maxCount:1}]),authenticateUser,authorizeUser(['petParent']),checkSchema(petParentValidation),petParentCntrl.create)
app.get('/petParent/showall',petParentCntrl.showall)
app.get('/petParent/single-parent/:id',authenticateUser,petParentCntrl.singlePetParent)
app.get('/petParent/oneParent',authenticateUser,authorizeUser(['admin','petParent']),petParentCntrl.showone)
app.put('/petParent/update/:id',upload.fields([{name:'parentPhoto',maxCount:1},{name:'proof',maxCount:1}]),authenticateUser,authorizeUser(['admin','petParent']),checkSchema(petParentUpdateValidation),petParentCntrl.update)
app.delete('/petParent/delete/:id',authenticateUser,authorizeUser(['petParent','admin']),petParentCntrl.delete)

//pet CRUD
app.post('/pet/create',upload.single('petPhoto'),authenticateUser,authorizeUser(['petParent']),petCntrl.create) //checkSchema(petValidation)
app.get('/pet/showAll',petCntrl.showAll)
app.get('/pet/singelOne',petCntrl.singelOne)
app.get('/pet/singlePet/:id',petCntrl.singelPet)
app.get('/pets/by-parent/:petParentId', petCntrl.getPetsByParentId);
app.put('/pet/update/:id',upload.single('petPhoto'),authenticateUser,authorizeUser(['petParent']),petCntrl.update)
app.delete('/pet/delete/:id',authenticateUser,authorizeUser(['petParent','admin']),petCntrl.delete)

//booking CRUD
app.post('/booking/careTaker/:caretakerId', authenticateUser, authorizeUser(['petParent']), bookingCntrl.create);
app.get('/booking/allbooking',bookingCntrl.allBookings)
app.get('/booking/singlebooking/:id',authenticateUser,bookingCntrl.singleBooking)
//app.put('/booking/update/:id',authenticateUser,authorizeUser(['petParent']),bookingCntrl.update)
app.put('/booking/accept-caretaker/:id',authenticateUser,bookingCntrl.acceptBooking)
app.put('/booking/deny-caretaker/:id',authenticateUser,bookingCntrl.denyBooking)
app.get('/booking/allcaretaker-booking',authenticateUser,bookingCntrl.allCareTakerBooking)
app.get('/booking/booking-history-petparent',authenticateUser,bookingCntrl.parentbooklist)


//review CRUD
app.post('/review/:bookingId',upload.single('photos'), authenticateUser, authorizeUser(['petParent']), reviewCntrl.create);
app.get('/all/review',reviewCntrl.getAll)
app.get('/singleReview/:caretakerId', authenticateUser,  authorizeUser(['petParent','careTaker']), 
    reviewCntrl.getByCaretaker);
app.get('/review/:reviewId', authenticateUser, authorizeUser(['petParent', 'careTaker']), reviewCntrl.getReviewById);
//app.get('/caretaker-ratings/:caretakerId', reviewCntrl.getCaretakerRatings);
app.get('/caretaker-ratings/:caretakerId', reviewCntrl.getCaretakerRatings);
app.post('/send-warning/:caretakerId',reviewCntrl.sendWarningEmail);
app.put('/update/:reviewId',upload.single('photos'),authenticateUser,authorizeUser(['petParent','admin']),reviewCntrl.update)
// app.delete('/delete/review',reviewCntrl.delete)

// app.post('/review/create/booking/:bookingId',upload.single('photos'), authenticateUser, authorizeUser(['petParent']), reviewCntrl.create);
//payment 
app.post('/payment/pay/booking/:id',authenticateUser,authorizeUser(['petParent']),paymentCntrl.pay)
app.put('/payment/success/:id',paymentCntrl.successUpdate)
app.put('/payment/failed/:id',paymentCntrl.failedUpdate)

//admin
app.get('/api/admin/caretakers',adminCltr.getAllCareTakers)
app.get('/api/admin/petparents',adminCltr.getAllPetParents)
app.get('/api/admin/pets',adminCltr.getAllPets)
app.put('/api/admin/verify-caretakers/:id',adminCltr.verifyCareTaker)
app.get('/api/admin/counts', adminCltr.getCounts)

app.listen(port,()=>{
    console.log('Port running successfully',port)
})

