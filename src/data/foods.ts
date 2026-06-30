export interface FoodItem {
  id: string;
  name: string;
  category: 'Proteins' | 'Carbohydrates' | 'Fats' | 'Dairy' | 'Fruits & Veg' | 'Snacks & Extras';
  servingText: string;
  servingSizeGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isQuantity?: boolean;
  servingUnit?: string;
}

export const foodsData: FoodItem[] = [
  // --- PROTEINS ---
  { id: 'p1', name: 'Chicken Breast (Cooked, skinless)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  { id: 'p2', name: 'Turkey Breast (Cooked, skinless)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 135, protein: 30.0, carbs: 0.0, fat: 1.1 },
  { id: 'p3', name: 'Lean Beef (90/10, Cooked)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 217, protein: 26.1, carbs: 0.0, fat: 11.8 },
  { id: 'p4', name: 'Salmon Fillet (Cooked)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 206, protein: 22.0, carbs: 0.0, fat: 13.0 },
  { id: 'p5', name: 'Tuna (Canned in Water, drained)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 116, protein: 26.0, carbs: 0.0, fat: 1.0 },
  { id: 'p6', name: 'Shrimp (Cooked)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 99, protein: 24.0, carbs: 0.2, fat: 0.3 },
  { id: 'p7', name: 'Tofu (Firm)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 76, protein: 8.0, carbs: 1.9, fat: 4.8 },
  { id: 'p8', name: 'Whole Egg', category: 'Proteins', servingText: '1 large (50g)', servingSizeGrams: 50, calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, isQuantity: true, servingUnit: 'egg' },
  { id: 'p9', name: 'Egg Whites', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2 },
  { id: 'p10', name: 'Whey Protein Powder', category: 'Proteins', servingText: '1 scoop (30g)', servingSizeGrams: 30, calories: 120, protein: 24.0, carbs: 3.0, fat: 1.5 },
  { id: 'p11', name: 'Casein Protein Powder', category: 'Proteins', servingText: '1 scoop (30g)', servingSizeGrams: 30, calories: 110, protein: 24.0, carbs: 1.0, fat: 1.0 },
  { id: 'p12', name: 'Pork Tenderloin (Cooked)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 143, protein: 26.2, carbs: 0.0, fat: 3.5 },
  { id: 'p13', name: 'White Fish (Cod/Tilapia, Cooked)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 95, protein: 20.0, carbs: 0.0, fat: 1.5 },
  { id: 'p14', name: 'Seitan', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 370, protein: 75.0, carbs: 14.0, fat: 1.9 },
  { id: 'p15', name: 'Tempeh', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 193, protein: 19.0, carbs: 9.0, fat: 11.0 },
  { id: 'p16', name: 'Bison (Cooked)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 179, protein: 28.0, carbs: 0.0, fat: 7.0 },
  { id: 'p17', name: 'Canned Sardines (in Spring Water)', category: 'Proteins', servingText: '100g', servingSizeGrams: 100, calories: 208, protein: 25.0, carbs: 0.0, fat: 11.5 },

  // --- CARBOHYDRATES ---
  { id: 'c1', name: 'White Rice (Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3 },
  { id: 'c2', name: 'Brown Rice (Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9 },
  { id: 'c3', name: 'Rolled Oats (Raw)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
  { id: 'c4', name: 'White Bread', category: 'Carbohydrates', servingText: '1 slice (25g)', servingSizeGrams: 25, calories: 67, protein: 2.0, carbs: 13.0, fat: 1.0, isQuantity: true, servingUnit: 'slice' },
  { id: 'c5', name: 'Whole Wheat Bread', category: 'Carbohydrates', servingText: '1 slice (28g)', servingSizeGrams: 28, calories: 69, protein: 3.6, carbs: 12.0, fat: 0.9, isQuantity: true, servingUnit: 'slice' },
  { id: 'c6', name: 'Sweet Potato (Boiled/Baked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1 },
  { id: 'c7', name: 'Potato (Boiled/Baked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1 },
  { id: 'c8', name: 'Quinoa (Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
  { id: 'c9', name: 'Pasta (White, Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 158, protein: 5.8, carbs: 30.9, fat: 0.9 },
  { id: 'c10', name: 'Pasta (Whole Wheat, Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 124, protein: 5.3, carbs: 26.5, fat: 0.5 },
  { id: 'c11', name: 'Flour Tortilla', category: 'Carbohydrates', servingText: '1 medium (45g)', servingSizeGrams: 45, calories: 140, protein: 4.0, carbs: 22.0, fat: 3.5 },
  { id: 'c12', name: 'Corn Tortilla', category: 'Carbohydrates', servingText: '1 medium (30g)', servingSizeGrams: 30, calories: 60, protein: 1.4, carbs: 12.0, fat: 0.7 },
  { id: 'c13', name: 'Rice Cakes (Plain)', category: 'Carbohydrates', servingText: '1 cake (9g)', servingSizeGrams: 9, calories: 35, protein: 0.7, carbs: 7.3, fat: 0.3 },
  { id: 'c14', name: 'Cream of Wheat (Dry)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 360, protein: 10.0, carbs: 78.0, fat: 1.0 },
  { id: 'c15', name: 'Canned Chickpeas (Drained)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  { id: 'c16', name: 'Lentils (Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4 },
  { id: 'c17', name: 'Red Kidney Beans (Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5 },
  { id: 'c18', name: 'Basmati Rice (Raw)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 356, protein: 7.0, carbs: 77.0, fat: 1.0 },
  { id: 'c19', name: 'Jasmine Rice (Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 129, protein: 2.5, carbs: 28.0, fat: 0.2 },
  { id: 'c20', name: 'Mashed Potatoes (No butter/milk)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 83, protein: 1.7, carbs: 19.0, fat: 0.1 },
  { id: 'c21', name: 'Couscous (Cooked)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 112, protein: 3.8, carbs: 23.0, fat: 0.2 },
  { id: 'c22', name: 'Granola (Store-bought)', category: 'Carbohydrates', servingText: '100g', servingSizeGrams: 100, calories: 471, protein: 10.0, carbs: 64.0, fat: 20.0 },

  // --- FATS ---
  { id: 'f1', name: 'Extra Virgin Olive Oil', category: 'Fats', servingText: '1 tbsp (14g)', servingSizeGrams: 14, calories: 119, protein: 0.0, carbs: 0.0, fat: 13.5 },
  { id: 'f2', name: 'Coconut Oil', category: 'Fats', servingText: '1 tbsp (14g)', servingSizeGrams: 14, calories: 117, protein: 0.0, carbs: 0.0, fat: 13.6 },
  { id: 'f3', name: 'Unsalted Butter', category: 'Fats', servingText: '1 tbsp (14g)', servingSizeGrams: 14, calories: 102, protein: 0.1, carbs: 0.1, fat: 11.5 },
  { id: 'f4', name: 'Ghee (Clarified Butter)', category: 'Fats', servingText: '1 tbsp (14g)', servingSizeGrams: 14, calories: 120, protein: 0.0, carbs: 0.0, fat: 14.0 },
  { id: 'f5', name: 'Natural Peanut Butter', category: 'Fats', servingText: '1 tbsp (16g)', servingSizeGrams: 16, calories: 94, protein: 3.5, carbs: 3.1, fat: 8.1 },
  { id: 'f6', name: 'Almond Butter', category: 'Fats', servingText: '1 tbsp (16g)', servingSizeGrams: 16, calories: 98, protein: 3.4, carbs: 3.0, fat: 8.9 },
  { id: 'f7', name: 'Raw Almonds', category: 'Fats', servingText: '100g', servingSizeGrams: 100, calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9 },
  { id: 'f8', name: 'Raw Walnuts', category: 'Fats', servingText: '100g', servingSizeGrams: 100, calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2 },
  { id: 'f9', name: 'Raw Cashews', category: 'Fats', servingText: '100g', servingSizeGrams: 100, calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8 },
  { id: 'f10', name: 'Chia Seeds', category: 'Fats', servingText: '1 tbsp (12g)', servingSizeGrams: 12, calories: 58, protein: 2.0, carbs: 5.0, fat: 3.7 },
  { id: 'f11', name: 'Flaxseeds (Ground)', category: 'Fats', servingText: '1 tbsp (7g)', servingSizeGrams: 7, calories: 37, protein: 1.3, carbs: 2.0, fat: 3.0 },
  { id: 'f12', name: 'Pumpkin Seeds (Pepitas)', category: 'Fats', servingText: '30g', servingSizeGrams: 30, calories: 170, protein: 9.0, carbs: 3.0, fat: 14.0 },
  { id: 'f13', name: 'Macadamia Nuts', category: 'Fats', servingText: '30g', servingSizeGrams: 30, calories: 215, protein: 2.4, carbs: 4.0, fat: 22.0 },
  { id: 'f14', name: 'Mayonnaise (Regular)', category: 'Fats', servingText: '1 tbsp (14g)', servingSizeGrams: 14, calories: 94, protein: 0.1, carbs: 0.1, fat: 10.3 },

  // --- DAIRY ---
  { id: 'd1', name: 'Greek Yogurt (Plain, 0% Fat)', category: 'Dairy', servingText: '100g', servingSizeGrams: 100, calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4 },
  { id: 'd2', name: 'Greek Yogurt (Plain, 2% Fat)', category: 'Dairy', servingText: '100g', servingSizeGrams: 100, calories: 73, protein: 9.0, carbs: 4.0, fat: 2.0 },
  { id: 'd3', name: 'Cottage Cheese (1% Low Fat)', category: 'Dairy', servingText: '100g', servingSizeGrams: 100, calories: 72, protein: 12.4, carbs: 2.7, fat: 1.0 },
  { id: 'd4', name: 'Cottage Cheese (4% Full Fat)', category: 'Dairy', servingText: '100g', servingSizeGrams: 100, calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3 },
  { id: 'd5', name: 'Whole Milk (3.25% Fat)', category: 'Dairy', servingText: '240ml', servingSizeGrams: 240, calories: 149, protein: 7.7, carbs: 11.7, fat: 7.9 },
  { id: 'd6', name: 'Skim Milk (0% Fat)', category: 'Dairy', servingText: '240ml', servingSizeGrams: 240, calories: 83, protein: 8.3, carbs: 12.2, fat: 0.2 },
  { id: 'd7', name: 'Cheddar Cheese (Shredded)', category: 'Dairy', servingText: '30g', servingSizeGrams: 30, calories: 115, protein: 7.0, carbs: 0.4, fat: 9.4 },
  { id: 'd8', name: 'Mozzarella Cheese (Part-Skim)', category: 'Dairy', servingText: '30g', servingSizeGrams: 30, calories: 72, protein: 7.0, carbs: 0.8, fat: 4.5 },
  { id: 'd9', name: 'Parmesan Cheese (Grated)', category: 'Dairy', servingText: '1 tbsp (5g)', servingSizeGrams: 5, calories: 22, protein: 1.9, carbs: 0.2, fat: 1.4 },
  { id: 'd10', name: 'Soy Milk (Unsweetened)', category: 'Dairy', servingText: '240ml', servingSizeGrams: 240, calories: 80, protein: 7.0, carbs: 4.0, fat: 4.0 },
  { id: 'd11', name: 'Almond Milk (Unsweetened)', category: 'Dairy', servingText: '240ml', servingSizeGrams: 240, calories: 30, protein: 1.0, carbs: 1.0, fat: 2.5 },
  { id: 'd12', name: 'Oat Milk (Unsweetened)', category: 'Dairy', servingText: '240ml', servingSizeGrams: 240, calories: 120, protein: 3.0, carbs: 16.0, fat: 5.0 },
  { id: 'd13', name: 'Feta Cheese', category: 'Dairy', servingText: '30g', servingSizeGrams: 30, calories: 75, protein: 4.0, carbs: 1.0, fat: 6.0 },

  // --- FRUITS & VEG ---
  { id: 'v1', name: 'Banana', category: 'Fruits & Veg', servingText: '1 medium (118g)', servingSizeGrams: 118, calories: 105, protein: 1.3, carbs: 27.0, fat: 0.4 },
  { id: 'v2', name: 'Apple (with skin)', category: 'Fruits & Veg', servingText: '1 medium (182g)', servingSizeGrams: 182, calories: 95, protein: 0.5, carbs: 25.1, fat: 0.3 },
  { id: 'v3', name: 'Blueberries (Fresh)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
  { id: 'v4', name: 'Strawberries (Fresh)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { id: 'v5', name: 'Orange', category: 'Fruits & Veg', servingText: '1 medium (131g)', servingSizeGrams: 131, calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2 },
  { id: 'v6', name: 'Hass Avocado', category: 'Fruits & Veg', servingText: '1 medium (150g)', servingSizeGrams: 150, calories: 240, protein: 3.0, carbs: 12.0, fat: 22.0 },
  { id: 'v7', name: 'Spinach (Raw)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: 'v8', name: 'Broccoli (Raw)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4 },
  { id: 'v9', name: 'Asparagus (Raw)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 },
  { id: 'v10', name: 'Green Beans (Raw)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 31, protein: 1.8, carbs: 7.0, fat: 0.2 },
  { id: 'v11', name: 'Carrots (Raw)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
  { id: 'v12', name: 'Cucumber (with skin)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { id: 'v13', name: 'Roma Tomato', category: 'Fruits & Veg', servingText: '1 medium (62g)', servingSizeGrams: 62, calories: 11, protein: 0.6, carbs: 2.4, fat: 0.1 },
  { id: 'v14', name: 'Red Bell Pepper (Raw)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 31, protein: 1.0, carbs: 6.0, fat: 0.3 },
  { id: 'v15', name: 'Pineapple (Chunks)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 50, protein: 0.5, carbs: 13.0, fat: 0.1 },
  { id: 'v16', name: 'Watermelon', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2 },
  { id: 'v17', name: 'Grapefruit', category: 'Fruits & Veg', servingText: '1 half (120g)', servingSizeGrams: 120, calories: 52, protein: 0.9, carbs: 13.0, fat: 0.2 },
  { id: 'v18', name: 'White Button Mushrooms', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  { id: 'v19', name: 'Zucchini (Raw)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { id: 'v20', name: 'Kale (Raw)', category: 'Fruits & Veg', servingText: '100g', servingSizeGrams: 100, calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9 },

  // --- SNACKS, BEVERAGES & EXTRAS (with Pakistani Local Items) ---
  { id: 's1', name: 'Dark Chocolate (70-85% Cacao)', category: 'Snacks & Extras', servingText: '30g', servingSizeGrams: 30, calories: 170, protein: 2.2, carbs: 13.5, fat: 12.0 },
  { id: 's2', name: 'Pure Honey', category: 'Snacks & Extras', servingText: '1 tbsp (21g)', servingSizeGrams: 21, calories: 64, protein: 0.1, carbs: 17.3, fat: 0.0 },
  { id: 's3', name: 'Maple Syrup', category: 'Snacks & Extras', servingText: '1 tbsp (20g)', servingSizeGrams: 20, calories: 52, protein: 0.0, carbs: 13.4, fat: 0.0 },
  { id: 's4', name: 'Popcorn (Air-Popped)', category: 'Snacks & Extras', servingText: '3 cups (24g)', servingSizeGrams: 24, calories: 93, protein: 3.0, carbs: 18.6, fat: 1.1 },
  { id: 's5', name: 'Protein Bar (Averaged)', category: 'Snacks & Extras', servingText: '1 bar (60g)', servingSizeGrams: 60, calories: 220, protein: 20.0, carbs: 22.0, fat: 7.0, isQuantity: true, servingUnit: 'bar' },
  { id: 's6', name: 'White Sugar', category: 'Snacks & Extras', servingText: '1 tsp (4g)', servingSizeGrams: 4, calories: 16, protein: 0.0, carbs: 4.2, fat: 0.0 },
  { id: 's7', name: 'Soy Sauce', category: 'Snacks & Extras', servingText: '1 tbsp (15g)', servingSizeGrams: 15, calories: 10, protein: 1.4, carbs: 1.0, fat: 0.1 },
  { id: 's8', name: 'Ketchup', category: 'Snacks & Extras', servingText: '1 tbsp (17g)', servingSizeGrams: 17, calories: 19, protein: 0.2, carbs: 4.5, fat: 0.0 },
  { id: 's9', name: 'Yellow Mustard', category: 'Snacks & Extras', servingText: '1 tsp (5g)', servingSizeGrams: 5, calories: 3, protein: 0.2, carbs: 0.3, fat: 0.2 },
  { id: 's10', name: 'Hummus (Classic)', category: 'Snacks & Extras', servingText: '1 tbsp (15g)', servingSizeGrams: 15, calories: 25, protein: 1.2, carbs: 2.0, fat: 1.4 },
  { id: 's11', name: 'Mixed Olives', category: 'Snacks & Extras', servingText: '5 olives (15g)', servingSizeGrams: 15, calories: 22, protein: 0.1, carbs: 0.6, fat: 2.2 },
  { id: 's12', name: 'Beef Jerky', category: 'Snacks & Extras', servingText: '30g', servingSizeGrams: 30, calories: 116, protein: 9.9, carbs: 3.3, fat: 7.6 },
  { id: 's13', name: 'Granola Bar (Oats & Honey)', category: 'Snacks & Extras', servingText: '1 bar (21g)', servingSizeGrams: 21, calories: 95, protein: 2.0, carbs: 15.0, fat: 3.0, isQuantity: true, servingUnit: 'bar' },
  
  // --- PAKISTANI SNACKS & LOCAL SNACKS ---
  { id: 'pk1', name: 'Lays Masala / Salted (Rs. 30 Pack)', category: 'Snacks & Extras', servingText: '1 pack (22g)', servingSizeGrams: 22, calories: 114, protein: 1.4, carbs: 11.5, fat: 6.8, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk2', name: 'Lays Masala / Salted (Rs. 50 Pack)', category: 'Snacks & Extras', servingText: '1 pack (40g)', servingSizeGrams: 40, calories: 208, protein: 2.6, carbs: 21.0, fat: 12.4, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk3', name: 'Kurkure Red Chili / Chutney Chaska (Rs. 30 Pack)', category: 'Snacks & Extras', servingText: '1 pack (25g)', servingSizeGrams: 25, calories: 130, protein: 1.8, carbs: 15.2, fat: 7.2, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk4', name: 'Peek Freans Sooper Biscuit (Rs. 20 Pack)', category: 'Snacks & Extras', servingText: '1 pack (24g)', servingSizeGrams: 24, calories: 117, protein: 1.5, carbs: 16.8, fat: 5.1, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk5', name: 'Peek Freans Sooper Biscuit (Rs. 50 Pack)', category: 'Snacks & Extras', servingText: '1 pack (66g)', servingSizeGrams: 66, calories: 322, protein: 4.1, carbs: 46.2, fat: 14.0, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk6', name: 'Peek Freans Super Biscuit (Rs. 20 Pack)', category: 'Snacks & Extras', servingText: '1 pack (22g)', servingSizeGrams: 22, calories: 104, protein: 1.2, carbs: 15.8, fat: 4.2, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk7', name: 'Prince Chocolate Biscuits (Rs. 20 Pocket Pack)', category: 'Snacks & Extras', servingText: '1 pack (28g - 4 biscuits)', servingSizeGrams: 28, calories: 136, protein: 1.5, carbs: 20.2, fat: 5.5, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk8', name: 'Gala Biscuit (Rs. 20 Pack)', category: 'Snacks & Extras', servingText: '1 pack (30g)', servingSizeGrams: 30, calories: 140, protein: 1.8, carbs: 22.2, fat: 5.2, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk9', name: 'Rio Biscuit (Rs. 20 Pocket Pack)', category: 'Snacks & Extras', servingText: '1 pack (28g)', servingSizeGrams: 28, calories: 131, protein: 1.4, carbs: 18.8, fat: 5.6, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk10', name: 'Candi Biscuit (Rs. 20 Pocket Pack)', category: 'Snacks & Extras', servingText: '1 pack (35g)', servingSizeGrams: 35, calories: 161, protein: 1.8, carbs: 25.9, fat: 5.8, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk11', name: 'LU Tuck Biscuit (Rs. 20 Pocket Pack)', category: 'Snacks & Extras', servingText: '1 pack (24g)', servingSizeGrams: 24, calories: 118, protein: 1.5, carbs: 16.8, fat: 5.0, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk12', name: 'LU Tuck Biscuit (Rs. 50 Half Roll Pack)', category: 'Snacks & Extras', servingText: '1 pack (48g)', servingSizeGrams: 48, calories: 236, protein: 3.0, carbs: 33.6, fat: 10.0, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk13', name: 'Rio Chocolate Biscuit (Rs. 20 Pocket Pack)', category: 'Snacks & Extras', servingText: '1 pack (28g)', servingSizeGrams: 28, calories: 134, protein: 1.5, carbs: 19.5, fat: 5.6, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk14', name: 'Rio Chocolate Biscuit (Rs. 50 Pack)', category: 'Snacks & Extras', servingText: '1 pack (65g)', servingSizeGrams: 65, calories: 311, protein: 3.5, carbs: 45.3, fat: 13.0, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk15', name: 'Candi Biscuit (Rs. 50 Pack)', category: 'Snacks & Extras', servingText: '1 pack (66g)', servingSizeGrams: 66, calories: 304, protein: 3.4, carbs: 48.8, fat: 10.9, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk16', name: 'Cocomo Chocolate Biscuits (Rs. 10 Pack)', category: 'Snacks & Extras', servingText: '1 pack (10g)', servingSizeGrams: 10, calories: 48, protein: 0.6, carbs: 6.8, fat: 2.0, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk17', name: 'Cocomo Chocolate Biscuits (Rs. 20 Pack)', category: 'Snacks & Extras', servingText: '1 pack (22g)', servingSizeGrams: 22, calories: 105, protein: 1.3, carbs: 15.0, fat: 4.4, isQuantity: true, servingUnit: 'pack' },
  { id: 'pk18', name: 'Cocomo Chocolate Biscuits (Rs. 50 Pack)', category: 'Snacks & Extras', servingText: '1 pack (55g)', servingSizeGrams: 55, calories: 262, protein: 3.2, carbs: 37.5, fat: 11.0, isQuantity: true, servingUnit: 'pack' },

  // --- LOCAL PAKISTANI DRINKS & HOT BEVERAGES ---
  { id: 'pk_tea1', name: 'Mixed Chai (Pakistani tea with whole milk & 1 tsp sugar)', category: 'Snacks & Extras', servingText: '1 cup (150ml)', servingSizeGrams: 150, calories: 92, protein: 2.1, carbs: 11.5, fat: 3.2, isQuantity: true, servingUnit: 'cup' },
  { id: 'pk_tea2', name: 'Doodh Patti Chai (Tea boiled in pure whole milk with 1 tsp sugar)', category: 'Snacks & Extras', servingText: '1 cup (150ml)', servingSizeGrams: 150, calories: 132, protein: 3.8, carbs: 14.8, fat: 5.8, isQuantity: true, servingUnit: 'cup' },
  { id: 'pk_tea3', name: 'Black Tea (No milk, no sugar)', category: 'Snacks & Extras', servingText: '1 cup (150ml)', servingSizeGrams: 150, calories: 2, protein: 0.1, carbs: 0.2, fat: 0.0, isQuantity: true, servingUnit: 'cup' },
  { id: 'pk_tea4', name: 'Green Tea / Kahwa (No sugar)', category: 'Snacks & Extras', servingText: '1 cup (150ml)', servingSizeGrams: 150, calories: 2, protein: 0.0, carbs: 0.1, fat: 0.0, isQuantity: true, servingUnit: 'cup' },
  { id: 'pk_coff1', name: 'Black Coffee (No milk, no sugar)', category: 'Snacks & Extras', servingText: '1 cup (150ml)', servingSizeGrams: 150, calories: 2, protein: 0.1, carbs: 0.0, fat: 0.0, isQuantity: true, servingUnit: 'cup' },
  { id: 'pk_coff2', name: 'Instant Coffee (with milk & 1 tsp sugar)', category: 'Snacks & Extras', servingText: '1 cup (150ml)', servingSizeGrams: 150, calories: 48, protein: 1.0, carbs: 6.2, fat: 1.5, isQuantity: true, servingUnit: 'cup' },

  // --- NEW LOCAL PAKISTANI FOODS & SNACKS (QUANTITY-BASED & TRADITIONAL) ---
  { id: 'pk_momo', name: "Momo's (Chicken/Beef Dumplings)", category: 'Snacks & Extras', servingText: '1 plate (6 pcs)', servingSizeGrams: 150, calories: 270, protein: 12.0, carbs: 40.0, fat: 6.0, isQuantity: true, servingUnit: 'plate' },
  { id: 'pk_samosa', name: 'Samosa (Potato & Peas / Keema)', category: 'Snacks & Extras', servingText: '1 piece', servingSizeGrams: 80, calories: 250, protein: 4.0, carbs: 24.0, fat: 15.0, isQuantity: true, servingUnit: 'piece' },
  { id: 'pk_pizza', name: 'Pizza Slice (Chicken Tikka / Fajita)', category: 'Snacks & Extras', servingText: '1 slice', servingSizeGrams: 100, calories: 285, protein: 12.0, carbs: 32.0, fat: 11.0, isQuantity: true, servingUnit: 'slice' },
  { id: 'pk_burger', name: 'Burger (Shami Burger / Chicken Patout)', category: 'Snacks & Extras', servingText: '1 burger', servingSizeGrams: 150, calories: 360, protein: 16.0, carbs: 38.0, fat: 15.0, isQuantity: true, servingUnit: 'burger' },
  { id: 'pk_fries', name: 'French Fries (Pakistani Masala Fries)', category: 'Snacks & Extras', servingText: '1 plate', servingSizeGrams: 150, calories: 420, protein: 4.5, carbs: 54.0, fat: 20.0, isQuantity: true, servingUnit: 'plate' },
  { id: 'pk_icecream', name: 'Ice Cream (Kulfa / Vanilla / Chocolate)', category: 'Snacks & Extras', servingText: '1 scoop', servingSizeGrams: 75, calories: 150, protein: 3.0, carbs: 18.0, fat: 8.0, isQuantity: true, servingUnit: 'scoop' },
  { id: 'pk_colddrink', name: 'Cold Drink Glass (Cola / Lemon-Lime)', category: 'Snacks & Extras', servingText: '1 glass (250ml)', servingSizeGrams: 250, calories: 100, protein: 0.0, carbs: 25.0, fat: 0.0, isQuantity: true, servingUnit: 'glass' },
  { id: 'pk_lassi', name: 'Sweet Lassi (Yogurt Drink)', category: 'Dairy', servingText: '1 glass (300ml)', servingSizeGrams: 300, calories: 220, protein: 6.0, carbs: 24.0, fat: 10.0, isQuantity: true, servingUnit: 'glass' },
  
  // --- MILKSHAKES (MULTIPLE GLASSES) ---
  { id: 'pk_shake_banana', name: 'Banana Milkshake', category: 'Snacks & Extras', servingText: '1 glass (300ml)', servingSizeGrams: 300, calories: 250, protein: 7.0, carbs: 45.0, fat: 6.0, isQuantity: true, servingUnit: 'glass' },
  { id: 'pk_shake_mango', name: 'Mango Milkshake', category: 'Snacks & Extras', servingText: '1 glass (300ml)', servingSizeGrams: 300, calories: 280, protein: 6.0, carbs: 50.0, fat: 7.0, isQuantity: true, servingUnit: 'glass' },
  { id: 'pk_shake_chocolate', name: 'Chocolate Milkshake', category: 'Snacks & Extras', servingText: '1 glass (300ml)', servingSizeGrams: 300, calories: 320, protein: 8.0, carbs: 52.0, fat: 10.0, isQuantity: true, servingUnit: 'glass' },
  { id: 'pk_shake_strawberry', name: 'Strawberry Milkshake', category: 'Snacks & Extras', servingText: '1 glass (300ml)', servingSizeGrams: 300, calories: 260, protein: 6.0, carbs: 46.0, fat: 6.0, isQuantity: true, servingUnit: 'glass' },
  { id: 'pk_shake_oreo', name: 'Oreo Milkshake', category: 'Snacks & Extras', servingText: '1 glass (300ml)', servingSizeGrams: 300, calories: 380, protein: 8.0, carbs: 58.0, fat: 14.0, isQuantity: true, servingUnit: 'glass' },

  // --- PAKISTANI MAIN DISHES & BREADS ---
  { id: 'pk_nihari', name: 'Nihari (Beef Stew)', category: 'Proteins', servingText: '1 plate (300g)', servingSizeGrams: 300, calories: 450, protein: 28.0, carbs: 10.0, fat: 32.0, isQuantity: true, servingUnit: 'plate' },
  { id: 'pk_karahi', name: 'Chicken Karahi', category: 'Proteins', servingText: '1 plate (250g)', servingSizeGrams: 250, calories: 380, protein: 30.0, carbs: 5.0, fat: 26.0, isQuantity: true, servingUnit: 'plate' },
  { id: 'pk_daalchawal', name: 'Daal Chawal (Lentils & Rice)', category: 'Carbohydrates', servingText: '1 plate (350g)', servingSizeGrams: 350, calories: 390, protein: 13.0, carbs: 70.0, fat: 6.0, isQuantity: true, servingUnit: 'plate' },
  { id: 'pk_naan', name: 'Naan (Tandoori Roti)', category: 'Carbohydrates', servingText: '1 naan', servingSizeGrams: 120, calories: 310, protein: 8.5, carbs: 60.0, fat: 3.0, isQuantity: true, servingUnit: 'naan' },
  { id: 'pk_chapati', name: 'Chapati (Ghar ki Roti)', category: 'Carbohydrates', servingText: '1 chapati', servingSizeGrams: 60, calories: 150, protein: 5.0, carbs: 30.0, fat: 1.0, isQuantity: true, servingUnit: 'chapati' },
  { id: 'pk_paratha', name: 'Plain Paratha (Tawa)', category: 'Carbohydrates', servingText: '1 paratha', servingSizeGrams: 80, calories: 290, protein: 5.5, carbs: 38.0, fat: 12.0, isQuantity: true, servingUnit: 'paratha' },
  { id: 'pk_andaparatha', name: 'Anda Paratha Roll', category: 'Proteins', servingText: '1 roll', servingSizeGrams: 130, calories: 420, protein: 12.0, carbs: 40.0, fat: 22.0, isQuantity: true, servingUnit: 'roll' },
  { id: 'pk_cheeseparatha', name: 'Cheese Paratha', category: 'Dairy', servingText: '1 paratha', servingSizeGrams: 120, calories: 450, protein: 14.0, carbs: 42.0, fat: 24.0, isQuantity: true, servingUnit: 'paratha' },
  { id: 'pk_chickenparatha', name: 'Chicken Paratha', category: 'Proteins', servingText: '1 paratha', servingSizeGrams: 150, calories: 480, protein: 20.0, carbs: 45.0, fat: 22.0, isQuantity: true, servingUnit: 'paratha' }
];
