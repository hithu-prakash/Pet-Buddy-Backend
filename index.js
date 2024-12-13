require('dotenv').config()
 const cors = require('cors')
 const express = require('express')
 const app = express()
 const port = process.env.PORT
 const {checkSchema} = require('express-validator')
 const configDB = require('./config/db')
 //Controllers
 const userCltr = require('./app/controllers/user-cltr')
 const petParentCltr = require('./app/controllers/petParent-cltr')
 const careTakerCltr = require('./app/controllers/careTaker-cltr')
 const adminCltr = require('./app/controllers/admin-cltr')
 const petCltr = require('./app/controllers/pet-cltr')
 const bookingCltr = require('./app/controllers/booking-cltr')
 const reviewCltr = require('./app/controllers/review-cltr')
 const paymentCltr = require('./app/controllers/payment-cltr')
 //Validations
 const {userRegisteration,userLoginValidation,verifyOtpValidation,userUpdateValidation,userResetPassword} = require('./app/validations/user-validation')
 const {careTakerValidation,careTakerUpdateValidation} = require('./app/validations/careTaker-validations')
 const {petParentValidation,petParentUpdateValidation} = require('./app/validations/petParent-validations')
 const {petValidation,petUpdateValidation} = require('./app/validations/pet-validations')
 const {bookingValidation} = require('./app/validations/booking-validations')
 //Middleware
 const authenticateUser = require('./app/middleware/authenticateUser')
 const authorizeUser = require('./app/middleware/authorizeUser')

 const upload = require('./app/middleware/multer')
 const uploadToCloudinary = require('./app/utility/cloudinary')

 configDB()
 app.use(express.json())
 app.use(cors())


 app.post('/user/register',checkSchema(userRegisteration),userCltr.register)
 app.get('/user/check-admin',userCltr.checkAdminAvailability)
//  app.post('/user/generateOtp',userCltr.generateOtp)
 app.post('/user/verify',checkSchema(verifyOtpValidation),userCltr.verify)
 app.post('/user/login',checkSchema(userLoginValidation),userCltr.login)
 app.get('/user/account',authenticateUser,userCltr.account)
 app.post('/user/forgotPassword',userCltr.forgetPassword)
 app.post('/user/resetPassword',checkSchema(userResetPassword),userCltr.resetPassword)
 app.put('/user/update',checkSchema(userUpdateValidation),userCltr.update)
 app.delete('/user/delete/:id',authenticateUser,userCltr.delete)
 //petParent
 app.post('/api/newparent',upload.fields([{name:'photo',maxCount:1},{name:'proof',maxCount:1}]),authenticateUser,authorizeUser(['petParent']),petParentCltr.create)
 app.get('/api/allparents',authenticateUser,petParentCltr.showall)
 app.get('/api/singleparent/:id',petParentCltr.showone)
 app.get('/api/single-parent',authenticateUser,petParentCltr.singlePetParent)
 app.put('/api/updateparent/:id', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'proof', maxCount: 1 }]),authenticateUser,authorizeUser(['petParent']),petParentCltr.updateone)
 app.delete('/api/deleteparent/:id',authenticateUser,authorizeUser(['admin']),petParentCltr.deleteone)
 //caretaker
 app.post('/api/newcaretaker',upload.fields([{name:'photo',maxCount:1},{name:'proof',maxCount:1}]),authenticateUser,authorizeUser(['careTaker']),careTakerCltr.create)
 app.get('/api/allcaretakers',careTakerCltr.showall)
 app.get('/api/singlecaretaker/:id',careTakerCltr.showone)
 app.get('/api/single-care-taker',authenticateUser,careTakerCltr.singlecareTaker)
 app.put('/api/updatecaretaker/:id', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'proof', maxCount: 1 }]),authenticateUser,authorizeUser(['careTaker']),careTakerCltr.update)
 app.delete('/api/deletecaretaker/:id',authenticateUser,authorizeUser(['careTaker','admin']),careTakerCltr.delete)
 app.get(`/api/show-service`,careTakerCltr.showservice)
 //admin
 app.get('/api/admin/caretakers',adminCltr.getAllCareTakers)
 app.get('/api/admin/petparents',adminCltr.getAllPetParents)
 app.get('/api/admin/pets',adminCltr.getAllPets)
 app.put('/api/admin/verify-caretakers/:id',adminCltr.verifyCareTaker)
 app.get('/api/admin/counts',adminCltr.getCounts)
 //Pets
 app.post('/api/newpet',upload.single('petPhoto'),authenticateUser,authorizeUser(['petParent']),petCltr.create)
 app.get('/api/allpets',petCltr.showall)
 app.get('/api/singlepet/:id',petCltr.showone)
 app.get('/api/single-pet',authenticateUser,petCltr.singelPet)
 app.put('/api/updatepet/:id',upload.single('petPhoto'),authenticateUser,authorizeUser(['petParent']),petCltr.update)
 app.delete('/api/deletepet/:id',authenticateUser,authorizeUser(['petParent']),petCltr.deleteone)
//Booking
app.post('/api/new-booking/:caretakerId',authenticateUser,authorizeUser(['petParent']),bookingCltr.create)
app.get('/api/all-booking',authenticateUser,bookingCltr.showall)
app.get('/api/single-booking/:id',bookingCltr.showone)
app.get('/api/single-book',authenticateUser,bookingCltr.single)
app.put('/api/accept-caretaker/:id',authenticateUser,bookingCltr.acceptBooking)
app.put('/api/deny-caretaker/:id',authenticateUser,bookingCltr.denyBooking)
app.get('/api/allcaretaker-booking',authenticateUser,bookingCltr.allCareTakerBooking)
app.get('/api/booking-history-petparent',authenticateUser,bookingCltr.parentbooklist)
app.get('/api/caretaker-book-count',bookingCltr.completedBookingsCount);
// app.put('/api/update-booking',bookingCltr.updateone)
app.delete('/api/delete-booking/:id',authenticateUser,bookingCltr.deleteone)
//payment
app.post('/api/new-payment/:bookingId',authenticateUser,paymentCltr.pay)
app.get('/api/all-payments',authenticateUser,paymentCltr.showall)
app.put('/api/payment-success/:id',paymentCltr.successUpdate)
app.put('/api/payment-failed/:id',paymentCltr.failedUpdate)
//review
app.post('/review/:bookingId',upload.single('photos'), authenticateUser, authorizeUser(['petParent']), reviewCltr.create);
app.get('/all/review',reviewCltr.getAll)
app.get('/singleReview/:caretakerId', authenticateUser,  authorizeUser(['petParent','careTaker']),reviewCltr.getByCaretaker);
app.get('/review/:reviewId', authenticateUser, authorizeUser(['petParent', 'careTaker']), reviewCltr.getReviewById);
//app.get('/caretaker-ratings/:caretakerId', reviewCntrl.getCaretakerRatings);
app.get('/caretaker-ratings/:caretakerId', reviewCltr.getCaretakerRatings);
// app.get('/api/care-rate',reviewCltr.totalCareRate)
app.post('/send-warning/:caretakerId',reviewCltr.sendWarningEmail);
app.put('/update/:reviewId',upload.single('photos'),authenticateUser,authorizeUser(['petParent','admin']),reviewCltr.update)


 app.listen(port,()=>{
    console.log('Port running successfully on port number : ',port)
 })