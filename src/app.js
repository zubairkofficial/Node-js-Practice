const express = require('express');
const sequelize = require('./Config/database');
const routes = require('./routes/index')
const path = require('path');
const cors = require('cors');

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
    }catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();