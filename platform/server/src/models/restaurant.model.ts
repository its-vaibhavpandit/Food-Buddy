import { Schema, model } from 'mongoose';

const restaurantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    cuisine: [{ type: String, trim: true }],
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    ratingCount: { type: Number, default: 120 },
    deliveryTimeMinutes: { type: Number, default: 30 },
    priceForTwo: { type: Number, default: 30000 }, // in paise
    image: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    isOpen: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

restaurantSchema.index({ name: 'text', cuisine: 'text' });
restaurantSchema.index({ 'address.city': 1, isOpen: 1 });

export const Restaurant = model('Restaurant', restaurantSchema);
