const DietPlan = require('../models/Diet-model');
const Trainer = require('../models/Trainer-model');
const Client = require('../models/Client-model');
const { dietPlanValidationSchema } = require('../validations/Diet-validation');
const populateAll = require('../utils/populateHelper');

const dietPlansCtrl = {};

dietPlansCtrl.create = async (req, res) => {
  try {
    const { trainerId, clientId, meals, totalCalories, status } = req.body;

    // Trainer doc lookup from logged-in user
    let resolvedTrainerId = trainerId;
    if (!resolvedTrainerId) {
      const trainerDoc = await Trainer.findOne({ userId: req.userId });
      if (trainerDoc) resolvedTrainerId = trainerDoc._id;
    }

    if (!resolvedTrainerId) return res.status(400).json({ errors: 'Trainer not found' });
    if (!clientId) return res.status(400).json({ errors: 'clientId is required' });
    if (!meals || meals.length === 0) return res.status(400).json({ errors: 'At least one meal is required' });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ errors: 'Client not found' });

    const calcTotal = totalCalories || meals.reduce((sum, m) => sum + (m.calories || 0), 0);

    const dietPlan = new DietPlan({
      trainerId: resolvedTrainerId,
      clientId,
      meals,
      totalCalories: calcTotal,
      status: status || 'active'
    });

    await dietPlan.save();
    res.status(201).json(dietPlan);
  } catch (err) {
    console.error('DietPlan Error:', err.message);
    res.status(500).json({ errors: 'Server error while creating diet plan' });
  }
};

dietPlansCtrl.list = async (req, res) => {
  try {
    const plans = await DietPlan.find().populate(populateAll('Diet'));
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching diet plans' });
  }
};

dietPlansCtrl.clientPlans = async (req, res) => {
  try {
    const { clientId } = req.params;
    const plans = await DietPlan.find({ clientId }).populate(populateAll('Diet'));
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching client diet plans' });
  }
};

dietPlansCtrl.show = async (req, res) => {
  try {
    const plan = await DietPlan.findById(req.params.id).populate(populateAll('Diet'));
    if (!plan) return res.status(404).json({ errors: 'Diet plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

dietPlansCtrl.update = async (req, res) => {
  try {
    const updated = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ errors: 'Diet plan not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

dietPlansCtrl.remove = async (req, res) => {
  try {
    const deleted = await DietPlan.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ errors: 'Diet plan not found' });
    res.json({ message: 'Diet plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

module.exports = dietPlansCtrl;
