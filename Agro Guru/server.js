const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 4000; // Choose the desired port for your application

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://0.0.0.0:27017/newdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', () => {
    console.log("could not find");
});

db.once('open', () => {
    console.log("connected");
});

// MongoDB Schema and Model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});
const userModel = new mongoose.model('new', userSchema);

// Endpoint for home page
app.get("/", (req, res) => {
    console.log("server running on port " + port);
    return res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Endpoint for user registration
app.post("/sign_up", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const data = {
            "name": name,
            "email": email,
            "password": password,
        };

        await db.collection('new').insertOne(data);

        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint for contact form submission
app.post("/contactus", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const subject = req.body.subject;
        const message = req.body.message;

        const data = {
            "name": name,
            "email": email,
            "phone": phone,
            "subject": subject,
            "message": message
        };

        await db.collection('contacus').insertOne(data);

        const successMessage = 'Form submitted successfully';
        res.render('c', { responseMessage: successMessage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint for user login
app.post("/login", async (req, res) => {
    try {
        const userName = req.body.username;
        const password = req.body.password;

        const user = await db.collection('new').findOne({ email: userName });

        if (!user) {
            console.log('User not found');
            return res.send('User not found');
        }

        if (password === user.password) {
            console.log("Success");
            return res.sendFile(path.join(__dirname, 'public', 'index2.html'));
        } else {
            console.log("Password does not match");
            return res.send('Password does not match');
        }
    } catch (error) {
        console.error("error found");
        console.error(error);
        res.status(500).send('Internal Server Error');   
    }
});

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "ramyamanda555@gmail.com",
        pass: "byvf dxwm honz sovb",
    },
});

// In-memory storage for OTPs
const otpStorage = {};

// Endpoint to serve OTP verification page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'otp.html'));
});

// Endpoint to generate and send OTP
app.post('/send-otp', (req, res) => {
    const email = req.body.email;
    const otp = generateOTP();
    console.log(otp);

    otpStorage[email] = otp;

    const mailOptions = {
        from: 'ramyamanda555@gmail.com',
        to: email,
        subject: 'Your OTP for Verification',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    const email = req.body.email;
    const userOTP = req.body.otp;

    const storedOTP = otpStorage[email];

    if (!storedOTP) {
        return res.status(400).json({ success: false, message: 'OTP not found' });
    }

    if (userOTP === storedOTP) {
        delete otpStorage[email];
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
