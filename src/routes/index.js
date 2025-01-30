const express = require('express');
const router = express.Router();
const pool = require('../Config/database');
const userController = require('../controllers/user.controller');
const authmiddleware = require('../middlewares/auth.middleware');
const upload = require('../Config/upload');


router.get('/test' , async (req , res) => {
    try {
        console.log("Attempting to connect to the database....");
        const result = await pool.query('SELECT NOW()');
        
        console.log('Query executed successfully' , result);
        res.json({
            message: 'Database connection successful',
        });        
    }catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/signup', upload.single('profilePicture'), userController.signup);
router.post('/login', userController.login);
router.get('/getProfile' , authmiddleware , userController.getProfile);
router.post('/generateUsername' , userController.generateUsername);
router.put('/updateProfile', authmiddleware, upload.single('profilePicture') , userController.updateProfile);


module.exports = router;