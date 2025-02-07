const express = require('express');
const router = express.Router();
import { RAGController } from '../controllers/rag.controller.js';
const multer = require('multer');
const fs = require('fs');

// Configure multer for file upload
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

const upload = multer({ storage: storage });
const ragController = new RAGController();

// Route for processing documents (PDF, DOCX, TXT)
router.post('/upload', upload.single('document'), ragController.processDocument.bind(ragController));

// Route for processing web pages
router.post('/web', ragController.processWebPage.bind(ragController));

module.exports = router; 