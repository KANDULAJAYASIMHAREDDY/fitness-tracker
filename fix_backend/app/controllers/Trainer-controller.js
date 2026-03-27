const Trainer = require('../models/Trainer-model');
const User = require('../models/User-model');
const { trainerValidationSchema } = require('../validations/Trainer-validation');
const populateAll = require('../utils/populateHelper');

const trainersCtrl = {};

trainersCtrl.create = async (req, res) => {
  try {
    const { error } = trainerValidationSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details });

    const userId = req.userId;
    const { name, specialization, experience, certifications, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ errors: 'User not found' });

    const existingTrainer = await Trainer.findOne({ userId });
    if (existingTrainer) return res.status(400).json({ errors: 'Trainer profile already exists' });

    const trainer = new Trainer({
      userId,
      name: name || user.name,
      specialization,
      experience,
      certifications,
      bio
    });

    await trainer.save();
    res.status(201).json({ message: 'Trainer created successfully', data: trainer });
  } catch (err) {
    console.error('Create trainer error:', err);
    res.status(500).json({ errors: 'Server error while creating trainer' });
  }
};

trainersCtrl.list = async (req, res) => {
  try {
    const trainers = await Trainer.find().populate('userId', 'name email role');
    res.json({ message: 'Trainers fetched successfully', data: trainers || [] });
  } catch (err) {
    res.status(500).json({ errors: 'Server error while fetching trainers' });
  }
};

trainersCtrl.show = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate('userId', 'name email role');
    if (!trainer) return res.status(404).json({ errors: 'Trainer not found' });
    res.json({ message: 'Trainer fetched successfully', data: trainer });
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

trainersCtrl.update = async (req, res) => {
  try {
    const allowed = ['name', 'specialization', 'experience', 'certifications', 'bio', 'isAvailable'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!trainer) return res.status(404).json({ errors: 'Trainer not found' });
    res.json({ message: 'Trainer updated successfully', data: trainer });
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

trainersCtrl.remove = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ errors: 'Trainer not found' });
    res.json({ message: 'Trainer deleted successfully' });
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

module.exports = trainersCtrl;
