import { Schema, model } from 'mongoose';

const menuItemSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true }, // price in rupees/base unit (can support decimals or we can store in rupees directly, e.g. 150)
  image: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
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

export const MenuItem = model('MenuItem', menuItemSchema);
