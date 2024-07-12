const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET

})
const uploadToCloudinary = (file, options) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream( //object
        options,
          (error, result) => {
          if (error) {
            reject(error)
          }
          else {
            resolve(result);
          }
        }
      ).end(file)
    });
  };


module.exports=uploadToCloudinary