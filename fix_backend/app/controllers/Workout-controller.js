const WorkoutPlan = require('../models/Workout-model');
const User = require('../models/User-model');
const Client = require('../models/Client-model');
const populateAll = require('../utils/populateHelper');

const workoutPlansCtrl = {};

workoutPlansCtrl.create = async (req, res) => {
  try {
    const { clientId, title, description, exercises, startDate, endDate, status } = req.body;

    if (!exercises || exercises.length === 0)
      return res.status(400).json({ errors: 'At least one exercise is required' });
    if (!startDate || !endDate)
      return res.status(400).json({ errors: 'startDate and endDate are required' });

    // Validate each exercise
    const validExercises = exercises.map((ex, i) => ({
      exerciseId: ex.exerciseId || `ex_${i}_${Date.now()}`,
      name: ex.name || `Exercise ${i + 1}`,
      target: ex.target || '',
      equipment: ex.equipment || '',
      sets: Number(ex.sets) || 1,
      reps: Number(ex.reps) || 1,
      restTime: Number(ex.restTime) || 30,
      notes: ex.notes || ''
    }));

    // Validate client exists if provided
    if (clientId) {
      const client = await Client.findById(clientId);
      if (!client) return res.status(404).json({ errors: 'Client not found' });
    }

    const workoutPlan = new WorkoutPlan({
      trainerId: req.userId,
      clientId: clientId || null,
      title: title || 'Workout Plan',
      description: description || '',
      exercises: validExercises,
      startDate,
      endDate,
      status: status || 'active'
    });

    await workoutPlan.save();
    res.status(201).json(workoutPlan);
  } catch (err) {
    console.error('Workout create error:', err);
    res.status(500).json({ errors: 'Server error while creating workout plan' });
  }
};

workoutPlansCtrl.list = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find().populate(populateAll('Workout'));
    res.json(plans);
  } catch (err) {
    res.status(500).json({ errors: 'Server error while fetching workout plans' });
  }
};

workoutPlansCtrl.clientPlans = async (req, res) => {
  try {
    const { clientId } = req.params;
    const plans = await WorkoutPlan.find({ clientId }).populate(populateAll('Workout'));
    res.json(plans);
  } catch (err) {
    res.status(500).json({ errors: 'Server error while fetching client plans' });
  }
};

workoutPlansCtrl.show = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id).populate(populateAll('Workout'));
    if (!plan) return res.status(404).json({ errors: 'Workout plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

workoutPlansCtrl.update = async (req, res) => {
  try {
    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlan) return res.status(404).json({ errors: 'Workout plan not found' });
    res.json(updatedPlan);
  } catch (err) {
    res.status(500).json({ errors: 'Server error while updating plan' });
  }
};

workoutPlansCtrl.remove = async (req, res) => {
  try {
    const deleted = await WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ errors: 'Workout plan not found' });
    res.json({ message: 'Workout plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ errors: 'Server error while deleting plan' });
  }
};

module.exports = workoutPlansCtrl;
