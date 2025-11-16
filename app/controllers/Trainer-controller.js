const Trainer = require('../models/Trainer-model');
const User = require('../models/User-model');
const { trainerValidationSchema } = require('../validations/Trainer-validation');
const populateAll = require('../utils/populateHelper');

const trainersCtrl = {};

//  Create Trainer
trainersCtrl.create = async (req, res) => {
    try {
        // Validate request body (userId not needed in body)
        const { error } = trainerValidationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details });
        }

        //  Take userId from token (set in authenticateUser middleware)
        const userId = req.userId;
        const { specialization, experience, certifications, bio } = req.body;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ errors: 'User not found' });
        }

        // Check if this user already has a trainer profile
        const existingTrainer = await Trainer.findOne({ userId });
        if (existingTrainer) {
            return res.status(400).json({ errors: 'Trainer already exists' });
        }

        // Create new trainer profile
        const trainer = new Trainer({
            userId,
            specialization,
            experience,
            certifications,
            bio,
        });

        await trainer.save();
        res.status(201).json(trainer);
    } catch (err) {
        console.log(err);
        res.status(500).json({ errors: 'Server error while creating trainer' });
    }
};

//  List all trainers
trainersCtrl.list = async (req, res) => {
    try {
        const trainers = await Trainer.find().populate(populateAll('Trainer'));

        res.json(trainers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ errors: 'Server error while fetching trainers' });
    }
};

// Get trainer by ID
trainersCtrl.show = async (req, res) => {
    try {
        const { id } = req.params;

        const trainer = await Trainer.findById(id).populate(populateAll('Trainer'));
           

        if (!trainer) {
            return res.status(404).json({ errors: 'Trainer not found' });
        }

        res.json(trainer);
    } catch (err) {
        console.log(err);
        res.status(500).json({ errors: 'Server error while fetching trainer' });
    }
};

// Update trainer
trainersCtrl.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const trainer = await Trainer.findByIdAndUpdate(id, updates, { new: true });
        if (!trainer) {
            return res.status(404).json({ errors: 'Trainer not found' });
        }

        res.json(trainer);
    } catch (err) {
        console.log(err);
        res.status(500).json({ errors: 'Server error while updating trainer' });
    }
};

// Delete trainer
trainersCtrl.remove = async (req, res) => {
    try {
        const { id } = req.params;

        const trainer = await Trainer.findByIdAndDelete(id);
        if (!trainer) {
            return res.status(404).json({ errors: 'Trainer not found' });
        }

        res.json({ message: 'Trainer deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ errors: 'Server error while deleting trainer' });
    }
};

module.exports = trainersCtrl;
