import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    minlength: [11, 'Phone number must be at least 11 digits']
  },
  package: {
    type: String,
    enum: ['BASIC', 'STANDARD', 'PREMIUM'],
    required: [true, 'Package type is required'],
    default: 'BASIC'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  days: {
    type: Number,
    required: [true, 'Duration in days is required'],
    min: [1, 'Minimum 1 day required']
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'COMPLETED'],
    default: 'PENDING',
    required: true
  },
  month: {
    type: String,
    required: [true, 'Month is required']
  },
}, {
  timestamps: true,
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);