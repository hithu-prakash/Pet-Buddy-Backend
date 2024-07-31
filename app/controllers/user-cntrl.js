const User= require('../models/user-model')
const nodemailer = require('nodemailer')
const { validationResult } = require('express-validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const twilio = require('twilio')
const _ = require('lodash')


const userCntrl = {}

// OTP configuration
const OTP_LENGTH = 6;
const OTP_CONFIG = {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
};
// Twilio credentials 
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_ACCOUNT_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

const client = twilio(accountSid, authToken)

// Generate OTP function
const generateOtp = () => {
    const otp = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
    return otp;
}

//Register 

// userCntrl.register = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//   }
//   const { username, phoneNumber, role } = req.body 
//   try {
//       const body = req.body;
//       const otp = generateOtp()
//       const salt = await bcryptjs.genSalt();
//       const hashPassword = await bcryptjs.hash(body.password, salt);
//       const role = (await User.countDocuments({})) === 0 ? 'admin' : body.role;
//       const user = new User(body);
//       user.password = hashPassword;
//       await user.save();
//       // await userCltr.sendSMS(username, phoneNumber, role,otp)
//       userCltr.registerOtpMail(user.username,user.email,role,otp)
//       res.status(201).json({ message: 'User registered. Please verify the OTP sent to your email.' });
//   } catch (err) {
//       console.log(err.message);
//       res.status(500).json({ errors: "something went wrong" });
//   }
// };

// // send SMS to register
// userCntrl.sendSMS = async (username, phoneNumber, role, otp) => {
//   let msgOptions = {
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: "+91" + phoneNumber,
//       body: `Hi ${username},, you are now successfully registered to PetBuddy with role: ${role}. Your OTP is: ${otp}`,
//   };
//   try {
//       const message = await client.messages.create(msgOptions);
//       console.log(`SMS sent to ${phoneNumber} with OTP.`);
//   } catch (error) {
//       console.error(`Error sending SMS to ${phoneNumber}:`, error);
//       throw new Error('Failed to send SMS');
//   }
// }

// //send opt mail for registration
// userCntrl.registerOtpMail =async (username,email,role,otp) => {
//   const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true,
//       auth: {
//           user: process.env.EMAIL,
//           pass: process.env.PASSWORD
//       }
//   })
//   console.log(email,username)
//   const html = `
//   <p>Hi ${username}.<br/> Enter the  OTP to complete successfully registration to PetBuddy with role: ${role}.<br/> Your OTP is: ${otp}</p>
//      <p>Note: Donot share otp with any one<br />The PetBuddy admin</p>
//   `;
//   try{
//       const info = await
//        transporter.sendMail({
//           from:process.env.EMAIL,
//           to: email,
//           subject: "RegisterOtp",
//           html: html
//       });
//       console.log("Email sent",info.response);
//   }catch(error){
//       console.log("Error sending email:",error)
//   }
// }


userCntrl.Register = async(req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }
   const { username, phoneNumber, role, otp } = req.body 
    
    try { 
        const body= req.body
        const otp = generateOtp()
        const noUser = await User.countDocuments()
        const salt = await bcryptjs.genSalt() 
        const hashPassword = await bcryptjs.hash(body.password, salt)
        const user = new User(body)
        user.password = hashPassword
        if(noUser == 0){
          user.role = 'admin'
      }
        await user.save() 
        
       await userCntrl.sendSMS(username, phoneNumber, role, otp)
        res.status(201).json(user) 
    } catch(err) {
        console.log(err.message)
        res.status(500).json({ errors: 'something went wrong'})
    }
}

// send SMS to register
userCntrl.sendSMS = async (username, phoneNumber, role, otp) => {
  let msgOptions = {
      from: twilioPhoneNumber,
      to: "+91" + phoneNumber,
      body: `Hi ${username}, you are now successfully registered to PetBuddy with role: ${role.toUpperCase()}. Your OTP is: ${otp}`,
  };
  try {
      const message = await client.messages.create(msgOptions);
      console.log(`SMS sent to ${phoneNumber} with OTP.`);
  } catch (error) {
      console.error(`Error sending SMS to ${phoneNumber}:`, error);
      throw new Error('Failed to send SMS');
  }
}

