const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const configureDB = require('./config/DB');
configureDB();

const usersCtrl = require('./app/controllers/User-controller');
const trainersCtrl = require('./app/controllers/Trainer-controller');
const authenticateUser = require('./app/middlewares/authenticateUser');
const authorizerUser = require('./app/middlewares/authorizeUser');
const clientsCtrl = require('./app/controllers/Client-controller');
const progressTrackerCtrl = require('./app/controllers/Progress-controller');
const workoutPlansCtrl = require('./app/controllers/Workout-controller');
const dietPlansCtrl = require('./app/controllers/Diet-controller');
const subscriptionsCtrl = require('./app/controllers/Subscription-controller');
const paymentsCtrl = require('./app/controllers/Payment-controller');
const uploadCloudinary = require('./app/middlewares/upload-cloudinary');
const User = require('./app/models/User-model');
const Client = require('./app/models/Client-model');
const Trainer = require('./app/models/Trainer-model');

// -------------------- AUTH ROUTES --------------------
app.post('/user/register', usersCtrl.register);
app.post('/user/login', usersCtrl.login);
app.get('/user/account', authenticateUser, usersCtrl.account);
app.get('/user/list', authenticateUser, authorizerUser(['Admin']), usersCtrl.list);
app.put('/users/update/:id', authenticateUser, authorizerUser(['Admin']), usersCtrl.update);
app.delete('/users/delete/:id', authenticateUser, authorizerUser(['Admin']), usersCtrl.remove);

