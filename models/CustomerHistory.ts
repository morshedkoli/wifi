import mongoose from 'mongoose';

const CustomerHistorySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  changes: {
    type: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    required: true
  },
  updatedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

export default mongoose.models.CustomerHistory || mongoose.model('CustomerHistory', CustomerHistorySchema);