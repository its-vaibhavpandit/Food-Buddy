import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { Category } from '../models/category.model.js';
import { MenuItem } from '../models/menu-item.model.js';
import { User } from '../models/user.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { slugify } from '../utils/slugify.js';
import { getFoodImageFromUnsplash } from '../utils/unsplash.js';

const CATEGORIES_DATA = [
  {
    name: 'Chinese',
    slug: 'chinese',
    description: 'Delectable Indo-Chinese fusion delicacies',
    image: '/images/noodles.jpg',
    sortOrder: 1,
    isActive: true
  },
  {
    name: 'North Indian',
    slug: 'north-indian',
    description: 'Rich, aromatic, and classic Indian mains',
    image: '/images/idli.png',
    sortOrder: 2,
    isActive: true
  },
  {
    name: 'Street Food',
    slug: 'street-food',
    description: 'Tangy, spicy, and crispy Indian street flavors',
    image: '/images/pani.png',
    sortOrder: 3,
    isActive: true
  },
  {
    name: 'Burgers',
    slug: 'burgers',
    description: 'Juicy burgers and classic American fast bites',
    image: '/images/burger.jpg',
    sortOrder: 4,
    isActive: true
  },
  {
    name: 'Drinks',
    slug: 'drinks',
    description: 'Refreshing sodas, shakes, and cold beverages',
    image: '/images/soda.png',
    sortOrder: 5,
    isActive: true
  },
  {
    name: 'Rolls',
    slug: 'rolls',
    description: 'Freshly wrapped tasty rolls and wraps',
    image: '/images/rolls.jpg',
    sortOrder: 6,
    isActive: true
  }
];

