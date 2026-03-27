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
        { path: 'progressId', populate: { path: 'clientId', select: 'goal subscriptionStatus' } } // ✅ only if progressId is ObjectId
      ];

   case 'Workout':
  return [
    { path: 'trainerId', select: 'name email role' },
    { path: 'clientId', select: 'name email role' }
  ];

    // case 'Diet':
    //   return [
    //     { path: 'trainerId', populate: { path: 'trainerId', select: 'name email role' } },
    //     { path: 'clientId', populate: { path: 'clientId', select: 'name email role' } }
    //   ];


  case 'Diet':
  return [
    { path: 'trainerId', select: 'name email role' },
    { 
      path: 'clientId', 
      select: 'name goal subscriptionStatus approved userId',
      populate: { path: 'userId', select: 'name email role' }
    }
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