const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendotpEmail = async (email, otp) => {
    try {
        const mailOptions = {  
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: `
            <h2>Password Reset Request</h2>
            <p>Your OTP for Password Reset is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return true;
    } catch (error) {
        console.log("Email sending error:", error);
        throw error; // Use the existing error object instead of creating a new one
    }
};

module.exports = { sendotpEmail };