const BASE_MENU_ITEMS = [
  {
    name: 'Classic Cheeseburger',
    slug: 'classic-cheeseburger',
    description: 'Our classic cheeseburger with lettuce, tomato, and premium cheese.',
    price: 9900,
    image: '/images/burger.jpg',
    categorySlug: 'burgers',
    isVeg: false,
    isAvailable: true,
    tags: ['burger', 'fast-food', 'classic'],
    nutrition: { calories: 350, protein: 18, carbs: 32, fat: 16 },
    moodTags: ['happy', 'stressed', 'hungry'],
    cityFame: ['gzp', 'vns', 'luc']
  },
  {
    name: 'Refreshing Soda',
    slug: 'refreshing-soda',
    description: 'Fizz up your day — refreshment in every bubbly sip!',
    price: 3500,
    image: '/images/soda.png',
    categorySlug: 'drinks',
    isVeg: true,
    isAvailable: true,
    tags: ['beverage', 'cold', 'soda'],
    nutrition: { calories: 120, protein: 0, carbs: 30, fat: 0 },
    moodTags: ['tired', 'lazy'],
    cityFame: ['gzp', 'mau', 'bal']
  },
  {
    name: 'Margherita Pizza',
    slug: 'margherita-pizza',
    description: 'Slice into happiness where every bite is a cheesy adventure!',
    price: 25000,
    image: '/images/pizza.png',
    categorySlug: 'street-food',
    isVeg: true,
    isAvailable: true,
    tags: ['pizza', 'cheese', 'street-food'],
    nutrition: { calories: 680, protein: 24, carbs: 80, fat: 28 },
    moodTags: ['happy', 'celebratory', 'stressed'],
    cityFame: ['vns', 'luc', 'pra']
  },
  {
    name: 'Alfredo Pasta',
    slug: 'alfredo-pasta',
    description: 'Freshly made pasta, full of flavor, tossed in a creamy Alfredo sauce.',
    price: 5900,
    image: '/images/pasta.jpg',
    categorySlug: 'chinese',
    isVeg: true,
    isAvailable: true,
    tags: ['pasta', 'creamy', 'italian'],
    nutrition: { calories: 410, protein: 12, carbs: 54, fat: 18 },
    moodTags: ['lazy', 'stressed'],
    cityFame: ['vns', 'pra']
  },
  {
    name: 'Stir Fry Noodles',
    slug: 'stir-fry-noodles',
    description: 'Ready in minutes, made with quality ingredients and bursting with Indo-Chinese flavors.',
    price: 19900,
    image: '/images/noodles.jpg',
    categorySlug: 'chinese',
    isVeg: true,
    isAvailable: true,
    tags: ['noodles', 'chinese', 'stir-fry'],
    nutrition: { calories: 340, protein: 8, carbs: 56, fat: 10 },
    moodTags: ['hungry', 'lazy'],
    cityFame: ['gzp', 'vns', 'mau']
  },
  {
    name: 'Hyderabadi Biryani',
    slug: 'hyderabadi-biryani',
    description: 'Expertly crafted with authentic spices, fragrant long-grain basmati rice, layered to perfection.',
    price: 24900,
    image: '/images/biryani.jpg',
    categorySlug: 'north-indian',
    isVeg: false,
    isAvailable: true,
    tags: ['biryani', 'rice', 'royal'],
    nutrition: { calories: 550, protein: 22, carbs: 68, fat: 20 },
    moodTags: ['happy', 'celebratory', 'tired'],
    cityFame: ['vns', 'luc', 'pra']
  },
  {
    name: 'Chola Bhatura',
    slug: 'chola-bhatura',
    description: 'Rich, flavorful chickpea curry (chole) served with fluffy fried bread (bhature) and pickles.',
    price: 12900,
    image: '/images/chole-bhature.png',
    categorySlug: 'street-food',
    isVeg: true,
    isAvailable: true,
    tags: ['chola', 'bhatura', 'punjabi'],
    nutrition: { calories: 490, protein: 14, carbs: 62, fat: 22 },
    moodTags: ['hungry', 'happy', 'tired'],
    cityFame: ['vns', 'gzp', 'pra']
  },
  {
    name: 'Crispy Pani Puri',
    slug: 'crispy-pani-puri',
    description: 'Crispy hollow puris filled with spiced potato mash, served with tangy tamarind and spicy mint water.',
    price: 5000,
    image: '/images/pani.png',
    categorySlug: 'street-food',
    isVeg: true,
    isAvailable: true,
    tags: ['golgappa', 'panipuri', 'street-snack'],
    nutrition: { calories: 150, protein: 3, carbs: 24, fat: 4 },
    moodTags: ['happy', 'stressed', 'bored'],
    cityFame: ['vns', 'gzp', 'mau', 'bal', 'bha']
  },
  {
    name: 'Comforting Maggie',
    slug: 'comforting-maggie',
    description: 'Quick, tasty, and oh-so-comforting — your favorite vegetable masala Maggie fix!',
    price: 8900,
    image: '/images/maggie.png',
    categorySlug: 'street-food',
    isVeg: true,
    isAvailable: true,
    tags: ['maggie', 'noodles', 'snack'],
    nutrition: { calories: 280, protein: 6, carbs: 44, fat: 9 },
    moodTags: ['lazy', 'tired', 'stressed'],
    cityFame: ['gzp', 'mau', 'bal', 'bha']
  },
  {
    name: 'Golden Samosa',
    slug: 'golden-samosa',
    description: 'Crunch into bliss with golden-fried samosas packed with spiced potato and green pea filling.',
    price: 1500,
    image: '/images/samosa.png',
    categorySlug: 'street-food',
    isVeg: true,
    isAvailable: true,
    tags: ['samosa', 'fried', 'evening-snack'],
    nutrition: { calories: 180, protein: 4, carbs: 22, fat: 9 },
    moodTags: ['happy', 'lazy', 'bored'],
    cityFame: ['vns', 'gzp', 'bal']
  },
  {
    name: 'Classic Hotdog',
    slug: 'classic-hotdog',
    description: 'Soft bun with grilled sausage, dressed with ketchup, mustard, and crisp onions.',
    price: 11900,
    image: '/images/hotdog.png',
    categorySlug: 'burgers',
    isVeg: false,
    isAvailable: true,
    tags: ['hotdog', 'fast-food', 'sausage'],
    nutrition: { calories: 290, protein: 12, carbs: 28, fat: 14 },
    moodTags: ['happy', 'stressed'],
    cityFame: ['luc', 'vns']
  },
  {
    name: 'Fluffy Idli Sambhar',
    slug: 'fluffy-idli-sambhar',
    description: 'Soft, fluffy steamed rice cakes served with aromatic lentil sambhar and coconut chutney.',
    price: 4900,
    image: '/images/idli.png',
    categorySlug: 'north-indian',
    isVeg: true,
    isAvailable: true,
    tags: ['idli', 'south-indian', 'healthy'],
    nutrition: { calories: 160, protein: 6, carbs: 32, fat: 1 },
    moodTags: ['healthy', 'tired', 'lazy'],
    cityFame: ['vns', 'pra', 'luc']
  },
  {
    name: 'Chilli Potato',
    slug: 'chilli-potato',
    description: 'Spice up your snacking with chili potato that is crispy, tangy, sweet, and oh-so-addictive!',
    price: 8900,
    image: '/images/chillipotato.png',
    categorySlug: 'chinese',
    isVeg: true,
    isAvailable: true,
    tags: ['chilli-potato', 'chinese', 'snack'],
    nutrition: { calories: 310, protein: 4, carbs: 48, fat: 12 },
    moodTags: ['happy', 'stressed', 'bored'],
    cityFame: ['vns', 'gzp', 'mau']
  },
  {
    name: 'Spiced Aloo Tikki',
    slug: 'spiced-aloo-tikki',
    description: 'Crispy fried potato patties served with sweet curd, mint chutney, and tamarind syrup.',
    price: 4900,
    image: '/images/aloo-tikki.webp',
    categorySlug: 'street-food',
    isVeg: true,
    isAvailable: true,
    tags: ['aloo-tikki', 'chaat', 'street-snack'],
    nutrition: { calories: 240, protein: 5, carbs: 34, fat: 10 },
    moodTags: ['happy', 'stressed'],
    cityFame: ['vns', 'gzp', 'pra']
  },
  {
    name: 'Spring Rolls',
    slug: 'spring-rolls',
    description: 'Discover the crunch of fresh, vegetable-packed spring rolls served with sweet chilli sauce.',
    price: 13000,
    image: '/images/rolls.jpg',
    categorySlug: 'rolls',
    isVeg: true,
    isAvailable: true,
    tags: ['spring-roll', 'chinese', 'appetizer'],
    nutrition: { calories: 210, protein: 4, carbs: 26, fat: 10 },
    moodTags: ['happy', 'lazy'],
    cityFame: ['vns', 'luc']
  },
  {
    name: 'Veg Manchurian',
    slug: 'veg-manchurian',
    description: 'Savor the bold, tangy taste of veg dumplings cooked in rich, saucy Manchurian gravy.',
    price: 9900,
    image: '/images/manchurian.jpg',
    categorySlug: 'chinese',
    isVeg: true,
    isAvailable: true,
    tags: ['manchurian', 'gravy', 'chinese'],
    nutrition: { calories: 280, protein: 6, carbs: 32, fat: 14 },
    moodTags: ['happy', 'hungry'],
    cityFame: ['vns', 'luc', 'pra']
  }
];

