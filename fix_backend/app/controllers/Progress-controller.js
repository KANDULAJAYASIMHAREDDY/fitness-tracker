// const ProgressTracker = require('../models/Progress-model');
// const Client = require('../models/Client-model');
// const {progressTrackerValidationSchema} = require('../validations/Progress-validation');
// const populateAll = require('../utils/populateHelper');


// const progressTrackerCtrl = {};

// // ✅ Create Progress Entry
// progressTrackerCtrl.create = async (req, res) => {
//   try {
//     const { error } = progressTrackerValidationSchema.validate(req.body, { abortEarly: false });
//     if (error) {
//       return res.status(400).json({ errors: error.details });
//     }

//     const { clientId, date, weight, bmi, bodyFat, caloriesBurned, workoutDuration, notes } = req.body;

//     // Check if client exists
//     const client = await Client.findById(clientId);
//     if (!client) {
//       return res.status(404).json({ errors: 'Client not found' });
//     }

//     // Create progress record
//     const progress = new ProgressTracker({
//       clientId,
//       date,
//       weight,
//       bmi,
//       bodyFat,
//       caloriesBurned,
//       workoutDuration,
//       notes
//     });

//     await progress.save();
//     res.status(201).json(progress);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ errors: 'Server error while creating progress record' });
//   }
// };

// // ✅ List all progress entries (Admin/Trainer)
// progressTrackerCtrl.list = async (req, res) => {
//   try {
//     const progressList = await ProgressTracker.find().populate(populateAll('Progress'))
    
//     res.json(progressList);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ errors: 'Server error while fetching progress list' });
//   }
// };

// // ✅ Show one progress entry
// progressTrackerCtrl.show = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const progress = await ProgressTracker.findById(id).populate(populateAll('Progress'));
    
//     if (!progress) return res.status(404).json({ errors: 'Progress record not found' });
//     res.json(progress);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ errors: 'Server error while fetching progress record' });
//   }
// };

// // ✅ Update progress entry
// progressTrackerCtrl.update = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
//     const updated = await ProgressTracker.findByIdAndUpdate(id, updates, { new: true });
//     if (!updated) return res.status(404).json({ errors: 'Progress record not found' });
//     res.json(updated);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ errors: 'Server error while updating progress record' });
//   }
// };

// // ✅ Delete progress entry
// progressTrackerCtrl.remove = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await ProgressTracker.findByIdAndDelete(id);
//     if (!deleted) return res.status(404).json({ errors: 'Progress record not found' });
//     res.json({ message: 'Progress record deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ errors: 'Server error while deleting progress record' });
//   }
// };

// module.exports = progressTrackerCtrl;




const ProgressTracker = require('../models/Progress-model');
const mongoose = require('mongoose');
const Client = require('../models/Client-model');
const { progressTrackerValidationSchema } = require('../validations/Progress-validation');
const populateAll = require('../utils/populateHelper');

const progressTrackerCtrl = {};

// ✅ Create Progress Entry
progressTrackerCtrl.create = async (req, res) => {
  try {
    const { error } = progressTrackerValidationSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details });

    const { clientId, date, weight, bmi, bodyFat, caloriesBurned, workoutDuration, notes } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ errors: 'Client not found' });

    const progress = new ProgressTracker({
      clientId, date, weight, bmi, bodyFat, caloriesBurned, workoutDuration, notes
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while creating progress record' });
  }
};

// ✅ List all progress entries (Admin/Trainer)
progressTrackerCtrl.list = async (req, res) => {
  try {
    const progressList = await ProgressTracker.find().populate(populateAll('Progress'));
    res.json(progressList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching progress list' });
  }
};



// ✅ List progress entries for a specific client
progressTrackerCtrl.listByClient = async (req, res) => {
   console.log("Backend received clientId:", req.params.clientId);

  try {
    const { clientId } = req.params;
      console.log("Received clientId:", clientId);
      if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ errors: 'Invalid client ID format' });
    }
    const progressList = await ProgressTracker.find({ clientId })
      .populate(populateAll('Progress'));

    res.json(progressList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching client progress' });
  }
};
// ✅ Show one progress entry
progressTrackerCtrl.show = async (req, res) => {
  try {
    const { id } = req.params;
    const progress = await ProgressTracker.findById(id).populate(populateAll('Progress'));
    if (!progress) return res.status(404).json({ errors: 'Progress record not found' });
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while fetching progress record' });
  }
};

// ✅ Update progress entry
progressTrackerCtrl.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await ProgressTracker.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ errors: 'Progress record not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while updating progress record' });
  }
};

// ✅ Delete progress entry
progressTrackerCtrl.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProgressTracker.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ errors: 'Progress record not found' });
    res.json({ message: 'Progress record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: 'Server error while deleting progress record' });
  }
};


module.exports = progressTrackerCtrl;