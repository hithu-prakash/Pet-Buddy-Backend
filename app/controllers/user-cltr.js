const User = require('../models/user-model');
const { validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const nodemailer = require('nodemailer')
const _ = require('lodash');

// OTP configuration
const OTP_LENGTH = 6;
const OTP_CONFIG = {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
};
// Generate OTP function
const generateOtp = () => {
    const otp = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
    return otp;
}

// Twilio credentials
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const userCltr = {};

// Register User
userCltr.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, phoneNumber, role } = req.body 
    try {
        const body = req.body;
        const otp = generateOtp()
        const salt = await bcryptjs.genSalt();
        const hashPassword = await bcryptjs.hash(body.password, salt);
        const role = (await User.countDocuments({})) === 0 ? 'admin' : body.role;
        const user = new User(body);
        user.password = hashPassword;
        await user.save();
        // await userCltr.sendSMS(username, phoneNumber, role,otp)
        userCltr.registerOtpMail(user.username,user.email,role,otp)
        res.status(201).json({ message: 'User registered. Please verify the OTP sent to your email.' });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ errors: "something went wrong" });
    }
};

// userCltr.checkAdminAvailability
userCltr.checkAdminAvailability = async (req, res) => {
    try {
        const userCount = await User.countDocuments({});
        const isAdminAvailable = userCount === 0;
        res.status(200).json({ isAdminAvailable });
    } catch (err) {
        res.status(500).json({ errors: "Something went wrong" });
    }
};

// send SMS to register
userCltr.sendSMS = async (username, phoneNumber, role, otp) => {
    let msgOptions = {
        from: process.env.TWILIO_PHONE_NUMBER,
        to: "+91" + phoneNumber,
        body: `Hi ${username},, you are now successfully registered to PetBuddy with role: ${role}. Your OTP is: ${otp}`,
    };
    try {
        const message = await client.messages.create(msgOptions);
        console.log(`SMS sent to ${phoneNumber} with OTP.`);
    } catch (error) {
        console.error(`Error sending SMS to ${phoneNumber}:`, error);
        throw new Error('Failed to send SMS');
    }
}

//send opt mail for registration
userCltr.registerOtpMail =async (username,email,role,otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })
    console.log(email,username)
    const html = `
    <p>Hi ${username}.<br/> Enter the  OTP to complete successfully registration to PetBuddy with role: ${role}.<br/> Your OTP is: ${otp}</p>
       <p>Note: Donot share otp with any one<br />The PetBuddy admin</p>
    `;
    try{
        const info = await
         transporter.sendMail({
            from:process.env.EMAIL,
            to: email,
            subject: "RegisterOtp",
            html: html
        });
        console.log("Email sent",info.response);
    }catch(error){
        console.log("Error sending email:",error)
    }
}


// Login User
userCltr.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findOne({ email: body.email });
        if (user) {
            const isAuth = await bcryptjs.compare(body.password, user.password);
            if (isAuth) {
                const tokenData = {
                    id: user._id,
                    role: user.role,
                };
                const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '7d' });
                return res.json({ token });
            }
            return res.status(404).json({ errors: 'invalid email or password' });
        }
        return res.status(404).json({ errors: 'invalid email or password' });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json('something went wrong');
    }
};

// Account Details
userCltr.account = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ errors: 'something went wrong' });
    }
};

//send mail
userCltr.sendMail =async (email, username) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })
    console.log(email,username)
    const html = `
    <h1>Thank You for Registering with PetBuddy!!</h1>
                      <p>Dear ${username}</p>
                       <p>I would like to express my gratitude for accessing your email account. Your prompt attention to this matter is greatly appreciated.</p>
                       <p>Should you require any further assistance or have any questions, please do not hesitate to contact us.</p>
                       <p>Best Regards,<br />The PetBuddy admin</p>
    `;
    try{
        const info = await
         transporter.sendMail({
            from:process.env.EMAIL,
            to: email,
            subject: "Register",
            html: html
        });
        console.log("Email sent",info.response);
    }catch(error){
        console.log("Error sending email:",error)
    }
}

//verifyotp
userCltr.verify=async(req, res) => {
    const errors = validationResult(req)
     if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() })
     }
     const { email, otp } = req.body
     
     try {
         const user = await User.findOne({ email: email },{otp:otp}).select('username email isVerified')
         console.log(user.otp)
         if (!user) {
             return res.status(404).json({ error: 'User not found' })
         };
         if (user.otp != otp) {
             return res.status(400).json({ error: 'Invalid OTP' })
         }
        user.isVerified=true
        user.email=email
        const username = user.username
        await user.save()
        console.log("userVerify",user)
        console.log("Username",username)
        await userCltr.sendMail(email,user.username)
        res.send('User Verified Successfully')
         
     } catch (err) {
         console.log(err)
         res.status(500).json({ error: 'Internal Server Error' })
     }
   }
   
//sendMail for loginForgetOTP
userCltr.forgetPasswordMail =async (email, username,otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })
    console.log(email,username)
    const html = `
       <p>Hi ${username}</p>
       <p>Your OTP is : ${otp}</p>
       <p>Note: Donnot share otp with any one<br />The PetBuddy admin</p>
    `;
    try{
        const info = await
         transporter.sendMail({
            from:process.env.EMAIL,
            to: email,
            subject: "ForgetPassword",
            html: html
        });
        console.log("Email sent",info.response);
    }catch(error){
        console.log("Error sending email:",error)
    }
}
  //forgetPassword  send otp via mail
  userCltr.forgetPassword = async (req, res) => {
    const errors = validationResult(req)
     if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() })
    }
    try {
         const body = req.body
        // console.log(body)
           const user = await User.findOne({ email: body.email })
             if (user) {
                const otp = generateOtp()
                userCltr.forgetPasswordMail(user.email,user.username,otp)
                res.status(200).json({message:"Email sent successfully"})
            }else{
                return res.status(404).json({ errors: 'email not found' })
        }
    }catch(err){
            console.log(err.message)
            res.status(500).json({ errors: 'Something went wrong' }) 
        }
}
//reset Password
userCltr.resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const {email,otp,newPassword}= req.body;
   
    try {
      const user = await User.findOne({ email:email });
      //console.log('User found:', user); // Check the user object received from the database
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.otp=otp
      await user.save()
     // console.log(user)
      if (user.otp !== Number(otp)) {
        //console.log(user.otp,typeof(otp))
        console.log(otp)
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      const salt = await bcryptjs.genSalt();
      const hashedPassword = await bcryptjs.hash(newPassword, salt);
      user.password = hashedPassword;
      user.otp = undefined;
      await user.save();
  
      console.log('Updated user:', user); // Check the user object after saving changes
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Error:', error); // Log any unexpected errors
      res.status(500).json({ message: 'Server error' });
    }
  };
  //update user
  userCltr.update = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {username,email,phoneNumber,role} = _.pick(req.body,["username","email","phoneNumber","role"])
    try{
        const body =_.pick(req.body,['username','email','phoneNumber','role'])
        const user = await User.findByIdAndUpdate(req.user.id,body,{new:true})
        return res.status(201).json(_.pick(user,['_id','username','email','phoneNumber','role','createdAt','updatedAt']))
    }catch(err){
        res.status(500).json({errors:"Something went wrong"})
    }
  }
  userCltr.delete = async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            res.status(404).send()
        }
        res.status(200).json(User)
    }catch(err){
        res.status(500).json({errors:"Something went Wrong"})
    }
  }

  
module.exports = userCltr;