// Generate 100+ Menu Items dynamically
const generateMenuItems = () => {
  const finalItems = [...BASE_MENU_ITEMS];
  const modifiers = [
    { prefix: 'Spicy', desc: 'Loaded with dynamic red chilli flakes and pepper.', priceAdd: 1000, calAdd: 40 },
    { prefix: 'Cheese Blast', desc: 'Overflowing with double melted liquid cheese.', priceAdd: 3000, calAdd: 150 },
    { prefix: 'Gourmet Double', desc: 'Double sized portion for extra indulgence.', priceAdd: 5000, calAdd: 250 },
    { prefix: 'Butter Masala', desc: 'Cooked in a rich cream and butter curry sauce.', priceAdd: 2500, calAdd: 120 },
    { prefix: 'Schezwan', desc: 'Tossed in fiery hot Schezwan house dressing.', priceAdd: 1500, calAdd: 30 },
    { prefix: 'Mint Diet', desc: 'Light, healthy portion prepared with low fat butter and organic mint.', priceAdd: -500, calAdd: -80 },
    { prefix: 'Tandoori Special', desc: 'Smoked in traditional clay oven for authentic flavor.', priceAdd: 2000, calAdd: 60 }
  ];

  const baseItemsToMultiply = [
    { name: 'Cheeseburger', base: BASE_MENU_ITEMS[0] },
    { name: 'Soda', base: BASE_MENU_ITEMS[1] },
    { name: 'Pizza', base: BASE_MENU_ITEMS[2] },
    { name: 'Pasta', base: BASE_MENU_ITEMS[3] },
    { name: 'Noodles', base: BASE_MENU_ITEMS[4] },
    { name: 'Biryani', base: BASE_MENU_ITEMS[5] },
    { name: 'Chola Bhatura', base: BASE_MENU_ITEMS[6] },
    { name: 'Pani Puri', base: BASE_MENU_ITEMS[7] },
    { name: 'Maggie', base: BASE_MENU_ITEMS[8] },
    { name: 'Samosa', base: BASE_MENU_ITEMS[9] },
    { name: 'Hotdog', base: BASE_MENU_ITEMS[10] },
    { name: 'Idli Sambhar', base: BASE_MENU_ITEMS[11] },
    { name: 'Chilli Potato', base: BASE_MENU_ITEMS[12] },
    { name: 'Aloo Tikki', base: BASE_MENU_ITEMS[13] },
    { name: 'Spring Rolls', base: BASE_MENU_ITEMS[14] },
    { name: 'Manchurian', base: BASE_MENU_ITEMS[15] }
  ];

  // We loop to multiply items until we cross 100
  let modifierIdx = 0;
  while (finalItems.length < 110) {
    for (const entry of baseItemsToMultiply) {
      const modifier = modifiers[modifierIdx % modifiers.length];
      const newName = `${modifier.prefix} ${entry.name}`;
      const newSlug = slugify(newName);

      // Verify no duplicates
      if (finalItems.some(i => i.slug === newSlug)) continue;

      const newPrice = entry.base.price + modifier.priceAdd;
      const newCalories = Math.max(50, entry.base.nutrition.calories + modifier.calAdd);

      const newItem = {
        name: newName,
        slug: newSlug,
        description: `${modifier.desc} ${entry.base.description}`,
        price: newPrice < 1000 ? 1500 : newPrice, // Ensure minimum price ₹15
        image: entry.base.image,
        categorySlug: entry.base.categorySlug,
        isVeg: entry.base.isVeg,
        isAvailable: true,
        tags: [...entry.base.tags, modifier.prefix.toLowerCase().replace(' ', '-')],
        nutrition: {
          calories: newCalories,
          protein: Math.max(1, Math.round(entry.base.nutrition.protein * (newCalories / entry.base.nutrition.calories))),
          carbs: Math.max(2, Math.round(entry.base.nutrition.carbs * (newCalories / entry.base.nutrition.calories))),
          fat: Math.max(0, Math.round(entry.base.nutrition.fat * (newCalories / entry.base.nutrition.calories)))
        },
        moodTags: [...entry.base.moodTags, modifier.prefix.toLowerCase() === 'mint diet' ? 'healthy' : 'hungry'],
        cityFame: entry.base.cityFame
      };

      finalItems.push(newItem);
      if (finalItems.length >= 110) break;
    }
    modifierIdx++;
  }

  return finalItems;
};

