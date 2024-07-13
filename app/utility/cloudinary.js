const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET

})
const uploadToCloudinary = (fileBuffer, options) => {
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
      ).end(fileBuffer)
    });
  };

  module.exports=uploadToCloudinary

// const uploader = (file, folder) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       file,
//       {
//         resource_type: "auto", // Corrected from resource: auto
//         folder: folder
//       },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result.url);
//       }
//     );
//   });
// };


// // const storage = new CloudinaryStorage({
// //   cloudinary: cloudinary,
// //   params: {
// //       folder: 'profile-photos', // Folder name in Cloudinary
// //       allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'] // Allowed file formats
// //   }
// // });

