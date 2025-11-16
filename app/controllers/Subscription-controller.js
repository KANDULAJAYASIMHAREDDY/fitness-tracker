const Subscription = require('../models/Subscription-model');
const Client =require('../models/Client-model');
const {subscriptionValidationSchema} = require('../validations/Subscription-validation');
const populateAll = require('../utils/populateHelper');



const subscriptionsCtrl = {};

// ✅ Create a new subscription
subscriptionsCtrl.create = async (req, res) => {
  try {
    const { error } = subscriptionValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const { clientId, planName, price, paymentStatus, startDate, endDate, paymentId } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ errors: 'Client not found' });

    const subscription = new Subscription({
      clientId,
      planName,
      price,
      paymentStatus,
      startDate,
      endDate,
      paymentId
    });

    await subscription.save();
    res.status(201).json(subscription);
  } catch (err) {
    console.error('Subscription Error:', err.message);
    res.status(500).json({ errors: 'Server error while creating subscription' });
  }
};

// ✅ List all subscriptions (Admin/Trainer)
subscriptionsCtrl.list = async (req, res) => {
  try {
    const subs = await Subscription.find().populate(populateAll('Subscription'));
    
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching subscriptions' });
  }
};

// ✅ Show single subscription
subscriptionsCtrl.show = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findById(id).populate(populateAll('Subscription'));
     
    if (!sub) return res.status(404).json({ errors: 'Subscription not found' });
    res.json(sub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching subscription' });
  }
};

// ✅ Update subscription (e.g., mark as paid)
subscriptionsCtrl.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Subscription.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ errors: 'Subscription not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while updating subscription' });
  }
};

// ✅ Delete subscription
subscriptionsCtrl.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subscription.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ errors: 'Subscription not found' });
    res.json({ message: 'Subscription deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while deleting subscription' });
  }
};

module.exports = subscriptionsCtrl;