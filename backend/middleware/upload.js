const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;
    if (file.fieldname === 'synopsis') {
      uploadPath = path.join(uploadsDir, 'synopsis');
    } else if (file.fieldname === 'checkpoint') {
      uploadPath = path.join(uploadsDir, 'checkpoints');
    } else if (file.fieldname === 'profile') {
      uploadPath = path.join(uploadsDir, 'profiles');
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|zip|rar|jpg|jpeg|png|mp4|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, PPT, ZIP, images and videos are allowed.'));
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760
  },
  fileFilter: fileFilter
});
module.exports = upload;
