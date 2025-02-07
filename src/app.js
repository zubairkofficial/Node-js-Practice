import express from 'express';
import sequelize from './config/database.js';
import routes from './routes/index.js';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.Port || 3000;

app.use(express.json());
app.use('/api/v1', routes);

app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database Connection has been established successfully.');

        await sequelize.sync();
        console.log('Database synced Successfully.');

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();