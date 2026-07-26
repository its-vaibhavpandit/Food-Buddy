import { Schema, model } from 'mongoose';

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true }, // amount in paise
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    paymentMethod: { type: String, default: 'razorpay' },
    failureReason: { type: String },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundStatus: { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user: 1, createdAt: -1 });

export const Transaction = model('Transaction', transactionSchema);
