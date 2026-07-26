import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  image: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Category = model('Category', categorySchema);
