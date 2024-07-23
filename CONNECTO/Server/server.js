const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User'); 
const app = express();
const port = process.env.PORT || 5001;

dotenv.config();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

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

app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    handleError(err, res);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    handleError(err, res);
  }
});

app.put('/users/:id', async (req, res) => {
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
