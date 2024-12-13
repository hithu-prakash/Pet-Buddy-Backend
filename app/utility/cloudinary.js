const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
    secure: true,
})
const uploadToCloudinary = (fileBuffer,options) =>{
    return new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream(
            options,(error,result)=>{
                if(error){
                    reject(error)
                }else{
                    resolve(result)
                }
            }
        ).end(fileBuffer)
    })
}

// Function to delete the old image
const deleteOldImage = async (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};
module.exports = {uploadToCloudinary,deleteOldImage}