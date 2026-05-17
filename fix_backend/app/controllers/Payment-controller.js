const Payment = require('../models/Payment-model');
const Subscription = require('../models/Subscription-model');
const Client = require('../models/Client-model');
const { paymentValidationSchema } = require('../validations/Payment-validation');
const populateAll = require('../utils/populateHelper');

const paymentsCtrl = {};

paymentsCtrl.create = async (req, res) => {
  try {
    const { error } = paymentValidationSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details });

    const { subscriptionId, clientId, amount, paymentMethod, transactionId, status } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return res.status(404).json({ errors: 'Subscription not found' });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ errors: 'Client not found' });

    const payment = new Payment({ subscriptionId, clientId, amount, paymentMethod, transactionId, status });
    await payment.save();

    if (status === 'success') {
      subscription.paymentStatus = 'paid';
      await subscription.save();
    }

    res.status(201).json(payment);
  } catch (err) {
    console.error('Payment Error:', err.message);
    res.status(500).json({ errors: 'Server error while creating payment' });
  }
};

paymentsCtrl.list = async (req, res) => {
  try {
    const payments = await Payment.find().populate(populateAll('Payment'));
    res.json(payments);
  } catch (err) {
    res.status(500).json({ errors: 'Server error while fetching payments' });
  }
};

paymentsCtrl.clientPayments = async (req, res) => {
  try {
    const { clientId } = req.params;
    const payments = await Payment.find({ clientId }).populate(populateAll('Payment'));
    res.json(payments);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

paymentsCtrl.show = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(populateAll('Payment'));
    if (!payment) return res.status(404).json({ errors: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

paymentsCtrl.update = async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ errors: 'Payment not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

paymentsCtrl.remove = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ errors: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ errors: 'Server error' });
  }
};

module.exports = paymentsCtrl;
