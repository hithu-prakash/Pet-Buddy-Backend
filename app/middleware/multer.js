const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Only images and pdf are allowed'), false); // Reject file
    }
  }
});

module.exports = upload;







// const multer = require('multer')
// const path = require('path')

// // Configure storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/') // Ensure this is the correct relative path
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// })

// // Initialize multer with storage configuration
// const upload = multer({
//     storage: storage,
//     fileFilter: function (req, file, cb) {
//         const fileTypes = /jpeg|jpg|png/
//         const mimeType = fileTypes.test(file.mimetype)
//         const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())

//         if (mimeType && extname) {
//             return cb(null, true)
//         } else {
//             cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'))
//         }
//     },
//     limits: { fileSize: 2 * 1024 * 1024 } // 2 MB limit
// })

// module.exports = upload