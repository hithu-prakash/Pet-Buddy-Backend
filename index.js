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

const authenticateUser = require('./app/middleware/authenticateUser')
const authorizeUser = require('./app/middleware/authorizeUser')
 
const upload  = require('./app/middleware/multer')
const uploadToCloudinary=require('./app/utility/cloudinary')

const  fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const helmet=require('helmet')


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
app.delete('/userId/remove/:id',authenticateUser,userCntrl.Remove)

//careTaker CRUD
            //upload.single('proof')
app.post('/caretaker/create',upload.single('proof'),authenticateUser,authorizeUser(['careTaker']),checkSchema(careTakerValidation),careTakerCntrl.create)
app.get('/caretaker/showallcareTaker',careTakerCntrl.showallcareTaker)
app.get('/careTaker/singlecareTaker/:id',authenticateUser,careTakerCntrl.singlecareTaker)
app.put('/careTaker/:id',authenticateUser,authorizeUser(['careTaker']),checkSchema(careTakerUpdateValidation),careTakerCntrl.update)
app.delete('/careTaker/:id',authenticateUser,authorizeUser(['careTaker']),careTakerCntrl.delete)
app.post('/careTaker/proof',upload.single('proof'),careTakerCntrl.create)

//petParent CRUD

app.post('/petParent/create',authenticateUser,authorizeUser(['petParent']),checkSchema(petParentValidation),petParentCntrl.create)
app.get('/petParent/showall',petParentCntrl.showall)
app.get('/petParent/oneParent/:id',authenticateUser,authorizeUser(['admin','petParent']),petParentCntrl.showone)
app.put('/petParent/update/:id',authenticateUser,authorizeUser(['admin','petParent']),checkSchema(petParentUpdateValidation),petParentCntrl.update)
app.delete('/petParent/delete/:id',petParentCntrl.delete)

//pet CRUD
app.post('/pet/create',authenticateUser,authorizeUser(['petParent']),checkSchema(petValidation),petCntrl.create) //checkSchema(petValidation)
app.get('/pet/showAll',petCntrl.showAll)
app.get('/pet/singlePet/:id',authenticateUser,petCntrl.singelPet)
app.put('/pet/update/:id',authenticateUser,authorizeUser(['petParent']),checkSchema(petUpdateValidation),petCntrl.update)
app.delete('/pet/delete/:id',petCntrl.delete)

//booking CRUD
app.post('/booking/create/:careTakerid',authenticateUser,authorizeUser(['petParent']),bookingCntrl.create)
app.get('/booking/allbooking',bookingCntrl.allBookings)

app.listen(port,()=>{
    console.log('Port running successfully',port)
})

