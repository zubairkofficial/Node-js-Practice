import multer from 'multer';
import path from 'path';

// set storage engine
const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {  // Added 'req' parameter
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// check File type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only');
    }
}

// Create multer upload instance with both storage and fileFilter
const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

export default upload;