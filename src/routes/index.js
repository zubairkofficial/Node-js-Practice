import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import userController from '../controllers/user.controller.js';
import authmiddleware from '../middlewares/auth.middleware.js';
import upload from '../Config/upload.js';
import RAGController from '../controllers/rag.controller.js';
import sequelize from '../config/database.js';


const router = express.Router();
const ragController = new RAGController();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file upload (for RAG uploads)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadDocument = multer({ storage: storage });

router.get('/test', async (req, res) => {
    try {
        console.log("Attempting to connect to the database...");
        const result = await pool.query('SELECT NOW()');
        console.log('Query executed successfully', result);

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Status</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f0f2f5;
                }
                .status-container {
                    background-color: #ffffff;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-align: center;
                }
                .status-icon {
                    color: #4CAF50;
                    font-size: 48px;
                    margin-bottom: 1rem;
                }
                .status-message {
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 0.5rem;
                }
                .timestamp {
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="status-container">
                <div class="status-icon">✅</div>
                <h1 class="status-message">Server is Up and Running</h1>
                <p class="timestamp">Database Connected Successfully at: ${result.rows[0].now}</p>
            </div>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Server Error</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f0f2f5;
                }
                .error-container {
                    background-color: #ffffff;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-align: center;
                }
                .error-icon {
                    color: #f44336;
                    font-size: 48px;
                    margin-bottom: 1rem;
                }
                .error-message {
                    color: #333;
                    font-size: 24px;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">❌</div>
                <h1 class="error-message">Internal Server Error</h1>
            </div>
        </body>
        </html>
        `);
    }
});

// User authentication routes
router.post('/signup', upload.single('profilePicture'), userController.signup);
router.post('/login', userController.login);
router.get('/getProfile', authmiddleware, userController.getProfile);
router.post('/generateUsername', userController.generateUsername);
router.put('/updateProfile', authmiddleware, upload.single('profilePicture'), userController.updateProfile);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/verifyOTP', userController.verifyOtp);
router.post('/resetPassword', userController.resetPassword);

// RAG-related routes (fixed multer middleware usage)
router.post('/rag/upload', uploadDocument.single('document'), ragController.processDocument.bind(ragController));
router.post('/rag/web', ragController.processWebPage.bind(ragController));

export default router;
