const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const indexRouter = require('./routes/index');
const todoRouter = require('./routes/todo');
const { addUser, checkUser, checkEmail } = require('./routes/users');
const { sendOTP } = require('./routes/sendOTP');

const app = express();
const PORT = 3000;

let signupDetails = {};
let currentEmail;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/todo', todoRouter);

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60000
    }
}));

app.get('/welcome', function (req, res) {
    if (req.session.username) {
        res.render('todo', { username: req.session.username });
    } else {
        res.redirect('/login');
    }
});

app.post('/login', async (req, res) => {
    // console.log("Login attempt for username:", req.body.username);
    const { username, password } = req.body;

    const user = await checkUser(username, password);
    // console.log("db user : ", user);

    if (user) {
        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.username = username
        req.session.isAuthenticated = true;
        console.log("user id : ", user._id);

        res.cookie('user_id', user._id, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        });

        console.log("Session after login:", req.session);
        res.redirect('/welcome');
    } else {
        res.send('Invalid username or password. <a href="/login">Try again</a>');
    }
});

app.get('/resend-otp', async (req, res) => {
    if (!currentEmail) {
        return res.status(400).json({ error: 'Email not found in session' });
    }

    try {
        const newOTP = await sendOTP(currentEmail);
        signupDetails.OTP = newOTP.toString();
        // console.log('New OTP sent:', newOTP);

        return res.json({ message: 'New OTP sent successfully' });
    } catch (error) {
        console.error("Error resending OTP:", error);
        return res.status(500).json({ error: 'Error resending OTP. Please try again.' });
    }
});



app.post('/signup', async (req, res) => {
    // console.log("I am in sign up ...");
    const { email, username, password } = req.body;

    try {
        const userExists = await checkEmail(email);

        if (!userExists) {
            const OTP = await sendOTP(email);
            signupDetails = { email, username, password, OTP: OTP.toString() };
            currentEmail = email;

            res.status(200).json({ redirectUrl: '/verify' });
        } else {
            res.status(400).json({ message: 'Username or email already exists' });
        }
    } catch (error) {
        console.error("Error during signup:", error);

        if (error.message === 'Username or email already exists') {
            res.status(400).json({ message: 'Username or email already exists' });
        } else {
            res.status(500).json({ message: `Error creating user: ${error.message}` });
        }
    }
});

app.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;

    console.log('OTP received: ', otp);
    console.log("signup OTP: ", signupDetails.OTP);

    if (otp === signupDetails.OTP) {
        const result = await addUser(signupDetails.email, signupDetails.username, signupDetails.password);
        if (result) {
            console.log("User created:", result);
            req.session.email = signupDetails.email;
            req.session.isAuth = true;
            console.log("OTP verified successfully");
            res.json({ message: 'OTP verified successfully' });

        } else {
            res.status(400).json({ error: 'Username already exists' });
        }
    } else {
        console.log("Invalid OTP");
        res.status(400).json({ error: 'Invalid OTP' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.clearCookie('user_id');
        res.redirect('/login');
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;