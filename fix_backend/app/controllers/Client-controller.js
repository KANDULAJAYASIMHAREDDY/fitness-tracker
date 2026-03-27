const Client = require('../models/Client-model');
const User = require('../models/User-model');
const Trainer = require('../models/Trainer-model');
const { clientValidationSchema } = require('../validations/Client-validation');
const populateAll = require('../utils/populateHelper');

const clientsCtrl = {};

// Create client
clientsCtrl.create = async (req, res) => {
  try {
    const { error } = clientValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const { trainerId, goal, subscriptionStatus, progressId } = req.body;
    const userId = req.userId; // from token

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errors: 'User not found' });
    }

    // Check if client already exists for user
    const existingClient = await Client.findOne({ userId });
    if (existingClient) {
      return res.status(400).json({ errors: 'Client already exists' });
    }

    // Validate trainer if provided
    if (trainerId) {
      const trainer = await Trainer.findById(trainerId);
      if (!trainer) {
        return res.status(404).json({ errors: 'Trainer not found' });
      }
    }

    // ✅ Automatically pull name from User
    const client = new Client({
      userId,
      trainerId,
      name: user.name, // 👈 store client name
      goal,
      subscriptionStatus,
      progressId,
      approved: false,
    });

    await client.save();
    res.status(201).json({ message: 'Client created successfully', data: client });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ errors: 'Server error while creating client' });
  }
};

// Approve client (Admin only)
clientsCtrl.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    if (!client) return res.status(404).json({ errors: 'Client not found' });
    if (client.approved) return res.status(400).json({ errors: 'Client already approved' });

    client.approved = true;
    client.subscriptionStatus = 'active';
    await client.save();

    res.json({ message: 'Client approved successfully', data: client });
  } catch (err) {
    console.error('Approve client error:', err);
    res.status(500).json({ errors: 'Server error while approving client' });
  }
};

// List all clients (Admin)
clientsCtrl.list = async (req, res) => {
  try {
    const clients = await Client.find().populate("userId", "name email");
    res.json({ message: 'Clients fetched successfully', data: clients || [] });
  } catch (err) {
    console.error('List clients error:', err);
    res.status(500).json({ errors: 'Server error while fetching clients' });
  }
};

// Show single client
clientsCtrl.show = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id).populate(populateAll('Client'));

    if (!client) {
      return res.status(404).json({ errors: 'Client not found' });
    }

    res.json({ message: 'Client fetched successfully', data: client });
  } catch (err) {
    console.error('Show client error:', err);
    res.status(500).json({ errors: 'Server error while fetching client' });
  }
};

// Update client
clientsCtrl.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Optional: whitelist fields
    const allowedUpdates = ['goal', 'subscriptionStatus', 'trainerId', 'progressId'];
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
    }

    // ✅ If userId is present, refresh name from User
    if (updates.userId) {
      const user = await User.findById(updates.userId);
      if (user) {
        filteredUpdates.name = user.name;
      }
    }

    const client = await Client.findByIdAndUpdate(id, filteredUpdates, { new: true });
    if (!client) {
      return res.status(404).json({ errors: 'Client not found' });
    }

    res.json({ message: 'Client updated successfully', data: client });
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ errors: 'Server error while updating client' });
  }
};

// // ✅ Logged-in client profile
// clientsCtrl.me = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const client = await Client.findOne({ userId })
//       .populate({ path: 'userId', select: 'name email role' })
//       .populate({ path: 'trainerId', populate: { path: 'userId', select: 'name email role' } });

//     if (!client) {
//       return res.status(404).json({ errors: "Client profile not found" });
//     }

//     res.json({ message: "Client profile fetched successfully", data: client });
//   } catch (err) {
//     console.error("Fetch client profile error:", err);
//     res.status(500).json({ errors: "Server error while fetching client profile" });
//   }
// };




clientsCtrl.me = async (req, res) => {
  try {
    const userId = req.userId;
    const client = await Client.findOne({ userId }).populate(populateAll('Client'));

    if (!client) {
      return res.status(404).json({ errors: "Client profile not found" });
    }

    res.json({ message: "Client profile fetched successfully", data: client });
  } catch (err) {
    console.error("Fetch client profile error:", err);
    res.status(500).json({ errors: "Server error while fetching client profile" });
  }
};

// Delete client
clientsCtrl.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) return res.status(404).json({ errors: 'Client not found' });

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ errors: 'Server error while deleting client' });
  }
};

module.exports = clientsCtrl;