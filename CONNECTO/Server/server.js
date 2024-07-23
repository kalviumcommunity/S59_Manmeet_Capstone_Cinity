const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
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


app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send({
      message: 'Error creating user',
      error: err.message
    });
  }
});


app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    if (err instanceof mongoose.Error) {
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
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
