const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  apiCalls: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  storageUsed: {
    type: Number,
    default: 0 // in MB
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Metric', metricSchema);
