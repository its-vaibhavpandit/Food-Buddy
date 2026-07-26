export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  /** Price stored in paise (smallest currency unit) for precision */
  price: number;
  image: string;
  category: Category;
  isVeg: boolean;
  isAvailable: boolean;
  tags: string[];
  nutrition?: {
    calories: number; // in kCal
    protein: number;  // in grams
    carbs: number;    // in grams
    fat: number;      // in grams
  };
  moodTags?: string[];
  cityFame?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuFilters {
  category?: string;
  search?: string;
  isVeg?: boolean;
  sortBy?: "price_asc" | "price_desc" | "name" | "popular";
}