//verifyotp
userCntrl.verify=async(req, res) => {
    const errors = validationResult(req)
     if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() })
     }
     const { email, otp } = req.body
     
     try {
         const user = await User.findOne({ email: email },{otp:otp})
         //console.log(user.otp)
         
         if (!user) {
             return res.status(404).json({ error: 'record not found' })
         }
         if (user && user.otp != otp) {
             return res.status(400).json({ error: 'Invalid OTP' })
         }
         await User.findOneAndUpdate({ email: email }, { $set: { isVerified: true } }, { new: true })
         res.send('User Verified')
         user.otp = undefined

     } catch (err) {
         console.log(err)
         res.status(500).json({ error: 'Internal Server Error' })
     }
   }
    

//Login

userCntrl.Login = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(200).json({ errors: errors.array() });
    }
  
    try {
      const body = _.pick(req.body, ['email', 'password']);
      const user = await User.findOne({ email: body.email });
  
      if (user) {
        const isAuth = await bcryptjs.compare(body.password, user.password);
  
        if (isAuth) {
          const tokenData = {
            id: user._id,
            role: user.role
          };
          const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
            expiresIn: '7d'
          });
  
          const username = user.username;
          const email = user.email;
  
          
  
          return res.json({ token });
        }
      }
  
      return res.status(404).json({ errors: 'invalid email' });
      //userCntrl.SendSMS(username, phoneNumber, role)
    } catch (error) {
        console.log(error.message)
      return res.status(500).json({ errors: 'Internal Server Error' });
    }
  };
  

//nodemailer

userCntrl.forgetpasswordMail = (email, username, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  const html = `Hi ${username}, Your OTP is: ${otp}`;
  transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "ForgetPassword",
    html: html,
  });
}


//forgetPassword
userCntrl.forgetPassword = async (req, res) => {
  try {
    const body = req.body
    const user = await User.findOne({ email: body.email })
    if (user) {
      const otp = generateOtp()
      userCntrl.forgetpasswordMail(user.email, user.username, otp)
      res.status(200).json({ message: "Email Sent Successfully" })
    } else {
      res.status(404).json({ errors: 'Email not found' })
    }
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ errors: 'Something went wrong' })
  }
}


//to update the password
// userCntrl.resetPassword = async (req, res) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() })
//     }
//     const { otp, newPassword,confirmPassword } = _.pick(req.body, [ "otp","newPassword","confirmPassword"])
//     //console.log(password)
//     try {
//       const user = await User.findOne({ _id: req.user.id })
//       console.log(user)
      
//       if (!user) {
//         return res.status(404).json({ error: "record not found" })
//       }
//       const checkPassword = await bcryptjs.compare(newPassword , confirmPassword)
//       if (!checkPassword) {
//         return res.status(400).json({ error: "Invalid Password" })
//       }
//       const salt = await bcryptjs.genSalt()
//       const hashPassword = await bcryptjs.hash(newPassword, salt)
//       const user1 = await User.findOneAndUpdate(
//         { _id: req.user.id },
//         { $set: { newPassword: hashPassword } },
//         { new: true }
//       )
//       res.json(user1)
//     } catch (err) {
//       console.log(err.message)
//       res.status(500).json({ error: "Internal Server Error" })
//     }
//   }

userCntrl.resetPassword = async (req, res) => {
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



//account
userCntrl.Account = async(req,res) => {
    try {
        const user = await User.findById(req.user.id)
        return res.json(user)
    } catch(err) {
        return res.status(500).json({errors:'something went wrong'})
    }
}

//update user
userCntrl.Update = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { username, email, phoneNumber,role } = _.pick(req.body, ["username", "email","phoneNumber","role"])
    try {
        const body = _.pick(req.body, ['username', 'email', 'phoneNumber','role'])
        const user = await User.findByIdAndUpdate(req.user.id, body, { new: true })
        return res.status(201).json(_.pick(user, ['_id', 'username', 'email','phoneNumber', 'role', 'createdAt', 'updatedAt']))
    } catch (err) {
        res.status(500).json({ errors: "Something went wrong" })
    }
    
}

//delete user
userCntrl.Remove = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({error:errors.array()})
    }
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).send()
        }
        res.status(200).json(user)
    }catch(err){
        res.status(500).json({ errors: 'something went wrong'})
    }

  }

  
module.exports = userCntrl
    
        
    