// Get all Client users (for dropdowns) - Trainer & Admin
app.get('/user/clients', authenticateUser, authorizerUser(['Trainer', 'Admin']), async (req, res) => {
  try {
    const clients = await Client.find().populate('userId', 'name email');
    const result = clients.map(c => ({
      _id: c._id,
      name: c.name || c.userId?.name || 'Client',
      email: c.userId?.email || '',
      userId: c.userId?._id || c.userId,
      goal: c.goal,
      approved: c.approved,
      subscriptionStatus: c.subscriptionStatus
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ errors: 'Server error fetching clients' });
  }
});

// Get all Trainer users (for dropdowns)
app.get('/user/trainers', authenticateUser, async (req, res) => {
  try {
    const trainers = await Trainer.find().populate('userId', 'name email');
    const result = trainers.map(t => ({
      _id: t._id,
      name: t.name || t.userId?.name || 'Trainer',
      email: t.userId?.email || '',
      specialization: t.specialization,
      experience: t.experience
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ errors: 'Server error fetching trainers' });
  }
});

// -------------------- TRAINER ROUTES --------------------
app.post('/trainer/create', authenticateUser, authorizerUser(['Trainer', 'Admin']), trainersCtrl.create);
app.get('/trainer/list', authenticateUser, trainersCtrl.list);
app.get('/trainer/:id', authenticateUser, trainersCtrl.show);
app.put('/trainer/:id', authenticateUser, authorizerUser(['Admin', 'Trainer']), trainersCtrl.update);
app.delete('/trainer/:id', authenticateUser, authorizerUser(['Admin', 'Trainer']), trainersCtrl.remove);

// -------------------- CLIENT ROUTES --------------------
app.post('/client/create', authenticateUser, clientsCtrl.create);
app.get('/client/list', authenticateUser, authorizerUser(['Admin', 'Trainer']), clientsCtrl.list);
app.post('/client/:id/approve', authenticateUser, authorizerUser(['Admin', 'Trainer']), clientsCtrl.approve);
app.get('/client/me', authenticateUser, clientsCtrl.me);
app.get('/client/:id', authenticateUser, clientsCtrl.show);
app.put('/client/:id', authenticateUser, authorizerUser(['Admin', 'Trainer', 'Client']), clientsCtrl.update);
app.delete('/client/:id', authenticateUser, authorizerUser(['Admin']), clientsCtrl.remove);

// -------------------- PROGRESS ROUTES --------------------
app.post('/progress/create', authenticateUser, authorizerUser(['Trainer', 'Admin']), progressTrackerCtrl.create);
app.get('/progress/list', authenticateUser, authorizerUser(['Trainer', 'Admin']), progressTrackerCtrl.list);
app.get('/progress/client/:clientId', authenticateUser, progressTrackerCtrl.listByClient);
app.get('/progress/:id', authenticateUser, progressTrackerCtrl.show);
app.put('/progress/:id', authenticateUser, authorizerUser(['Trainer', 'Admin']), progressTrackerCtrl.update);
app.delete('/progress/:id', authenticateUser, authorizerUser(['Admin', 'Trainer']), progressTrackerCtrl.remove);

// -------------------- WORKOUT ROUTES --------------------
app.post('/workout/create', authenticateUser, authorizerUser(['Trainer', 'Admin']), workoutPlansCtrl.create);
app.get('/workout/list', authenticateUser, authorizerUser(['Trainer', 'Admin']), workoutPlansCtrl.list);
app.get('/workout/client/:clientId', authenticateUser, workoutPlansCtrl.clientPlans);
app.get('/workout/:id', authenticateUser, workoutPlansCtrl.show);
app.put('/workout/:id', authenticateUser, authorizerUser(['Trainer', 'Admin']), workoutPlansCtrl.update);
app.delete('/workout/:id', authenticateUser, authorizerUser(['Admin', 'Trainer']), workoutPlansCtrl.remove);

// -------------------- DIET ROUTES --------------------
app.post('/diet/create', authenticateUser, authorizerUser(['Trainer', 'Admin']), dietPlansCtrl.create);
app.get('/diet/list', authenticateUser, dietPlansCtrl.list);
app.get('/diet/client/:clientId', authenticateUser, dietPlansCtrl.clientPlans);
app.get('/diet/:id', authenticateUser, dietPlansCtrl.show);
app.put('/diet/:id', authenticateUser, authorizerUser(['Trainer', 'Admin']), dietPlansCtrl.update);
app.delete('/diet/:id', authenticateUser, authorizerUser(['Admin', 'Trainer']), dietPlansCtrl.remove);

// -------------------- SUBSCRIPTION ROUTES --------------------
app.post('/subscription/create', authenticateUser, authorizerUser(['Admin', 'Trainer']), subscriptionsCtrl.create);
app.get('/subscription/list', authenticateUser, authorizerUser(['Admin', 'Trainer']), subscriptionsCtrl.list);
app.get('/subscription/client/:clientId', authenticateUser, subscriptionsCtrl.clientSubs);
app.get('/subscription/:id', authenticateUser, subscriptionsCtrl.show);
app.put('/subscription/:id', authenticateUser, authorizerUser(['Admin', 'Trainer']), subscriptionsCtrl.update);
app.delete('/subscription/:id', authenticateUser, authorizerUser(['Admin']), subscriptionsCtrl.remove);

// -------------------- PAYMENT ROUTES --------------------
app.post('/payment/create', authenticateUser, paymentsCtrl.create);
app.get('/payment/list', authenticateUser, authorizerUser(['Admin', 'Trainer']), paymentsCtrl.list);
app.get('/payment/client/:clientId', authenticateUser, paymentsCtrl.clientPayments);
app.get('/payment/:id', authenticateUser, paymentsCtrl.show);
app.put('/payment/:id', authenticateUser, authorizerUser(['Admin']), paymentsCtrl.update);
app.delete('/payment/:id', authenticateUser, authorizerUser(['Admin']), paymentsCtrl.remove);

// -------------------- UPLOAD ROUTES --------------------
// Upload a workout video clip to Cloudinary
app.post('/upload/video', authenticateUser, authorizerUser(['Admin', 'Trainer']), uploadCloudinary.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = req.file.path || req.file.secure_url || (req.file.filename ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${req.file.filename}` : null);
    if (!url) return res.status(500).json({ error: 'Upload succeeded but no URL returned. Check Cloudinary config.' });
    res.json({ url, public_id: req.file.filename || req.file.public_id });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ error: 'Video upload failed: ' + (err.message || 'Unknown error') });
  }
});

// Upload an image to Cloudinary (for profile pics, etc.)
app.post('/upload/image', authenticateUser, uploadCloudinary.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = req.file.path || req.file.secure_url;
    if (!url) return res.status(500).json({ error: 'Upload succeeded but no URL returned.' });
    res.json({ url, public_id: req.file.filename || req.file.public_id });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Image upload failed: ' + (err.message || 'Unknown error') });
  }
});

// -------------------- RAZORPAY ROUTES --------------------
app.post('/razorpay/create-order', authenticateUser, async (req, res) => {
  // Allow any authenticated user (Admin, Trainer, Client) to create a payment order
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return res.status(500).json({ error: 'Razorpay keys not configured in .env' });
    }
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id, key_secret });
    const { amount, currency = 'INR', receipt } = req.body;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    });
    res.json({ orderId: order.id, key: key_id, amount: order.amount });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

app.post('/razorpay/verify', authenticateUser, async (req, res) => {
  try {
    const crypto = require('crypto');
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', key_secret).update(body).digest('hex');
    if (expectedSignature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Signature mismatch' });
    }
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// -------------------- START --------------------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