// Seeding function
const seed = async () => {
  try {
    console.log('🌱 Starting Database Seeding (Admin & 100+ Menu Items)...');
    await connectDB();
    console.log('📡 Connected to MongoDB');

    // 1. Seed admin accounts
    await User.deleteMany({ role: 'admin' });
    console.log('🧹 Cleaned existing admin users');

    const adminAccounts = [
      { name: 'Admin Pritam', email: 'pritam@fastfood.com', password: 'AdminPassword123', role: 'admin' },
      { name: 'Admin Vaibhav', email: 'vaibhav@fastfood.com', password: 'AdminPassword123', role: 'admin' },
      { name: 'Admin Abhishek', email: 'abhishek@fastfood.com', password: 'AdminPassword123', role: 'admin' },
      { name: 'Admin Himanshu', email: 'himanshu@fastfood.com', password: 'AdminPassword123', role: 'admin' },
      { name: 'Admin Demo', email: 'admin1@fastfood.com', password: 'AdminPassword123', role: 'admin' }
    ];

    // Mongoose schema has pre('save') that will hash these passwords automatically!
    for (const admin of adminAccounts) {
      await User.create(admin);
    }
    console.log(`✅ Seeded ${adminAccounts.length} demo admin accounts!`);

    // 2. Clean up Menu Items & Categories
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🧹 Cleaned existing categories and menu items');

    // 3. Populate Categories with Unsplash URLs
    const categoriesWithUnsplash = await Promise.all(
      CATEGORIES_DATA.map(async (cat) => ({
        ...cat,
        image: await getFoodImageFromUnsplash(cat.name),
      }))
    );

    const insertedCategories = await Category.insertMany(categoriesWithUnsplash);
    console.log(`✅ Seeded ${insertedCategories.length} categories with Unsplash images!`);

    // Map categories slug to _id for fast retrieval
    const categoryMap = insertedCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    // Generate 100+ menu items
    const generatedItems = generateMenuItems();
    console.log(`🌀 Generated ${generatedItems.length} menu items. Fetching Unsplash images...`);

    // Prepare Menu Items with Category IDs & Unsplash Images
    const menuItemsToInsert = await Promise.all(
      generatedItems.map(async (item) => {
        const categoryId = categoryMap[item.categorySlug];
        if (!categoryId) {
          throw new Error(`Category not found for slug: ${item.categorySlug}`);
        }

        const unsplashImage = await getFoodImageFromUnsplash(item.name);
        const { categorySlug, ...rest } = item;
        return {
          ...rest,
          image: unsplashImage,
          category: categoryId,
        };
      })
    );

    // Insert Menu Items
    const insertedMenuItems = await MenuItem.insertMany(menuItemsToInsert);
    console.log(`✅ Seeded ${insertedMenuItems.length} menu items with Unsplash URLs into database!`);

    // 4. Seed Restaurants & Distribute Admin Ownership
    await Restaurant.deleteMany({});
    console.log('🧹 Cleaned existing restaurants');

    const createdAdmins = await User.find({ role: 'admin' });
    const adminMap = createdAdmins.reduce((acc, u) => {
      acc[u.email] = u._id;
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    const RESTAURANTS_DATA = [
      // 🟢 Pritam's Assigned Outlets (LPU Campus & Delhi + Gurgaon)
      {
        name: 'Fast Food Buddy — LPU Campus Express',
        slug: 'fast-food-buddy-lpu-campus-express',
        cuisine: ['Fast Food', 'Street Food', 'Shakes', 'Burgers'],
        rating: 4.9,
        deliveryTimeMinutes: 15,
        priceForTwo: 20000,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Block 38, LPU Campus', city: 'Phagwara', state: 'Punjab', zipCode: '144411' },
        isOpen: true,
        owner: adminMap['pritam@fastfood.com'],
      },
      {
        name: 'Fast Food Buddy — Connaught Place Flagship',
        slug: 'fast-food-buddy-connaught-place-flagship',
        cuisine: ['Premium Burgers', 'Pizzas', 'Gourmet Street Food'],
        rating: 4.9,
        deliveryTimeMinutes: 25,
        priceForTwo: 40000,
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Inner Circle, E-Block, Connaught Place', city: 'Delhi', state: 'Delhi', zipCode: '110001' },
        isOpen: true,
        owner: adminMap['pritam@fastfood.com'],
      },
      {
        name: 'Fast Food Buddy — Cyber City Hub',
        slug: 'fast-food-buddy-cyber-city-hub',
        cuisine: ['Artisan Burgers', 'Healthy Bowls', 'Cold Brews'],
        rating: 4.8,
        deliveryTimeMinutes: 25,
        priceForTwo: 45000,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
        address: { street: 'DLF Cyber City, Phase 2', city: 'Gurgaon', state: 'Haryana', zipCode: '122002' },
        isOpen: true,
        owner: adminMap['pritam@fastfood.com'],
      },

      // 🔵 Vaibhav's Assigned Outlets
      {
        name: 'Fast Food Buddy — Model Town Central',
        slug: 'fast-food-buddy-model-town-central',
        cuisine: ['North Indian', 'Chinese', 'Fast Food'],
        rating: 4.8,
        deliveryTimeMinutes: 20,
        priceForTwo: 25000,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Model Town Main Market', city: 'Jalandhar', state: 'Punjab', zipCode: '144003' },
        isOpen: true,
        owner: adminMap['vaibhav@fastfood.com'],
      },
      {
        name: 'Fast Food Buddy — Sector 17 Plaza',
        slug: 'fast-food-buddy-sector-17-plaza',
        cuisine: ['Loaded Fries', 'Shakes', 'Continental Snacks'],
        rating: 4.8,
        deliveryTimeMinutes: 20,
        priceForTwo: 30000,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Main Commercial Plaza, Sector 17C', city: 'Chandigarh', state: 'Chandigarh', zipCode: '160017' },
        isOpen: true,
        owner: adminMap['vaibhav@fastfood.com'],
      },
      {
        name: 'Fast Food Buddy — Civil Lines Bistro',
        slug: 'fast-food-buddy-civil-lines-bistro',
        cuisine: ['North Indian', 'Street Snacks', 'Shakes'],
        rating: 4.8,
        deliveryTimeMinutes: 20,
        priceForTwo: 25000,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Tashkent Marg, Civil Lines', city: 'Prayagraj', state: 'Uttar Pradesh', zipCode: '211001' },
        isOpen: true,
        owner: adminMap['vaibhav@fastfood.com'],
      },

      // 🟣 Abhishek's Assigned Outlets
      {
        name: 'Fast Food Buddy — Hazratganj Royal Lounge',
        slug: 'fast-food-buddy-hazratganj-royal-lounge',
        cuisine: ['Mughlai Rolls', 'Kebabs', 'Fast Bites'],
        rating: 4.8,
        deliveryTimeMinutes: 25,
        priceForTwo: 35000,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
        address: { street: 'MG Marg, Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226001' },
        isOpen: true,
        owner: adminMap['abhishek@fastfood.com'],
      },
      {
        name: 'Fast Food Buddy — Station Road Hub',
        slug: 'fast-food-buddy-station-road-hub',
        cuisine: ['Samosa', 'Chaat', 'Chowmein', 'Rolls'],
        rating: 4.7,
        deliveryTimeMinutes: 15,
        priceForTwo: 18000,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Station Road, Near Tanki Ghat', city: 'Ghazipur', state: 'Uttar Pradesh', zipCode: '233001' },
        isOpen: true,
        owner: adminMap['abhishek@fastfood.com'],
      },
      {
        name: 'Fast Food Buddy — Bandra West Studio',
        slug: 'fast-food-buddy-bandra-west-studio',
        cuisine: ['Gourmet Sliders', 'Craft Pizzas', 'Thick Shakes'],
        rating: 4.9,
        deliveryTimeMinutes: 30,
        priceForTwo: 50000,
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Hill Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
        isOpen: true,
        owner: adminMap['abhishek@fastfood.com'],
      },

      // 🟠 Himanshu's Assigned Outlets
      {
        name: 'Fast Food Buddy — BHU Lanka Junction',
        slug: 'fast-food-buddy-bhu-lanka-junction',
        cuisine: ['Street Food', 'Biryani', 'Momos', 'Beverages'],
        rating: 4.9,
        deliveryTimeMinutes: 20,
        priceForTwo: 22000,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Opp. BHU Gate, Lanka', city: 'Varanasi', state: 'Uttar Pradesh', zipCode: '221005' },
        isOpen: true,
        owner: adminMap['himanshu@fastfood.com'],
      },
      {
        name: 'Fast Food Buddy — Sector 18 Express',
        slug: 'fast-food-buddy-sector-18-express',
        cuisine: ['Indo-Chinese', 'Pasta', 'Wraps'],
        rating: 4.7,
        deliveryTimeMinutes: 20,
        priceForTwo: 28000,
        image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&auto=format&fit=crop&q=80',
        address: { street: 'Near Atta Market, Sector 18', city: 'Noida', state: 'Uttar Pradesh', zipCode: '201301' },
        isOpen: true,
        owner: adminMap['himanshu@fastfood.com'],
      },
      {
        name: 'Fast Food Buddy — Indiranagar Hub',
        slug: 'fast-food-buddy-indiranagar-hub',
        cuisine: ['Gourmet Burgers', 'Craft Shakes', 'Finger Foods'],
        rating: 4.8,
        deliveryTimeMinutes: 25,
        priceForTwo: 42000,
        image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&auto=format&fit=crop&q=80',
        address: { street: '100 Feet Road, Indiranagar', city: 'Bangalore', state: 'Karnataka', zipCode: '560038' },
        isOpen: true,
        owner: adminMap['himanshu@fastfood.com'],
      },
    ];

    const insertedRestaurants = await Restaurant.insertMany(RESTAURANTS_DATA);
    console.log(`✅ Seeded ${insertedRestaurants.length} restaurants with distributed admin owners!`);

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${(error as Error).message}`);
    process.exit(1);
  }
};

seed();
