const User = require('../models/User-model');
const Client = require('../models/Client-model');
const Trainer = require('../models/Trainer-model');
const { userValidationSchema } = require('../validations/User-validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usersCtrl = {};

// Register
usersCtrl.register = async (req, res) => {
  const { error, value } = userValidationSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ errors: error.details });

  try {
    const { name, email, password, phonenumber, gender, age, role: requestedRole } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ errors: 'Email already registered' });

    // First user = Admin, then allow Trainer/Client self-register
    const adminExists = await User.findOne({ role: 'Admin' });
    let role;
    if (!adminExists) {
      role = 'Admin';
    } else if (requestedRole === 'Trainer') {
      role = 'Trainer';
    } else {
      role = 'Client'; // default
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, phonenumber, gender, age, role });
    await user.save();

    // Auto-create linked Client or Trainer document
    if (role === 'Client') {
      const existing = await Client.findOne({ userId: user._id });
      if (!existing) {
        await new Client({
          userId: user._id,
          name: user.name,
          goal: 'Get fit and healthy',
          subscriptionStatus: 'pending',
          approved: false
        }).save();
      }
    }

    if (role === 'Trainer') {
      const existing = await Trainer.findOne({ userId: user._id });
      if (!existing) {
        await new Trainer({
          userId: user._id,
          name: user.name,
          specialization: 'General Fitness',
          experience: 0
        }).save();
      }
    }

    // Return token so user is logged in immediately after register
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    const safe = user.toObject();
    delete safe.password;
    return res.status(201).json({ ...safe, token });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) return res.status(409).json({ errors: 'Email already registered' });
    return res.status(500).json({ errors: 'Something went wrong during registration' });
  }
};

// Login
usersCtrl.login = async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errors: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ errors: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    let clientId = null, trainerId = null;
    if (user.role === 'Client') {
      const client = await Client.findOne({ userId: user._id });
      if (client) clientId = client._id.toString();
    }
    if (user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ userId: user._id });
      if (trainer) trainerId = trainer._id.toString();
    }

    res.json({
      token,
      user: { _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      clientId,
      trainerId
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ errors: 'Server error during login' });
  }
};

// Account
usersCtrl.account = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ errors: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ errors: 'Error fetching account' });
  }
};

// List (Admin only)
usersCtrl.list = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ errors: 'Server error fetching users' });
  }
};

usersCtrl.update = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ errors: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ errors: 'Server error updating user' });
  }
};

usersCtrl.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ errors: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ errors: 'Server error deleting user' });
  }
};

module.exports = usersCtrl;
