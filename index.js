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
app.get('/caretaker/showallcareTaker',careTakerCntrl.showallcareTaker)
app.get('/careTaker/singlecareTaker',authenticateUser,careTakerCntrl.singlecareTaker)
app.put('/careTaker/update/:id', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'proof', maxCount: 1 }]),authenticateUser,authorizeUser(['careTaker']),careTakerCntrl.update)
app.delete('/careTaker/:id',authenticateUser,authorizeUser(['careTaker']),careTakerCntrl.delete)


//petParent CRUD

app.post('/petParent/create',upload.fields([{name:'parentPhoto',maxCount:1},{name:'proof',maxCount:1}]),authenticateUser,authorizeUser(['petParent']),checkSchema(petParentValidation),petParentCntrl.create)
app.get('/petParent/showall',petParentCntrl.showall)
app.get('/petParent/oneParent',authenticateUser,authorizeUser(['admin','petParent']),petParentCntrl.showone)
app.put('/petParent/update/:id',upload.fields([{name:'parentPhoto',maxCount:1},{name:'proof',maxCount:1}]),authenticateUser,authorizeUser(['admin','petParent']),checkSchema(petParentUpdateValidation),petParentCntrl.update)
app.delete('/petParent/delete/:id',petParentCntrl.delete)

//pet CRUD
app.post('/pet/create',upload.single('petPhoto'),authenticateUser,authorizeUser(['petParent']),petCntrl.create) //checkSchema(petValidation)
app.get('/pet/showAll',petCntrl.showAll)
app.get('/pet/singlePet',authenticateUser,petCntrl.singelPet)
app.put('/pet/update/:id',upload.single('petPhoto'),authenticateUser,authorizeUser(['petParent']),petCntrl.update)
app.delete('/pet/delete/:id',petCntrl.delete)

//booking CRUD
app.post('/booking/create/careTaker/:id/Pet/:id',authenticateUser,authorizeUser(['petParent']),bookingCntrl.create)
app.get('/booking/allbooking',bookingCntrl.allBookings)
app.get('/booking/singlebooking/:id',authenticateUser,bookingCntrl.singleBooking)
app.put('/booking/update/:id',authenticateUser,authorizeUser(['petParent']),bookingCntrl.update)
app.put('/booking/careTaker/:careTakerId/Booking/:bookingId',authenticateUser,authorizeUser(['petParent']),bookingCntrl.acceptedByCaretaker)
app.delete('/booking/delete/:id',bookingCntrl.delete)

//review CRUD
app.post('/review/create',authenticateUser,authorizeUser(['petParent']),reviewCntrl.create)
app.get('/all/review',reviewCntrl.getAll)
app.get('/single/review/careTaker/:id',reviewCntrl.getByCaretaker)
app.put('/update/review',authenticateUser,authorizeUser(['petParent']),reviewCntrl.update)
app.delete('/delete/review',reviewCntrl.delete)

//payment 
app.post('/payment/pay',paymentCntrl.pay)
app.put('/payment/success/:id',paymentCntrl.successUpdate)
app.put('/payment/failed/:id',paymentCntrl.failedUpdate)

//admin
app.get('/api/admin/caretakers',adminCltr.getAllCareTakers)
app.get('/api/admin/petparents',adminCltr.getAllPetParents)
app.put('/api/admin/verify-caretakers/:id',adminCltr.verifyCareTaker)

app.listen(port,()=>{
    console.log('Port running successfully',port)
})

