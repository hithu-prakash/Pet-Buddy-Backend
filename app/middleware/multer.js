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

module.exports=upload 
//const upload  = multer({ storage: storage, fileFilter: fileFilter })

//const storage = multer.memoryStorage()

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// })

// const fileFilter = (req, file, cb) => {
//     if ( file.mimetype === 'image/jpeg' ) {
//         cb(null, true); 
//     } else {
//         cb(new Error('Invalid file type'), false);
//     }
// };

//const upload  = multer({ storage: storage, fileFilter: fileFilter })

// const imageUpload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//       const allowedMimeTypes = ['image/jpeg', 'image/png'];
//       if (!allowedMimeTypes.includes(file.mimetype)) {
//         return cb(new Error('Only images are allowed'), false);
//       } else {
//         cb(null, true);
//       }
//     },
//   });

