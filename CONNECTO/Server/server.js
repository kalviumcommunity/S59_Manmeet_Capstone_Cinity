const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const User = require('./models/User'); 
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        profilePicture: profile.photos[0].value 
      });
      await user.save();
    } else {
     
      user.profilePicture = profile.photos[0].value;
      await user.save();
    }

    
    const jwtToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

    return done(null, { user, token: jwtToken });
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((userData, done) => {
  done(null, userData);
});

passport.deserializeUser(async (userData, done) => {
  try {
    const user = await User.findById(userData.user._id);
    done(null, { user, token: userData.token });
  } catch (err) {
    done(err, null);
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
  
    res.cookie('token', req.user.token, { httpOnly: true });
    res.redirect('http://localhost:5173'); 
  }
);

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
};


app.get('/api/user', verifyToken, (req, res) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.json({
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      });
    })
    .catch(err => {
      console.error('Error fetching user:', err);
      res.status(500).send({ message: 'Server error' });
    });
});

app.get('/', (req, res) => {
  res.send('Welcome to CONNECTO!');
});

const handleError = (err, res) => {
  if (err.name === 'ValidationError') {
    res.status(400).send({
      message: 'Validation error',
      errors: err.errors
    });
  } else if (err.code === 11000) {
    res.status(400).send({
      message: 'Duplicate key error',
      error: 'Email already exists'
    });
  } else if (err instanceof mongoose.Error) {
    res.status(500).send({
      message: 'Database error occurred',
      error: err.message
    });
  } else {
    res.status(500).send({
      message: 'An unknown error occurred', 
      error: err.message
    });
  }
};

// Signup 
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Signup attempt:', { name, email });

    const hashedPassword = await bcrypt.hash(password, 5);
    console.log('Hashed Password:', hashedPassword);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    console.log('User created:', user);
    res.status(201).send(user);
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).send({ message: 'Signup failed. Please try again.' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    console.log('Generated JWT token:', token);

    res.cookie('token', token, { httpOnly: true });
    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send({ message: 'Login failed. Please try again.' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    handleError(err, res);
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({
        message: 'User not found'
      });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    res.status(200).send(user);
  } catch (err) {
    handleError(err, res);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
