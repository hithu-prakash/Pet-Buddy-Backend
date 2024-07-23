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
