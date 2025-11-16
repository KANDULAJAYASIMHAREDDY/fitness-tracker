const WorkoutPlan = require('../models/Workout-model');
const Trainer =require('../models/Trainer-model');
const Client =require('../models/Client-model');
const {workoutPlanValidationSchema} = require('../validations/Workout-validation');
const populateAll = require('../utils/populateHelper');


const workoutPlansCtrl = {};

// ✅ Create a workout plan
workoutPlansCtrl.create = async (req, res) => {
  try {
    const { error } = workoutPlanValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const { trainerId, clientId, title, description, exercises, startDate, endDate, status } = req.body;

    // Check if trainer and client exist
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ errors: 'Trainer not found' });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ errors: 'Client not found' });

    const workoutPlan = new WorkoutPlan({
      trainerId,
      clientId,
      title,
      description,
      exercises,
      startDate,
      endDate,
      status
    });

    await workoutPlan.save();
    res.status(201).json(workoutPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while creating workout plan' });
  }
};

// ✅ List all workout plans (Admin/Trainer)
workoutPlansCtrl.list = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find().populate(populateAll('Workout'));
    
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching workout plans' });
  }
};

// ✅ Get one plan by ID
workoutPlansCtrl.show = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await WorkoutPlan.findById(id).populate(populateAll('Workout'));
     
    if (!plan) return res.status(404).json({ errors: 'Workout plan not found' });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching plan' });
  }
};

// ✅ Update a plan
workoutPlansCtrl.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedPlan) return res.status(404).json({ errors: 'Workout plan not found' });
    res.json(updatedPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while updating plan' });
  }
};

// ✅ Delete a plan
workoutPlansCtrl.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkoutPlan.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ errors: 'Workout plan not found' });
    res.json({ message: 'Workout plan deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while deleting plan' });
  }
};

module.exports = workoutPlansCtrl;