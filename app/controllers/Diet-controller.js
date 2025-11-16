const DietPlan = require('../models/Diet-model');
const Trainer = require('../models/Trainer-model');
const Client = require('../models/Client-model');
const { dietPlanValidationSchema } = require('../validations/Diet-validation');
const populateAll = require('../utils/populateHelper');

const dietPlansCtrl = {};

// ✅ Create diet plan
dietPlansCtrl.create = async (req, res) => {
  try {
    const { error } = dietPlanValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const { trainerId, clientId, meals, totalCalories, status } = req.body;

    // Check trainer exists
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ errors: 'Trainer not found' });

    // Check client exists
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ errors: 'Client not found' });

    const dietPlan = new DietPlan({
      trainerId,
      clientId,
      meals,
      totalCalories,
      status
    });

    await dietPlan.save();
    res.status(201).json(dietPlan);
  } catch (err) {
    console.error('DietPlan Error:', err.message);
    res.status(500).json({ errors: 'Server error while creating diet plan' });
  }
};

// ✅ List all diet plans (Admin/Trainer)
dietPlansCtrl.list = async (req, res) => {
  try {
    const plans = await DietPlan.find().populate(populateAll('Diet'));
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching diet plans' });
  }
};

// ✅ Show single diet plan
dietPlansCtrl.show = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await DietPlan.findById(id).populate(populateAll('Diet'));
      
    
    if (!plan) return res.status(404).json({ errors: 'Diet plan not found' });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching diet plan' });
  }
};

// ✅ Update diet plan
dietPlansCtrl.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await DietPlan.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ errors: 'Diet plan not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while updating diet plan' });
  }
};

// ✅ Delete diet plan
dietPlansCtrl.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DietPlan.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ errors: 'Diet plan not found' });
    res.json({ message: 'Diet plan deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while deleting diet plan' });
  }
};

module.exports = dietPlansCtrl;
