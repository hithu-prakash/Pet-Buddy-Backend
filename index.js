require('dotenv').config()

const express= require('express')

const app = express()
const port = process.env.PORT
const { checkSchema } = require('express-validator')
const configDB = require('./config/db')

const { 
    userRegistrationValidation,userLoginValidation,verifyOtpValidations,userUpdateValidation, 
    userResetPassword} = require('./app/validations/user-validation')
const{careTakerValidation,careTakerUpdateValidation} = require('./app/validations/careTaker-validation')


const userCntrl = require('./app/controllers/user-cntrl')
const careTakerCntrl=require('./app/controllers/careTaker-cntrl')

const authenticateUser = require('./app/middleware/authenticateUser')
const authorizeUser = require('./app/middleware/authorizeUser')
 
const upload  = require('./app/middleware/multer')
const uploadToCloudinary=require('./app/utility/cloudinary')

app.use(express.json())
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

app.post('/caretaker/create',authenticateUser,authorizeUser(['careTaker']),checkSchema(careTakerValidation),upload.single('photo'),careTakerCntrl.create)
app.get('/caretaker/showallcareTaker',careTakerCntrl.showallcareTaker)
app.get('/careTaker/singlecareTaker/:id',authenticateUser,careTakerCntrl.singlecareTaker)
app.put('/careTaker/:id',authenticateUser,authorizeUser(['careTaker']),checkSchema(careTakerUpdateValidation),careTakerCntrl.update)
app.delete('/careTaker/:id',authenticateUser,authorizeUser(['careTaker']),careTakerCntrl.delete)
app.post('/careTaker/proof',upload.single('proof'),careTakerCntrl.uploads)

app.listen(port,()=>{
    console.log('Port running successfully',port)
})

