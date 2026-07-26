import { Schema, model } from 'mongoose';

const menuItemSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', index: true },
  unsplashId: { type: String },
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  tags: [{ type: String }],
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  moodTags: [{ type: String }],
  cityFame: [{ type: String }]
}, {
  timestamps: true
});

menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1, isAvailable: 1 });

export const MenuItem = model('MenuItem', menuItemSchema);
