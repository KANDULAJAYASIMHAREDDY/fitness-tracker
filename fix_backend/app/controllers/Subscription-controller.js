const Subscription = require('../models/Subscription-model');
const Client = require('../models/Client-model');
const { subscriptionValidationSchema } = require('../validations/Subscription-validation');
const populateAll = require('../utils/populateHelper');

const subscriptionsCtrl = {};

subscriptionsCtrl.create = async (req, res) => {
  try {
    const { error } = subscriptionValidationSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details });

    const { clientId, planName, price, paymentStatus, startDate, endDate, paymentId } = req.body;
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ errors: 'Client not found' });

    const subscription = new Subscription({ clientId, planName, price, paymentStatus, startDate, endDate, paymentId });
    await subscription.save();
    res.status(201).json(subscription);
  } catch (err) {
    console.error('Subscription Error:', err.message);
    res.status(500).json({ errors: 'Server error while creating subscription' });
  }
};

subscriptionsCtrl.list = async (req, res) => {
  try {
    const subs = await Subscription.find().populate(populateAll('Subscription'));
    res.json(subs);
  } catch (err) {
    res.status(500).json({ errors: 'Server error while fetching subscriptions' });
  }
};

subscriptionsCtrl.clientSubs = async (req, res) => {
  try {
    const { clientId } = req.params;
    const subs = await Subscription.find({ clientId }).populate(populateAll('Subscription'));
    res.json(subs);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

subscriptionsCtrl.show = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id).populate(populateAll('Subscription'));
    if (!sub) return res.status(404).json({ errors: 'Subscription not found' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

subscriptionsCtrl.update = async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ errors: 'Subscription not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

subscriptionsCtrl.remove = async (req, res) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ errors: 'Subscription not found' });
    res.json({ message: 'Subscription deleted successfully' });
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

module.exports = subscriptionsCtrl;
