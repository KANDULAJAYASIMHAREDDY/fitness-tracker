function populateAll(modelName) {
  switch (modelName) {
    case 'Trainer':
      return [
        { path: 'userId', select: 'name email role' },
        { path: 'clients', populate: { path: 'userId', select: 'name email role' } }
      ];

    case 'Client':
      return [
        { path: 'userId', select: 'name email role' },
        { path: 'trainerId', populate: { path: 'userId', select: 'name email role' } },
        { path: 'progressId' }
      ];

    case 'Workout':
      return [
        { path: 'trainerId', populate: { path: 'userId', select: 'name email role' } },
        { path: 'clientId', populate: { path: 'userId', select: 'name email role' } }
      ];

    case 'Diet':
      return [
        { path: 'trainerId', populate: { path: 'userId', select: 'name email role' } },
        { path: 'clientId', populate: { path: 'userId', select: 'name email role' } }
      ];

    case 'Progress':
      return [
        { path: 'clientId', populate: { path: 'userId', select: 'name email role' } }
      ];

    case 'Subscription':
      return [
        { path: 'clientId', populate: { path: 'userId', select: 'name email role' } }
      ];

    case 'Payment':
      return [
        { path: 'clientId', populate: { path: 'userId', select: 'name email role' } },
        { path: 'subscriptionId', select: 'planName price paymentStatus' }
      ];

    default:
      return [];
  }
}

module.exports = populateAll;
