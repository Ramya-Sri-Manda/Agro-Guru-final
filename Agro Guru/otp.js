const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');


const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "ramyamanda555@gmail.com",
        pass: "byvf dxwm honz sovb",
    },
});

// In-memory storage for storing OTPs (you may want to use a database in a real-world scenario)
const otpStorage = {};
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'otp.html'));
});
// Endpoint to generate and send OTP
app.post('/send-otp', (req, res) => {
    const email = req.body.email;

    // Generate OTP
    const otp = generateOTP();
    console.log(otp)

    // Store OTP in memory
    otpStorage[email] = otp;

    // Email configuration
    const mailOptions = {
        from: 'ramyamanda555@gmail.com', // replace with your email
        to: email,
        subject: 'Your OTP for Verification',
        text: `Your OTP is: ${otp}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    const email = req.body.email;
    const userOTP = req.body.otp;

    // Retrieve stored OTP
    const storedOTP = otpStorage[email];

    if (!storedOTP) {
        return res.status(400).json({ success: false, message: 'OTP not found' });
    }

    // Verify OTP
    if (userOTP === storedOTP) {
        // Clear OTP after successful verification
        delete otpStorage[email];
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
